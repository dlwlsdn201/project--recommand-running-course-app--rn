// src/features/running/hooks/useSaveRunningRecord.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/features/auth/store/authStore';
import { latLngArrayToGeojson } from '@/shared/lib/routeParser';
import type { LatLng } from '@/shared/lib/routeParser';
import type { GeoJSONLineString } from '@/shared/api/database.types';

interface SaveRunningPayload {
  startedAt: Date;
  trackedCoords: LatLng[];
  elapsedSeconds: number;
  distanceMeters: number;
  plannedRouteGeojson: GeoJSONLineString | null;
}

export function useSaveRunningRecord() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveRunningPayload) => {
      if (!user?.id) throw new Error('로그인이 필요합니다.');

      const avgPace =
        payload.distanceMeters > 0
          ? Math.round(payload.elapsedSeconds / (payload.distanceMeters / 1000))
          : null;

      // profiles 행이 없을 경우(트리거 실행 전 가입 유저) 자동 생성
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('profiles').upsert(
        { id: user.id },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      // Use 'as any' to work around the gap between our hand-written Database type
      // and the strict generic types expected by @supabase/supabase-js v2.99.
      // The actual insert payload is structurally correct with the Supabase schema.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('running_records').insert({
        user_id: user.id,
        started_at: payload.startedAt.toISOString(),
        finished_at: new Date().toISOString(),
        distance_meters: payload.distanceMeters,
        duration_seconds: payload.elapsedSeconds,
        avg_pace_sec_per_km: avgPace,
        route_geojson: latLngArrayToGeojson(payload.trackedCoords),
        planned_route_geojson: payload.plannedRouteGeojson,
      }) as { error: { message: string } | null };

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      // 히스토리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['running-history'], exact: false });
    },
  });
}
