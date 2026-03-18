// src/features/running/components/CoursePreviewMap.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { geojsonToLatLngArray } from '@/shared/lib/routeParser';
import type { GeneratedCourse } from '../types/route.types';

interface CoursePreviewMapProps {
  course: GeneratedCourse;
}

export function CoursePreviewMap({ course }: CoursePreviewMapProps) {
  const coords = useMemo(() => geojsonToLatLngArray(course.routeGeojson), [course]);

  const region = useMemo(() => {
    if (coords.length === 0) return undefined;
    const lats = coords.map((c) => c.latitude);
    const lngs = coords.map((c) => c.longitude);
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
  }, [coords]);

  if (coords.length === 0) return null;

  return (
    <View className="h-48 rounded-2xl overflow-hidden mt-3">
      <MapView
        className="flex-1"
        provider={PROVIDER_GOOGLE}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Polyline coordinates={coords} strokeColor="#22c55e" strokeWidth={4} />
        <Marker coordinate={coords[0]} title="출발/도착" pinColor="#22c55e" />
      </MapView>
    </View>
  );
}
