// app/(main)/history/[id].tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaWrapper, LoadingSpinner } from '@/shared/ui';
import { HistoryDetailView } from '@/features/history/components/HistoryDetailView';
import { useRunningRecord } from '@/features/history/hooks/useRunningRecord';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: record, isLoading, isError } = useRunningRecord(id);

  if (isLoading) return <LoadingSpinner message="기록 불러오는 중..." />;

  if (isError || !record) {
    return (
      <SafeAreaWrapper>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-base">기록을 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View className="flex-1">
        {/* 헤더 */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-primary-500 text-base font-semibold">{'< 뒤로'}</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-black">러닝 상세</Text>
        </View>
        <HistoryDetailView record={record} />
      </View>
    </SafeAreaWrapper>
  );
}
