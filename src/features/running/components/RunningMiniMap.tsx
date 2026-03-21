// src/features/running/components/RunningMiniMap.tsx
import React, { useMemo, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { geojsonToLatLngArray } from '@/shared/lib/routeParser';
import type { LatLng } from '@/shared/lib/routeParser';
import type { GeneratedCourse } from '../types/route.types';

interface RunningMiniMapProps {
  plannedCourse: GeneratedCourse;
  trackedCoords: LatLng[];
}

export function RunningMiniMap({ plannedCourse, trackedCoords }: RunningMiniMapProps) {
  const mapRef = useRef<MapView>(null);

  const plannedCoords = useMemo(
    () => geojsonToLatLngArray(plannedCourse.routeGeojson),
    [plannedCourse]
  );

  // 추천 코스 전체가 보이도록 initialRegion 계산 (한 번만)
  const initialRegion = useMemo(() => {
    if (plannedCoords.length === 0) return undefined;
    const lats = plannedCoords.map((c) => c.latitude);
    const lngs = plannedCoords.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5 || 0.01,
      longitudeDelta: (maxLng - minLng) * 1.5 || 0.01,
    };
  }, [plannedCoords]);

  const currentLocation = trackedCoords.length > 0 ? trackedCoords[trackedCoords.length - 1] : null;

  // 현재 위치(또는 코스 시작점)로 지도 중앙 이동
  const handleCenter = useCallback(() => {
    const center = currentLocation ?? plannedCoords[0];
    if (!center) return;
    mapRef.current?.animateToRegion(
      {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      300
    );
  }, [currentLocation, plannedCoords]);

  // 확대
  const handleZoomIn = useCallback(() => {
    mapRef.current?.getCamera().then((camera) => {
      mapRef.current?.animateCamera(
        {
          ...camera,
          altitude: Math.max((camera.altitude ?? 1000) / 2, 100),
          zoom: Math.min((camera.zoom ?? 15) + 1, 20),
        },
        { duration: 200 }
      );
    });
  }, []);

  // 축소
  const handleZoomOut = useCallback(() => {
    mapRef.current?.getCamera().then((camera) => {
      mapRef.current?.animateCamera(
        {
          ...camera,
          altitude: Math.min((camera.altitude ?? 1000) * 2, 100000),
          zoom: Math.max((camera.zoom ?? 15) - 1, 3),
        },
        { duration: 200 }
      );
    });
  }, []);

  if (plannedCoords.length === 0) return null;

  return (
    <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        scrollEnabled
        zoomEnabled
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
      >
        {/* 추천 코스: 빨간 점선 */}
        <Polyline
          coordinates={plannedCoords}
          strokeColor="rgba(239, 68, 68, 0.9)"
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />

        {/* 실제 달린 경로: 초록 실선 */}
        {trackedCoords.length > 1 && (
          <Polyline
            coordinates={trackedCoords}
            strokeColor="#22c55e"
            strokeWidth={4}
          />
        )}

        {/* 출발/도착 마커 */}
        <Marker coordinate={plannedCoords[0]} pinColor="#22c55e" />

        {/* 현재 위치 마커 */}
        {currentLocation && (
          <Marker coordinate={currentLocation} pinColor="#3b82f6" />
        )}
      </MapView>

      {/* 지도 컨트롤 버튼 */}
      <View className="absolute right-3 bottom-3 gap-y-2">
        {/* 현재 위치 중앙 이동 */}
        <TouchableOpacity
          onPress={handleCenter}
          className="bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow"
          activeOpacity={0.7}
        >
          <Text className="text-base">◎</Text>
        </TouchableOpacity>

        {/* 확대 */}
        <TouchableOpacity
          onPress={handleZoomIn}
          className="bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow"
          activeOpacity={0.7}
        >
          <Text className="text-xl font-bold text-gray-800">+</Text>
        </TouchableOpacity>

        {/* 축소 */}
        <TouchableOpacity
          onPress={handleZoomOut}
          className="bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow"
          activeOpacity={0.7}
        >
          <Text className="text-xl font-bold text-gray-800">−</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
