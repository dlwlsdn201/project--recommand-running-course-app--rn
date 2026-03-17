// src/features/history/components/MultiHistoryMap.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { LatLng } from '@/shared/lib/routeParser';

interface RouteLayer {
  id: string;
  coords: LatLng[];
  color: string;
  startedAt: string;
}

interface MultiHistoryMapProps {
  routes: RouteLayer[];
}

export function MultiHistoryMap({ routes }: MultiHistoryMapProps) {
  // 전체 bounds 계산 (useMemo로 최적화)
  const region = useMemo(() => {
    const allCoords = routes.flatMap((r) => r.coords);
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
      latitudeDelta: (maxLat - minLat) * 1.4 + 0.005,
      longitudeDelta: (maxLng - minLng) * 1.4 + 0.005,
    };
  }, [routes]);

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        provider={PROVIDER_GOOGLE}
        region={region}
      >
        {/* 각 러닝 기록을 고유 색상 폴리라인으로 렌더링 (PRD: 고유 색상) */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coords}
            strokeColor={route.color}
            strokeWidth={4}
          />
        ))}
      </MapView>
    </View>
  );
}
