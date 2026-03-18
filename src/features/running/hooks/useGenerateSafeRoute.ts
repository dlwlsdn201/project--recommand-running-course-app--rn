// src/features/running/hooks/useGenerateSafeRoute.ts
import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import env from '@/shared/config/env';
import {
  MAPBOX_ROUTING_PROFILE,
  MAPBOX_ROUTING_EXCLUDE,
  API_TIMEOUT_MS,
} from '@/shared/config/constants';
import { calcElevationGainMeters } from '@/shared/lib/routeParser';
import type { CourseOptions, GeneratedCourse } from '../types/route.types';
import type { GeoJSONLineString } from '@/shared/api/database.types';

/**
 * 지정된 반경 내 랜덤 경유 지점 생성
 * 기준 좌표 주변의 임의의 방향과 거리로 3-4개 경유점 계산
 * [PRD 요구사항] 시작점과 종료점이 동일한 순환형(Loop) 러닝 코스 생성
 */
function generateRandomWaypoints(
  lat: number,
  lng: number,
  radiusMeters: number,
  targetDistanceKm: number
): [number, number][] {
  const numPoints = Math.min(3 + Math.floor(targetDistanceKm / 3), 5);
  const points: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI + (Math.random() * Math.PI) / numPoints;
    // 반경의 60-90% 범위 내 임의 거리
    const distance = radiusMeters * (0.6 + Math.random() * 0.3);
    const deltaLat = (distance * Math.cos(angle)) / 111_320;
    const deltaLng =
      (distance * Math.sin(angle)) / (111_320 * Math.cos((lat * Math.PI) / 180));
    points.push([lng + deltaLng, lat + deltaLat]);
  }

  return points;
}

async function fetchSafeRoute(options: CourseOptions): Promise<GeneratedCourse> {
  const { originLatitude: lat, originLongitude: lng, radiusMeters, targetDistanceKm } = options;
  const waypoints = generateRandomWaypoints(lat, lng, radiusMeters, targetDistanceKm);

  // 시작점과 종료점을 동일하게 설정 (Loop 코스)
  const origin = `${lng},${lat}`;
  const coordinates = [origin, ...waypoints.map((w) => w.join(',')), origin].join(';');

  // [PRD 중요] 보행자 프로필 + 비포장도로 제외 (PRD 안전 라우팅 규칙)
  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/${MAPBOX_ROUTING_PROFILE}/${coordinates}`
  );
  url.searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('overview', 'full');
  url.searchParams.set('exclude', MAPBOX_ROUTING_EXCLUDE);
  url.searchParams.set('annotations', 'distance,duration');
  url.searchParams.set('elevation', 'true');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) throw new Error(`Mapbox API 오류: ${response.status}`);

    const data = (await response.json()) as {
      routes?: Array<{
        geometry: GeoJSONLineString;
        distance: number;
        duration: number;
      }>;
    };

    const route = data.routes?.[0];
    if (!route) throw new Error('경로를 생성할 수 없습니다.');

    return {
      routeGeojson: route.geometry,
      totalDistanceMeters: route.distance,
      estimatedDurationSeconds: route.duration,
      elevationGainMeters: calcElevationGainMeters(route.geometry),
      waypoints,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function useGenerateSafeRoute() {
  const [course, setCourse] = useState<GeneratedCourse | null>(null);

  const mutation = useMutation({
    mutationFn: fetchSafeRoute,
    onSuccess: (data) => setCourse(data),
  });

  const generateCourse = useCallback(
    (options: CourseOptions) => mutation.mutate(options),
    [mutation]
  );

  const reset = useCallback(() => {
    setCourse(null);
    mutation.reset();
  }, [mutation]);

  return {
    course,
    generateCourse,
    regenerateCourse: generateCourse,
    reset,
    status: mutation.status,
    error: mutation.error,
    isGenerating: mutation.isPending,
  };
}
