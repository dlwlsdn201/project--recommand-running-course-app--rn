import React from 'react';
import { useKakaoAuth } from '@/features/auth/hooks/useKakaoAuth';
import { LoginView } from '@/features/auth/components/LoginView';

export default function LoginScreen() {
  const { signInWithKakao, isLoading, error } = useKakaoAuth();
  return (
    <LoginView
      onKakaoLogin={signInWithKakao}
      isLoading={isLoading}
      error={error}
    />
  );
}
