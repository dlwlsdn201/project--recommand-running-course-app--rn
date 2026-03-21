// src/features/running/components/RunningHUD.tsx
import React from "react";
import { View, Text, StatusBar } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  formatDuration,
  formatPace,
  metersToKm,
} from "@/shared/lib/formatters";
import { Button } from "@/shared/ui";
import { RunningMiniMap } from "./RunningMiniMap";
import type { LatLng } from "@/shared/lib/routeParser";
import type { GeneratedCourse } from "../types/route.types";
import * as Expo from "expo";

interface RunningHUDProps {
  elapsedSeconds: number;
  distanceMeters: number;
  paceSecPerKm: number;
  phase: "running" | "paused";
  onStop: () => void;
  onPause: () => void;
  plannedCourse: GeneratedCourse;
  trackedCoords: LatLng[];
}

export function RunningHUD({
  elapsedSeconds,
  distanceMeters,
  paceSecPerKm,
  phase,
  onStop,
  onPause,
  plannedCourse,
  trackedCoords,
}: RunningHUDProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className='absolute inset-0'>
      {/* 상단 투명 영역: 배경 RunningMap이 보임 */}

      {/* 하단 통합 패널: 미니맵 + 통계 + 버튼 */}
      <View
        className='flex-1 flex-col gap-y-8 justify-between rounded-t-3xl overflow-hidden'
        style={{
          paddingBottom: Math.max(insets.bottom, 20),
          paddingTop: StatusBar.currentHeight,
        }}>
        {/* 미니맵: 패널 최상단, 모서리는 패널 rounded-t-3xl로 클리핑 */}
        <View className='flex-[0.9]'>
          <RunningMiniMap
            plannedCourse={plannedCourse}
            trackedCoords={trackedCoords}
          />
        </View>

        {/* 통계 + 버튼 */}
        <View className='px-4 items-center flex flex-col justify-end gap-y-6'>
          {/* 메인 거리 표시 - Glanceable UI */}
          <View className='flex-row justify-center gap-2 w-full'>
            <Text className='text-white text-7xl font-black text-center tracking-tighter'>
              {metersToKm(distanceMeters).toFixed(2)}
            </Text>
            <Text className='text-gray-400 text-center text-base self-center'>
              km
            </Text>
          </View>
          {/* 페이스 / 시간 */}
          <View className='flex-row justify-evenly w-full'>
            {/* 페이스/km 표시 */}
            <View className='items-center'>
              <Text className='text-white text-2xl font-bold'>
                {paceSecPerKm > 0 ? formatPace(paceSecPerKm) : "--:--"}
              </Text>
              <Text className='text-gray-500 text-xs mt-1'>페이스 /km</Text>
            </View>
            {/* 구분선 */}
            <View className='w-px bg-gray-700' />
            {/* 경과 시간 표시 */}
            <View className='items-center'>
              <Text className='text-white text-2xl font-bold'>
                {formatDuration(elapsedSeconds)}
              </Text>
              <Text className='text-gray-500 text-xs mt-1'>경과 시간</Text>
            </View>
          </View>
          {/* 컨트롤 버튼 */}
          <View className='flex-row gap-2 w-full'>
            <Button
              label={phase === "paused" ? "재개" : "일시정지"}
              onPress={onPause}
              variant={phase === "paused" ? "secondary" : "primary"}
              className='flex-1'
            />
            <Button
              label='종료'
              onPress={onStop}
              className='flex-1 bg-red-600'
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
