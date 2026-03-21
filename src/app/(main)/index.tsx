// app/(main)/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { SafeAreaWrapper, Button, Card } from "@/shared/ui";
import { CourseOptionForm } from "@/features/running/components/CourseOptionForm";
import type { LocationMode } from "@/features/running/components/CourseOptionForm";
import { CoursePreviewMap } from "@/features/running/components/CoursePreviewMap";
import { useGenerateSafeRoute } from "@/features/running/hooks/useGenerateSafeRoute";
import { useRunningStore } from "@/features/running/store/runningStore";
import type { RadiusOption } from "@/shared/config/constants";

export default function HomeScreen() {
  const router = useRouter();
  const [radius, setRadius] = useState<RadiusOption>(1000);
  const [distance, setDistance] = useState(5);
  const [locationMode, setLocationMode] = useState<LocationMode>("gps");
  const [customOrigin, setCustomOrigin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [gpsCoordinate, setGpsCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const hasFetchedGps = useRef(false);

  const { generateCourse, regenerateCourse, course, isGenerating, error } =
    useGenerateSafeRoute();
  const { setPlannedCourse } = useRunningStore();

  // GPS 좌표를 최초 1회만 가져와 지도 초기 핀 위치로 사용
  useEffect(() => {
    if (hasFetchedGps.current) return;
    hasFetchedGps.current = true;
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== "granted") return;
      Location.getCurrentPositionAsync({}).then((loc) => {
        setGpsCoordinate({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      });
    });
  }, []);

  const resolveOrigin = async () => {
    if (locationMode === "map" && customOrigin) {
      return customOrigin;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;
    const loc = await Location.getCurrentPositionAsync({});
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  };

  const handleGenerate = async () => {
    const origin = await resolveOrigin();
    if (!origin) return;
    generateCourse({
      radiusMeters: radius,
      targetDistanceKm: distance,
      originLatitude: origin.latitude,
      originLongitude: origin.longitude,
    });
  };

  const handleRegenerate = async () => {
    const origin = await resolveOrigin();
    if (!origin) return;
    regenerateCourse({
      radiusMeters: radius,
      targetDistanceKm: distance,
      originLatitude: origin.latitude,
      originLongitude: origin.longitude,
    });
  };

  const handleAccept = () => {
    if (!course) return;
    setPlannedCourse(course);
    router.push("/(main)/running");
  };

  return (
    <SafeAreaWrapper>
      <ScrollView className='flex-1 px-4 py-6'>
        <Text className='text-white text-3xl font-black mb-6'>RunLoop</Text>
        <CourseOptionForm
          selectedRadius={radius}
          targetDistanceKm={distance}
          onRadiusChange={setRadius}
          onDistanceChange={setDistance}
          onGenerate={handleGenerate}
          isLoading={isGenerating}
          locationMode={locationMode}
          onLocationModeChange={setLocationMode}
          customOrigin={customOrigin}
          onCustomOriginChange={(lat, lng) =>
            setCustomOrigin({ latitude: lat, longitude: lng })
          }
          gpsCoordinate={gpsCoordinate}
        />

        {error && (
          <View className='mt-4 p-4 bg-red-900/50 rounded-2xl'>
            <Text className='text-red-400 font-semibold'>코스 생성 실패</Text>
            <Text className='text-red-300 text-sm mt-1'>
              {error instanceof Error
                ? error.message
                : "알 수 없는 오류가 발생했습니다."}
            </Text>
          </View>
        )}

        {course && (
          <Card className='mt-4'>
            <Text className='text-white font-bold text-lg mb-2'>
              코스 생성 완료!
            </Text>
            <Text className='text-gray-400'>
              거리: 약 {(course.totalDistanceMeters / 1000).toFixed(2)}km
            </Text>
            <Text className='text-gray-400'>
              예상 시간: 약 {Math.round(course.estimatedDurationSeconds / 60)}분
            </Text>
            {course.elevationGainMeters > 0 && (
              <Text className='text-gray-400'>
                고도 상승: {course.elevationGainMeters}m
              </Text>
            )}
            <CoursePreviewMap course={course} />
            <View className='gap-2 mt-4'>
              <Button label='이 코스로 달리기' onPress={handleAccept} />
              <Button
                label='다시 생성하기'
                onPress={handleRegenerate}
                variant='secondary'
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}
