// src/features/running/components/CoursePreviewMap.tsx
import React, { useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MapView, { Polyline, Marker, Region } from "react-native-maps";
import { geojsonToLatLngArray } from "@/shared/lib/routeParser";
import type { GeneratedCourse } from "../types/route.types";

interface CoursePreviewMapProps {
  course: GeneratedCourse;
}

const BUTTON_STYLE = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "white",
  alignItems: "center" as const,
  justifyContent: "center" as const,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
};

export function CoursePreviewMap({ course }: CoursePreviewMapProps) {
  const mapRef = useRef<MapView>(null);
  const coords = useMemo(
    () => geojsonToLatLngArray(course.routeGeojson),
    [course],
  );

  const initialRegion = useMemo<Region | undefined>(() => {
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

  const [delta, setDelta] = useState({
    latitudeDelta: initialRegion?.latitudeDelta ?? 0.01,
    longitudeDelta: initialRegion?.longitudeDelta ?? 0.01,
  });

  const center = initialRegion
    ? { latitude: initialRegion.latitude, longitude: initialRegion.longitude }
    : { latitude: 37.5665, longitude: 126.978 };

  const animateTo = (nextDelta: {
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    const region: Region = { ...center, ...nextDelta };
    mapRef.current?.animateToRegion(region, 300);
  };

  const handleZoomIn = () => {
    const nextDelta = {
      latitudeDelta: delta.latitudeDelta * 0.5,
      longitudeDelta: delta.longitudeDelta * 0.5,
    };
    setDelta(nextDelta);
    animateTo(nextDelta);
  };

  const handleZoomOut = () => {
    const nextDelta = {
      latitudeDelta: delta.latitudeDelta * 2,
      longitudeDelta: delta.longitudeDelta * 2,
    };
    setDelta(nextDelta);
    animateTo(nextDelta);
  };

  if (coords.length === 0) return null;

  return (
    <View
      style={{
        height: 300,
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 12,
      }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled={false}>
        <Polyline coordinates={coords} strokeColor='#22c55e' strokeWidth={4} />
        <Marker coordinate={coords[0]} title='출발/도착' pinColor='#22c55e' />
      </MapView>

      {/* 줌 버튼 */}
      <View style={{ position: "absolute", bottom: 10, right: 10, gap: 8 }}>
        <TouchableOpacity onPress={handleZoomIn} style={BUTTON_STYLE}>
          <Text style={{ fontSize: 20, color: "#374151", lineHeight: 22 }}>
            +
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleZoomOut} style={BUTTON_STYLE}>
          <Text style={{ fontSize: 20, color: "#374151", lineHeight: 22 }}>
            −
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
