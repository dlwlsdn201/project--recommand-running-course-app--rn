import type { GeoJSONLineString } from '@/shared/api/database.types';
import type { RadiusOption } from '@/shared/config/constants';

export interface CourseOptions {
  radiusMeters: RadiusOption;
  targetDistanceKm: number;
  originLatitude: number;
  originLongitude: number;
}

export interface GeneratedCourse {
  routeGeojson: GeoJSONLineString;
  totalDistanceMeters: number;
  estimatedDurationSeconds: number;
  waypoints: [number, number][]; // [lng, lat]
}

export type CourseGenerationStatus = 'idle' | 'generating' | 'ready' | 'error';
