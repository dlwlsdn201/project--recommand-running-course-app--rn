/**
 * 루트 레이아웃용 Provider 래퍼.
 * QueryClient, SafeAreaProvider를 앱 전체에 제공.
 * C2에서 src/providers/AppProviders.tsx로 이동 예정 (Expo Router route 충돌 방지).
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
