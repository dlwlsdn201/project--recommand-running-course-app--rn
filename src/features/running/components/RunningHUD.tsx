// src/features/running/components/RunningHUD.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { formatDuration, formatPace, metersToKm } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui';

interface RunningHUDProps {
  elapsedSeconds: number;
  distanceMeters: number;
  paceSecPerKm: number;
  phase: 'running' | 'paused';
  onStop: () => void;
  onPause: () => void;
}

export function RunningHUD({
  elapsedSeconds,
  distanceMeters,
  paceSecPerKm,
  phase,
  onStop,
  onPause,
}: RunningHUDProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-card/95 rounded-t-3xl px-6 pt-4 pb-8">
      {/* 메인 거리 표시 - Glanceable UI */}
      <Text className="text-white text-7xl font-black text-center tracking-tighter">
        {metersToKm(distanceMeters).toFixed(2)}
      </Text>
      <Text className="text-gray-400 text-center text-sm mb-4">km</Text>

      {/* 페이스 / 시간 */}
      <View className="flex-row justify-around mb-6">
        <View className="items-center">
          <Text className="text-white text-2xl font-bold">
            {paceSecPerKm > 0 ? formatPace(paceSecPerKm) : '--:--'}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">페이스 /km</Text>
        </View>
        <View className="w-px bg-gray-700" />
        <View className="items-center">
          <Text className="text-white text-2xl font-bold">{formatDuration(elapsedSeconds)}</Text>
          <Text className="text-gray-500 text-xs mt-1">경과 시간</Text>
        </View>
      </View>

      {/* 컨트롤 버튼 */}
      {phase === 'paused' ? (
        <View className="flex-row gap-3">
          <Button label="재개" onPress={onPause} className="flex-1" />
          <Button label="종료" onPress={onStop} className="flex-1 bg-red-600" />
        </View>
      ) : (
        <View className="flex-row gap-3">
          <Button label="일시정지" onPress={onPause} variant="secondary" className="flex-1" />
          <Button label="종료" onPress={onStop} className="flex-1 bg-red-600" />
        </View>
      )}
    </View>
  );
}
