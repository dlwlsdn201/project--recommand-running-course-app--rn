// src/shared/config/env.ts
// Runtime environment variable type-safe access and validation

const env = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '',
  KAKAO_APP_KEY: process.env.EXPO_PUBLIC_KAKAO_APP_KEY ?? '',
} as const;

export type EnvKeys = keyof typeof env;

/**
 * Validates that all required environment variables exist in dev/prod environments.
 * Provides a clear error message when any variable is missing.
 */
export function validateEnv(): void {
  const missing = (Object.keys(env) as EnvKeys[]).filter(
    (key) => !env[key]
  );
  if (missing.length > 0) {
    console.warn(
      `[RunLoop] 누락된 환경변수: ${missing.map((k) => `EXPO_PUBLIC_${k}`).join(', ')}\n` +
      `.env.local 파일을 확인하세요.`
    );
  }
}

export default env;
