// src/features/history/components/HistoryListItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatDuration, formatPace, metersToKm } from '@/shared/lib/formatters';
import type { RunningRecord } from '../types/history.types';

interface HistoryListItemProps {
  record: RunningRecord;
  isSelected?: boolean;
  color?: string;
  onPress?: () => void;
  onToggleSelect?: () => void;
}

export function HistoryListItem({
  record,
  isSelected,
  color,
  onPress,
  onToggleSelect,
}: HistoryListItemProps) {
  const date = new Date(record.started_at).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <TouchableOpacity
      className={`bg-card rounded-2xl p-4 mb-3 border-2 ${
        isSelected ? 'border-primary-500' : 'border-transparent'
      }`}
      onPress={onPress ?? onToggleSelect}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        {/* 색상 인디케이터 (다중 선택 시) - PRD: 각 궤적마다 고유한 색상 */}
        {color && (
          <View
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: color }}
          />
        )}
        <View className="flex-1">
          <Text className="text-gray-400 text-xs mb-1">{date}</Text>
          <View className="flex-row gap-4">
            <View>
              <Text className="text-white font-bold text-lg">
                {metersToKm(record.distance_meters ?? 0)}
                <Text className="text-gray-400 font-normal text-sm">km</Text>
              </Text>
            </View>
            <View>
              <Text className="text-white font-semibold">
                {formatDuration(record.duration_seconds ?? 0)}
              </Text>
            </View>
            {record.avg_pace_sec_per_km && (
              <View>
                <Text className="text-primary-500 font-semibold">
                  {formatPace(record.avg_pace_sec_per_km)}
                  <Text className="text-gray-400 font-normal text-xs">/km</Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
