// src/shared/lib/routeParser.ts
import type { GeoJSONLineString } from '@/shared/api/database.types';
import { EARTH_RADIUS_METERS } from '@/shared/config/constants';

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * GeoJSON LineString → react-native-maps 호환 LatLng 배열 변환
 * GeoJSON 좌표 순서: [lng, lat] → react-native-maps: { latitude, longitude }
 */
export function geojsonToLatLngArray(geojson: GeoJSONLineString): LatLng[] {
  return geojson.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

/**
 * GeoJSON LineString 좌표의 고도 데이터(z값)로부터 누적 상승 고도 계산 (미터 단위)
 * 3D 좌표 [lng, lat, elevation]가 없으면 0 반환
 */
export function calcElevationGainMeters(geojson: GeoJSONLineString): number {
  let gain = 0;
  const coords = geojson.coordinates;
  for (let i = 1; i < coords.length; i++) {
    const prevElev = coords[i - 1][2];
    const currElev = coords[i][2];
    if (prevElev !== undefined && currElev !== undefined) {
      const diff = currElev - prevElev;
      if (diff > 0) gain += diff;
    }
  }
  return Math.round(gain);
}

/**
 * LatLng 배열 → GeoJSON LineString 변환
 */
export function latLngArrayToGeojson(coords: LatLng[]): GeoJSONLineString {
  return {
    type: 'LineString',
    coordinates: coords.map(({ longitude, latitude }) => [longitude, latitude]),
  };
}

/**
 * 두 좌표 간 거리 계산 (Haversine formula, 미터 단위)
 */
export function calcDistanceMeters(a: LatLng, b: LatLng): number {
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/**
 * LatLng 배열의 총 경로 거리 계산 (미터 단위)
 */
export function calcTotalDistanceMeters(coords: LatLng[]): number {
  if (coords.length < 2) return 0;
  return coords.reduce((total, coord, i) => {
    if (i === 0) return 0;
    return total + calcDistanceMeters(coords[i - 1], coord);
  }, 0);
}
