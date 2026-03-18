// src/shared/api/database.types.ts
// Supabase DB 테이블 타입 정의

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: ([number, number] | [number, number, number])[]; // [lng, lat] 또는 [lng, lat, elevation]
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          kakao_id: string | null;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          kakao_id?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          kakao_id?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      running_records: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          finished_at: string | null;
          distance_meters: number | null;
          duration_seconds: number | null;
          avg_pace_sec_per_km: number | null;
          route_geojson: GeoJSONLineString | null;
          planned_route_geojson: GeoJSONLineString | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at: string;
          finished_at?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          avg_pace_sec_per_km?: number | null;
          route_geojson?: GeoJSONLineString | null;
          planned_route_geojson?: GeoJSONLineString | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          started_at?: string;
          finished_at?: string | null;
          distance_meters?: number | null;
          duration_seconds?: number | null;
          avg_pace_sec_per_km?: number | null;
          route_geojson?: GeoJSONLineString | null;
          planned_route_geojson?: GeoJSONLineString | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
