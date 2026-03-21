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

/** N개 경유점 루프의 직선거리 배율 × 도로 우회 계수(1.35) */
function calcLoopRoadFactor(numPoints: number): number {
  const straight = 2 + (numPoints - 1) * 2 * Math.sin(Math.PI / numPoints);
  return straight * 1.35;
}

interface WaypointOffset {
  angle: number;
  relDist: number; // 반경 대비 상대 거리 (0.85 ~ 1.15)
}

/** 루프 형태를 결정하는 랜덤 오프셋을 1회 생성 (반복 조정 시 형태 유지) */
function generateOffsets(numPoints: number): WaypointOffset[] {
  return Array.from({ length: numPoints }, (_, i) => ({
    angle: (i / numPoints) * 2 * Math.PI + (Math.random() * Math.PI) / numPoints,
    relDist: 0.85 + Math.random() * 0.3,
  }));
}

/** 오프셋 + 반경 → 실제 경유점 좌표 */
function offsetsToWaypoints(
  lat: number,
  lng: number,
  offsets: WaypointOffset[],
  radiusMeters: number
): [number, number][] {
  const cosLat = Math.cos((lat * Math.PI) / 180);
  return offsets.map(({ angle, relDist }) => {
    const d = radiusMeters * relDist;
    const dLat = (d * Math.cos(angle)) / 111_320;
    const dLng = (d * Math.sin(angle)) / (111_320 * cosLat);
    return [lng + dLng, lat + dLat];
  });
}

/** Mapbox Directions API 호출 */
async function callMapbox(
  lat: number,
  lng: number,
  waypoints: [number, number][],
  signal: AbortSignal
): Promise<{ geometry: GeoJSONLineString; distance: number; duration: number }> {
  const origin = `${lng},${lat}`;
  const coordinates = [origin, ...waypoints.map((w) => w.join(',')), origin].join(';');

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/${MAPBOX_ROUTING_PROFILE}/${coordinates}`
  );
  url.searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('overview', 'full');
  url.searchParams.set('exclude', MAPBOX_ROUTING_EXCLUDE);
  url.searchParams.set('annotations', 'distance,duration');

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) throw new Error(`Mapbox API 오류: ${response.status}`);

  const data = (await response.json()) as {
    routes?: Array<{ geometry: GeoJSONLineString; distance: number; duration: number }>;
  };

  const route = data.routes?.[0];
  if (!route) throw new Error('경로를 생성할 수 없습니다.');
  return route;
}

/**
 * 목표 거리에 맞는 안전한 Loop 러닝 코스 생성
 *
 * 오프셋(루프 형태)을 1회 고정 후 반경만 반복 조정.
 * 비례 스케일링으로 보통 2-3회 내 수렴, 최대 6회 반복.
 * 매 회 최솟값 결과를 추적하여 10m 이내 가장 가까운 결과 반환.
 */
async function fetchSafeRoute(options: CourseOptions): Promise<GeneratedCourse> {
  const { originLatitude: lat, originLongitude: lng, radiusMeters, targetDistanceKm } = options;

  const MAX_ITERATIONS = 6;
  const TOLERANCE_METERS = 10;
  const targetMeters = targetDistanceKm * 1000;

  const numPoints = Math.min(3 + Math.floor(targetDistanceKm / 3), 5);
  // 루프 형태(각도/상대거리)를 1회 고정 → 반복 시 형태 유지하며 반경만 조정
  const offsets = generateOffsets(numPoints);
  // 초기 반경: 목표 거리 역산값과 사용자 선택 반경 중 작은 값
  let radius = Math.min(targetMeters / calcLoopRoadFactor(numPoints), radiusMeters);

  // MAX_ITERATIONS 회 호출을 커버할 수 있는 총 타임아웃
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS * MAX_ITERATIONS);

  type RouteResult = { geometry: GeoJSONLineString; distance: number; duration: number };
  let bestRoute: RouteResult | null = null;
  let bestWaypoints: [number, number][] = [];
  let bestDiff = Infinity;

  try {
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      const waypoints = offsetsToWaypoints(lat, lng, offsets, radius);
      const route = await callMapbox(lat, lng, waypoints, controller.signal);

      const diff = Math.abs(route.distance - targetMeters);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestRoute = route;
        bestWaypoints = waypoints;
      }

      if (diff <= TOLERANCE_METERS) break;

      // 비례 스케일링: distance ∝ radius 가정 → 1-2회 내 수렴
      radius *= targetMeters / route.distance;
    }

    if (!bestRoute) throw new Error('경로를 생성할 수 없습니다.');

    // 예상 시간: 평균 페이스 7분 30초/km(450초/km) 기준 계산
    const AVERAGE_PACE_SEC_PER_KM = 450;
    const estimatedDurationSeconds = (bestRoute.distance / 1000) * AVERAGE_PACE_SEC_PER_KM;

    return {
      routeGeojson: bestRoute.geometry,
      totalDistanceMeters: bestRoute.distance,
      estimatedDurationSeconds,
      elevationGainMeters: calcElevationGainMeters(bestRoute.geometry),
      waypoints: bestWaypoints,
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
