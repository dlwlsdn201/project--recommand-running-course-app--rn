// src/features/running/components/CourseOptionForm.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import {
  RADIUS_OPTIONS,
  RADIUS_LABELS,
  MIN_TARGET_DISTANCE_KM,
  MAX_TARGET_DISTANCE_KM,
  TARGET_DISTANCE_STEP_KM,
} from "@/shared/config/constants";
import type { RadiusOption } from "@/shared/config/constants";
import { Button } from "@/shared/ui";
import { LocationPinMap } from "./LocationPinMap";

export type LocationMode = "gps" | "map";

interface CourseOptionFormProps {
  selectedRadius: RadiusOption;
  targetDistanceKm: number;
  onRadiusChange: (radius: RadiusOption) => void;
  onDistanceChange: (km: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
  locationMode: LocationMode;
  onLocationModeChange: (mode: LocationMode) => void;
  customOrigin: { latitude: number; longitude: number } | null;
  onCustomOriginChange: (latitude: number, longitude: number) => void;
  gpsCoordinate: { latitude: number; longitude: number } | null;
}

export function CourseOptionForm({
  selectedRadius,
  targetDistanceKm,
  onRadiusChange,
  onDistanceChange,
  onGenerate,
  isLoading,
  locationMode,
  onLocationModeChange,
  customOrigin,
  onCustomOriginChange,
  gpsCoordinate,
}: CourseOptionFormProps) {
  return (
    <View className='p-4 bg-card rounded-2xl'>
      <Text className='text-white font-bold text-lg mb-4'>추천 코스 생성</Text>

      {/* 기준 좌표 선택 */}
      <View className='mb-6'>
        <Text className='text-gray-400 text-sm mb-2'>기준 위치</Text>
        <View className='flex-row gap-2'>
          {(["gps", "map"] as LocationMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => onLocationModeChange(mode)}
              className={`flex-1 py-3 rounded-xl items-center ${
                locationMode === mode ? "bg-primary-500" : "bg-surface"
              }`}>
              <Text
                className={`font-semibold ${
                  locationMode === mode ? "text-white" : "text-gray-400"
                }`}>
                {mode === "gps" ? "내 위치" : "지도에서 선택"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {locationMode === "map" && (
          <LocationPinMap
            initialCoordinate={customOrigin ?? gpsCoordinate}
            onLocationChange={onCustomOriginChange}
          />
        )}
      </View>

      {/* 반경 선택 */}
      <View className='mb-6'>
        <Text className='text-gray-400 text-sm mb-2'>탐색 반경</Text>
        <View className='flex-row gap-2'>
          {RADIUS_OPTIONS.map((radius) => (
            <TouchableOpacity
              key={radius}
              onPress={() => onRadiusChange(radius)}
              className={`flex-1 py-3 rounded-xl items-center ${
                selectedRadius === radius ? "bg-primary-500" : "bg-surface"
              }`}>
              <Text
                className={`font-semibold ${
                  selectedRadius === radius ? "text-white" : "text-gray-400"
                }`}>
                {RADIUS_LABELS[radius]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 거리 슬라이더 */}
      <View className='mb-6'>
        <View className='flex-row justify-between items-center mb-2'>
          <Text className='text-gray-400 text-sm'>목표 거리</Text>
          <Text className='text-primary-500 font-bold text-lg'>
            {targetDistanceKm}km
          </Text>
        </View>
        <Slider
          minimumValue={MIN_TARGET_DISTANCE_KM}
          maximumValue={MAX_TARGET_DISTANCE_KM}
          step={TARGET_DISTANCE_STEP_KM}
          value={targetDistanceKm}
          onValueChange={(v) => onDistanceChange(Math.round(v))}
          minimumTrackTintColor='#22c55e'
          maximumTrackTintColor='#374151'
          thumbTintColor='#22c55e'
        />
      </View>

      <Button
        label='코스 생성하기'
        onPress={onGenerate}
        isLoading={isLoading}
      />
    </View>
  );
}
