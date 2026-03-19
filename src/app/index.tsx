// app/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { LoadingSpinner } from '@/shared/ui';

export default function Index() {
  const { session, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (session) {
      router.replace('/(main)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [session, isLoading, router]);

  return <LoadingSpinner />;
}
