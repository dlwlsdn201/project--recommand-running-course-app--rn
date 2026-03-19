/**
 * 루트 레이아웃용 Provider 래퍼.
 * QueryClient, SafeAreaProvider를 앱 전체에 제공.
 * 주의: 파일명을 Providers.tsx에서 변경함 - Expo Router가 src/app 내 Providers.tsx를 route로 잘못 스캔하는 버그 회피.
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
}
