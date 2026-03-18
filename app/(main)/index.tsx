// app/(main)/index.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { SafeAreaWrapper, Button, Card } from '@/shared/ui';
import { CourseOptionForm } from '@/features/running/components/CourseOptionForm';
import { CoursePreviewMap } from '@/features/running/components/CoursePreviewMap';
import { useGenerateSafeRoute } from '@/features/running/hooks/useGenerateSafeRoute';
import { useRunningStore } from '@/features/running/store/runningStore';
import type { RadiusOption } from '@/shared/config/constants';

export default function HomeScreen() {
  const router = useRouter();
  const [radius, setRadius] = useState<RadiusOption>(1000);
  const [distance, setDistance] = useState(5);
  const { generateCourse, regenerateCourse, course, isGenerating } = useGenerateSafeRoute();
  const { setPlannedCourse } = useRunningStore();

  const handleGenerate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    generateCourse({
      radiusMeters: radius,
      targetDistanceKm: distance,
      originLatitude: location.coords.latitude,
      originLongitude: location.coords.longitude,
    });
  };

  const handleRegenerate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    regenerateCourse({
      radiusMeters: radius,
      targetDistanceKm: distance,
      originLatitude: location.coords.latitude,
      originLongitude: location.coords.longitude,
    });
  };

  const handleAccept = () => {
    if (!course) return;
    setPlannedCourse(course);
    router.push('/(main)/running');
  };

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-white text-3xl font-black mb-6">RunLoop</Text>
        <CourseOptionForm
          selectedRadius={radius}
          targetDistanceKm={distance}
          onRadiusChange={setRadius}
          onDistanceChange={setDistance}
          onGenerate={handleGenerate}
          isLoading={isGenerating}
        />

        {course && (
          <Card className="mt-4">
            <Text className="text-white font-bold text-lg mb-2">코스 생성 완료!</Text>
            <Text className="text-gray-400">
              거리: {(course.totalDistanceMeters / 1000).toFixed(2)}km
            </Text>
            <Text className="text-gray-400">
              예상 시간: {Math.round(course.estimatedDurationSeconds / 60)}분
            </Text>
            {course.elevationGainMeters > 0 && (
              <Text className="text-gray-400">
                고도 상승: {course.elevationGainMeters}m
              </Text>
            )}
            <CoursePreviewMap course={course} />
            <View className="gap-2 mt-4">
              <Button label="이 코스로 달리기" onPress={handleAccept} />
              <Button
                label="다시 생성하기"
                onPress={handleRegenerate}
                variant="secondary"
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}
