// src/features/running/components/LocationPinMap.tsx
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import {
  MAP_DEFAULT_LATITUDE_DELTA,
  MAP_DEFAULT_LONGITUDE_DELTA,
} from '@/shared/config/constants';

interface LocationPinMapProps {
  initialCoordinate: { latitude: number; longitude: number } | null;
  onLocationChange: (latitude: number, longitude: number) => void;
}

const BUTTON_STYLE = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'white',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
};

export function LocationPinMap({ initialCoordinate, onLocationChange }: LocationPinMapProps) {
  const defaultCoord = initialCoordinate ?? { latitude: 37.5665, longitude: 126.978 };
  const [pinCoord, setPinCoord] = useState(defaultCoord);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [delta, setDelta] = useState({
    latitudeDelta: MAP_DEFAULT_LATITUDE_DELTA,
    longitudeDelta: MAP_DEFAULT_LONGITUDE_DELTA,
  });
  const mapRef = useRef<MapView>(null);

  const animateTo = (coord: { latitude: number; longitude: number }, nextDelta = delta) => {
    const region: Region = { ...coord, ...nextDelta };
    mapRef.current?.animateToRegion(region, 300);
  };

  const handlePress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPinCoord({ latitude, longitude });
    onLocationChange(latitude, longitude);
  };

  const handleZoomIn = () => {
    const nextDelta = {
      latitudeDelta: delta.latitudeDelta * 0.5,
      longitudeDelta: delta.longitudeDelta * 0.5,
    };
    setDelta(nextDelta);
    animateTo(pinCoord, nextDelta);
  };

  const handleZoomOut = () => {
    const nextDelta = {
      latitudeDelta: delta.latitudeDelta * 2,
      longitudeDelta: delta.longitudeDelta * 2,
    };
    setDelta(nextDelta);
    animateTo(pinCoord, nextDelta);
  };

  const handleGoToMyLocation = async () => {
    setIsFetchingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setPinCoord({ latitude, longitude });
      onLocationChange(latitude, longitude);
      animateTo({ latitude, longitude });
    } finally {
      setIsFetchingGps(false);
    }
  };

  return (
    <View style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{ ...defaultCoord, ...delta }}
        onPress={handlePress}
      >
        <Marker coordinate={pinCoord} />
      </MapView>

      {/* 우측 하단 컨트롤 버튼들 */}
      <View style={{ position: 'absolute', bottom: 10, right: 10, gap: 8 }}>
        {/* 줌인 */}
        <TouchableOpacity onPress={handleZoomIn} style={BUTTON_STYLE}>
          <Text style={{ fontSize: 20, color: '#374151', lineHeight: 22 }}>+</Text>
        </TouchableOpacity>

        {/* 줌아웃 */}
        <TouchableOpacity onPress={handleZoomOut} style={BUTTON_STYLE}>
          <Text style={{ fontSize: 20, color: '#374151', lineHeight: 22 }}>−</Text>
        </TouchableOpacity>

        {/* 내 위치 */}
        <TouchableOpacity onPress={handleGoToMyLocation} disabled={isFetchingGps} style={BUTTON_STYLE}>
          {isFetchingGps ? (
            <ActivityIndicator size="small" color="#22c55e" />
          ) : (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                borderWidth: 2.5,
                borderColor: '#22c55e',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
