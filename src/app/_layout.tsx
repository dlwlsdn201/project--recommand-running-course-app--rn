// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Providers } from '@/providers/AppProviders';
import '@/global.css';

export default function RootLayout() {
  const { setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }} />
    </Providers>
  );
}
