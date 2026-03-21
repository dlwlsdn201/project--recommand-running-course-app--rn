// src/shared/config/constants.ts
// No magic numbers — all constant values are managed here

// ─── Course radius options (in meters) ──────────────────────────────────────
export const RADIUS_OPTIONS = [500, 1000, 5000] as const;
export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

export const RADIUS_LABELS: Record<RadiusOption, string> = {
  500: '500m',
  1000: '1km',
  5000: '5km',
};

// ─── Target distance settings (in kilometers) ───────────────────────────────
export const MIN_TARGET_DISTANCE_KM = 1;
export const MAX_TARGET_DISTANCE_KM = 10;
export const TARGET_DISTANCE_STEP_KM = 1;
export const DEFAULT_TARGET_DISTANCE_KM = 5;

// ─── Map settings ────────────────────────────────────────────────────────────
export const MAP_DEFAULT_ZOOM = 14;
export const MAP_TRACKING_ZOOM = 16;
export const MAP_3D_PITCH = 60;
export const MAP_DEFAULT_LATITUDE_DELTA = 0.01;
export const MAP_DEFAULT_LONGITUDE_DELTA = 0.01;

// ─── Mapbox safe routing settings (PRD required) ────────────────────────────
// Must use pedestrian profile; walking profile valid excludes: ferry, motorway, toll
export const MAPBOX_ROUTING_PROFILE = 'walking' as const;
export const MAPBOX_ROUTING_EXCLUDE = 'ferry' as const;
export const MAPBOX_ROUTING_GEOMETRIES = 'geojson' as const;
export const MAPBOX_ROUTING_OVERVIEW = 'full' as const;

// ─── API settings ────────────────────────────────────────────────────────────
export const API_TIMEOUT_MS = 10_000;
export const REACT_QUERY_STALE_TIME_MS = 5 * 60 * 1_000; // 5 minutes

// ─── GPS tracking settings ───────────────────────────────────────────────────
export const GPS_UPDATE_INTERVAL_MS = 3_000;
export const GPS_DISTANCE_INTERVAL_METERS = 5;

// ─── Running calculation constants ───────────────────────────────────────────
export const METERS_PER_KM = 1_000;
export const EARTH_RADIUS_METERS = 6_371_000;
