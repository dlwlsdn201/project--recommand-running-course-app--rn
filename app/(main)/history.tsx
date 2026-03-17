// app/(main)/history.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaWrapper, LoadingSpinner, Button } from '@/shared/ui';
import { HistoryListItem } from '@/features/history/components/HistoryListItem';
import { MultiHistoryMap } from '@/features/history/components/MultiHistoryMap';
import { useRunningHistory } from '@/features/history/hooks/useRunningHistory';
import { useMultiHistoryMap } from '@/features/history/hooks/useMultiHistoryMap';

export default function HistoryScreen() {
  const { data: records = [], isLoading } = useRunningHistory();
  const [isMultiMode, setIsMultiMode] = useState(false);
  const { selectedIds, toggleRecord, selectAll, clearAll, selectedRoutes, colorMap } =
    useMultiHistoryMap(records);

  if (isLoading) return <LoadingSpinner message="기록 불러오는 중..." />;

  return (
    <SafeAreaWrapper>
      <View className="flex-1">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center px-4 py-3">
          <Text className="text-white text-2xl font-black">나의 기록</Text>
          <TouchableOpacity
            onPress={() => {
              setIsMultiMode((v) => !v);
              if (isMultiMode) clearAll();
            }}
            className={`px-3 py-1 rounded-full ${isMultiMode ? 'bg-primary-500' : 'bg-card'}`}
          >
            <Text className={`text-sm font-semibold ${isMultiMode ? 'text-white' : 'text-gray-400'}`}>
              {isMultiMode ? '단일 모드' : '다중 비교'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 다중 모드 지도 */}
        {isMultiMode && selectedRoutes.length > 0 && (
          <View className="h-48 mx-4 mb-3 rounded-2xl overflow-hidden">
            <MultiHistoryMap routes={selectedRoutes} />
          </View>
        )}

        {/* 다중 모드 컨트롤 */}
        {isMultiMode && (
          <View className="flex-row gap-2 px-4 mb-3">
            <Button label="전체 선택" onPress={selectAll} variant="secondary" className="flex-1" />
            <Button label="전체 해제" onPress={clearAll} variant="ghost" className="flex-1" />
          </View>
        )}

        {/* 기록 리스트 */}
        {records.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-base">아직 러닝 기록이 없습니다.</Text>
            <Text className="text-gray-600 text-sm mt-1">첫 번째 코스를 달려보세요!</Text>
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pb-6"
            renderItem={({ item }) => (
              <HistoryListItem
                record={item}
                isSelected={isMultiMode ? selectedIds.has(item.id) : undefined}
                color={isMultiMode ? colorMap.get(item.id) : undefined}
                onToggleSelect={isMultiMode ? () => toggleRecord(item.id) : undefined}
              />
            )}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}
