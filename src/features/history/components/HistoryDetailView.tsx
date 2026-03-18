// src/features/history/components/HistoryDetailView.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { geojsonToLatLngArray } from '@/shared/lib/routeParser';
import { formatDuration, formatPace, metersToKm } from '@/shared/lib/formatters';
import type { RunningRecord } from '../types/history.types';

interface HistoryDetailViewProps {
  record: RunningRecord;
}

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
}

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <View className="flex-1 bg-card rounded-2xl p-4 items-center">
      <Text className="text-gray-400 text-xs mb-1">{label}</Text>
      <Text className="text-white text-2xl font-bold">
        {value}
        {unit && <Text className="text-gray-400 text-sm font-normal"> {unit}</Text>}
      </Text>
    </View>
  );
}

export function HistoryDetailView({ record }: HistoryDetailViewProps) {
  const trackedCoords = useMemo(
    () => (record.route_geojson ? geojsonToLatLngArray(record.route_geojson) : []),
    [record.route_geojson]
  );

  const plannedCoords = useMemo(
    () => (record.planned_route_geojson ? geojsonToLatLngArray(record.planned_route_geojson) : []),
    [record.planned_route_geojson]
  );

  const region = useMemo(() => {
    const allCoords = [...trackedCoords, ...plannedCoords];
    if (allCoords.length === 0) return undefined;
    const lats = allCoords.map((c) => c.latitude);
    const lngs = allCoords.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.4 || 0.01,
      longitudeDelta: (maxLng - minLng) * 1.4 || 0.01,
    };
  }, [trackedCoords, plannedCoords]);

  const date = new Date(record.started_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      {/* 지도 */}
      <View className="h-72">
        <MapView
          className="flex-1"
          provider={PROVIDER_GOOGLE}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {/* 목표 코스 - 반투명 회색 점선 */}
          {plannedCoords.length > 1 && (
            <Polyline
              coordinates={plannedCoords}
              strokeColor="rgba(156, 163, 175, 0.7)"
              strokeWidth={4}
              lineDashPattern={[8, 4]}
            />
          )}
          {/* 실제 달린 궤적 - 선명한 녹색 */}
          {trackedCoords.length > 1 && (
            <Polyline coordinates={trackedCoords} strokeColor="#22c55e" strokeWidth={5} />
          )}
          {trackedCoords.length > 0 && (
            <Marker coordinate={trackedCoords[0]} title="출발/도착" pinColor="#22c55e" />
          )}
        </MapView>
      </View>

      {/* 날짜 */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-gray-400 text-sm">{date}</Text>
      </View>

      {/* 주요 통계 */}
      <View className="flex-row gap-3 px-4 mb-3">
        <StatCard
          label="거리"
          value={metersToKm(record.distance_meters ?? 0).toFixed(2)}
          unit="km"
        />
        <StatCard
          label="시간"
          value={formatDuration(record.duration_seconds ?? 0)}
        />
      </View>
      <View className="flex-row gap-3 px-4">
        <StatCard
          label="평균 페이스"
          value={record.avg_pace_sec_per_km ? formatPace(record.avg_pace_sec_per_km) : '--'}
          unit="/km"
        />
        <StatCard label="완료" value="✓" />
      </View>
    </ScrollView>
  );
}
