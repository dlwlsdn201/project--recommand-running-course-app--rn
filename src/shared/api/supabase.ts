// src/shared/api/supabase.ts
// Supabase 클라이언트 초기화. env 미설정 시 placeholder로 앱 로드 가능하게 함.
// Expo Go 호환: AsyncStorage/SecureStore의 "Native module is null" 회피를 위해 메모리 스토리지 사용.
// 프로덕션 빌드에서는 expo-secure-store 또는 AsyncStorage로 전환 필요.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Expo는 빌드 시 .env의 EXPO_PUBLIC_* 값을 process.env에 주입
const SUPABASE_URL =
  (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim() ||
  'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim() ||
  'placeholder-anon-key';

const isPlaceholder =
  SUPABASE_URL.includes('placeholder') || SUPABASE_ANON_KEY.includes('placeholder');
if (isPlaceholder) {
  console.warn(
    '[RunLoop] Supabase env 미설정. .env에 EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.'
  );
}

/** in-memory 스토리지 - Expo Go에서 네이티브 모듈 오류 회피용 (세션은 앱 재시작 시 초기화됨) */
const memoryStorage: Record<string, string> = {};
const MemoryStorageAdapter = {
  getItem: async (key: string): Promise<string | null> =>
    memoryStorage[key] ?? null,
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStorage[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete memoryStorage[key];
  },
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: MemoryStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
