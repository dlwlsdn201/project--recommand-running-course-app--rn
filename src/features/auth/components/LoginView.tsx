import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/shared/ui';

interface LoginViewProps {
  onKakaoLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginView({ onKakaoLogin, isLoading, error }: LoginViewProps) {
  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
      <View className="items-center mb-16">
        <Text className="text-6xl font-black text-primary-500 tracking-tight">
          RunLoop
        </Text>
        <Text className="text-gray-400 mt-2 text-center text-base">
          {'매일 새로운 코스로\n러닝의 재미를 발견하세요'}
        </Text>
      </View>

      {error ? (
        <View className="bg-red-900/30 border border-red-500 rounded-xl p-3 mb-4 w-full">
          <Text className="text-red-400 text-sm text-center">{error}</Text>
        </View>
      ) : null}

      <Button
        label="카카오로 시작하기"
        onPress={onKakaoLogin}
        isLoading={isLoading}
        className="w-full bg-yellow-400"
      />
    </View>
  );
}
