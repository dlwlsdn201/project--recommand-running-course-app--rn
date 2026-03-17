// app/(main)/running.tsx
import React, { useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper, Button, LoadingSpinner } from '@/shared/ui';
import { RunningHUD } from '@/features/running/components/RunningHUD';
import { RunningMap } from '@/features/running/components/RunningMap';
import { useRunningTracker } from '@/features/running/hooks/useRunningTracker';
import { useSaveRunningRecord } from '@/features/running/hooks/useSaveRunningRecord';
import { useRunningStore } from '@/features/running/store/runningStore';

export default function RunningScreen() {
  const router = useRouter();
  const { plannedCourse, currentPaceSecPerKm, startedAt } = useRunningStore();
  const {
    phase,
    trackedCoords,
    distanceMeters,
    elapsedSeconds,
    startTracking,
    stopTracking,
    pauseTracking,
    reset,
  } = useRunningTracker();
  const saveRecord = useSaveRunningRecord();

  const currentLocation = trackedCoords.length > 0 ? trackedCoords[trackedCoords.length - 1] : null;

  const handleStart = useCallback(async () => {
    try {
      await startTracking();
    } catch (e) {
      Alert.alert('오류', e instanceof Error ? e.message : '트래킹을 시작할 수 없습니다.');
    }
  }, [startTracking]);

  const handleStop = useCallback(() => {
    Alert.alert('러닝 종료', '러닝을 종료하고 기록을 저장할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => {
          stopTracking();
          if (trackedCoords.length > 1) {
            saveRecord.mutate(
              {
                startedAt: startedAt ?? new Date(),
                trackedCoords,
                elapsedSeconds,
                distanceMeters,
                plannedRouteGeojson: plannedCourse?.routeGeojson ?? null,
              },
              {
                onSuccess: () => {
                  Alert.alert('저장 완료', '러닝 기록이 저장되었습니다!', [
                    { text: '확인', onPress: () => { reset(); router.push('/(main)/history'); } },
                  ]);
                },
                onError: (e) => {
                  Alert.alert('저장 실패', e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.');
                  reset();
                  router.push('/(main)/history');
                },
              }
            );
          } else {
            reset();
            router.back();
          }
        },
      },
    ]);
  }, [stopTracking, trackedCoords, elapsedSeconds, distanceMeters, plannedCourse, startedAt, saveRecord, reset, router]);

  if (!plannedCourse) {
    return (
      <SafeAreaWrapper>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-lg font-semibold text-center mb-4">
            코스를 먼저 생성해주세요.
          </Text>
          <Button label="코스 생성으로 이동" onPress={() => router.push('/(main)')} />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (phase === 'idle' || phase === 'ready') {
    return (
      <SafeAreaWrapper>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-2xl font-black mb-2">준비됐나요?</Text>
          <Text className="text-gray-400 text-sm mb-8 text-center">
            목표: {(plannedCourse.totalDistanceMeters / 1000).toFixed(1)}km
          </Text>
          <Button label="달리기 시작" onPress={handleStart} className="w-full" />
          <Button
            label="뒤로"
            onPress={() => router.back()}
            variant="ghost"
            className="w-full mt-3"
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (saveRecord.isPending) {
    return <LoadingSpinner message="기록 저장 중..." />;
  }

  return (
    <View className="flex-1 bg-surface">
      <RunningMap
        plannedCourse={plannedCourse}
        trackedCoords={trackedCoords}
        currentLocation={currentLocation}
      />
      {phase === 'paused' && (
        <View className="absolute top-16 left-0 right-0 items-center">
          <View className="bg-yellow-500 rounded-full px-4 py-1">
            <Text className="text-black font-bold text-sm">일시 정지됨</Text>
          </View>
        </View>
      )}
      <RunningHUD
        elapsedSeconds={elapsedSeconds}
        distanceMeters={distanceMeters}
        paceSecPerKm={currentPaceSecPerKm}
        onStop={handleStop}
        onPause={phase === 'running' ? pauseTracking : handleStart}
      />
    </View>
  );
}
