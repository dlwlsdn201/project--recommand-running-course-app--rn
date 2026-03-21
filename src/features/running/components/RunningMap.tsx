// src/features/running/components/RunningMap.tsx
import React, { useMemo } from "react";
import { View } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { geojsonToLatLngArray } from "@/shared/lib/routeParser";
import type { LatLng } from "@/shared/lib/routeParser";
import type { GeneratedCourse } from "../types/route.types";

interface RunningMapProps {
  plannedCourse: GeneratedCourse | null;
  trackedCoords: LatLng[];
  currentLocation: LatLng | null;
}

export function RunningMap({
  plannedCourse,
  trackedCoords,
  currentLocation,
}: RunningMapProps) {
  const plannedCoords = useMemo(
    () =>
      plannedCourse ? geojsonToLatLngArray(plannedCourse.routeGeojson) : [],
    [plannedCourse],
  );

  const center = currentLocation ?? plannedCoords[0] ?? null;
  const region = center
    ? {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : undefined;

  return (
    <View className='flex-1'>
      <MapView className='flex-1' region={region} showsUserLocation>
        {/* 추천 코스 (목표 궤적) - 반투명 회색 점선 */}
        {plannedCoords.length > 1 && (
          <Polyline
            coordinates={plannedCoords}
            strokeColor='rgba(239, 68, 68, 0.9)'
            strokeWidth={4}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* 실제 달린 궤적 - 선명한 녹색 */}
        {trackedCoords.length > 1 && (
          <Polyline
            coordinates={trackedCoords}
            strokeColor='#22c55e'
            strokeWidth={5}
          />
        )}

        {/* 시작점/종료점 마커 */}
        {plannedCoords.length > 0 && (
          <Marker
            coordinate={plannedCoords[0]}
            title='출발/도착'
            pinColor='#22c55e'
          />
        )}
      </MapView>
    </View>
  );
}
