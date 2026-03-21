import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function AuthLayout() {
  const { session, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/(main)');
    }
  }, [session, isLoading, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
