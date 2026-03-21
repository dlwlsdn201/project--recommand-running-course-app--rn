import { useCallback, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

export function useKakaoAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession } = useAuthStore();

  const signInWithKakao = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const redirectUrl = makeRedirectUri({
        scheme: 'runloop',
        path: 'auth/callback',
      });

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (authError) throw authError;
      if (!data.url) throw new Error('OAuth URL을 가져오지 못했습니다.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success') {
        const url = new URL(result.url);

        // PKCE flow: ?code=
        const code = url.searchParams.get('code');
        if (code) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
          setSession(sessionData.session);
          return;
        }

        // Implicit flow: #access_token=
        const hashParams = new URLSearchParams(url.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (sessionError) throw sessionError;
          setSession(sessionData.session);
          return;
        }

        throw new Error('인증 토큰을 받지 못했습니다.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, [setSession]);

  return { signInWithKakao, signOut, isLoading, error };
}
