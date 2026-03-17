// src/features/running/components/RunningMap.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { geojsonToLatLngArray } from '@/shared/lib/routeParser';
import type { LatLng } from '@/shared/lib/routeParser';
import type { GeneratedCourse } from '../types/route.types';

interface RunningMapProps {
  plannedCourse: GeneratedCourse | null;
  trackedCoords: LatLng[];
  currentLocation: LatLng | null;
}

export function RunningMap({ plannedCourse, trackedCoords, currentLocation }: RunningMapProps) {
  const plannedCoords = useMemo(
    () => (plannedCourse ? geojsonToLatLngArray(plannedCourse.routeGeojson) : []),
    [plannedCourse]
  );

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        followsUserLocation
      >
        {/* 추천 코스 (목표 궤적) - 반투명 회색 점선 */}
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
          <Polyline
            coordinates={trackedCoords}
            strokeColor="#22c55e"
            strokeWidth={5}
          />
        )}

        {/* 시작점/종료점 마커 */}
        {plannedCoords.length > 0 && (
          <Marker coordinate={plannedCoords[0]} title="출발/도착" pinColor="#22c55e" />
        )}
      </MapView>
    </View>
  );
}
