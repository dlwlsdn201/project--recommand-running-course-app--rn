# RunLoop App - Full Project Setup & Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** RunLoop 앱의 전체 프로젝트 환경 세팅(Expo + TypeScript + NativeWind + Supabase + Mapbox)과 핵심 기능(인증, 코스 생성, 러닝 트래킹, 히스토리 뷰) 구현

**Architecture:** Expo Managed Workflow 기반 React Native 앱. Feature-Sliced Design(FSD) 패턴으로 도메인을 분리하고, Zustand(클라이언트 상태) + React Query(서버 상태)를 조합한다. 백엔드는 Supabase(PostgreSQL + PostGIS)를 사용하고, Mapbox API로 안전 보행자 라우팅을 처리한다.

**Tech Stack:** pnpm, Expo SDK 52+, TypeScript(Strict), NativeWind v4, Zustand, React Query, Supabase, Mapbox GL, react-native-maps, Expo Location, Expo Router

---

## 전체 작업 순서 요약

1. Task 1: Expo 프로젝트 초기화 + 기본 설정
2. Task 2: 의존성 패키지 설치
3. Task 3: FSD 디렉토리 구조 생성
4. Task 4: 환경변수 및 공통 상수 설정
5. Task 5: Supabase 클라이언트 설정 + DB 스키마 작성
6. Task 6: NativeWind 설정
7. Task 7: 공통 유틸리티 (colorGenerator, routeParser)
8. Task 8: 공통 UI 컴포넌트
9. Task 9: 인증(Auth) Feature - 카카오 OAuth
10. Task 10: 코스 생성(Running) Feature - Mapbox 라우팅
11. Task 11: 러닝 트래킹 Feature - 실시간 GPS
12. Task 12: 히스토리(History) Feature - Single/Multi 뷰
13. Task 13: Screens 조립 및 Expo Router 네비게이션
14. Task 14: Supabase Edge Functions (백엔드 로직)
15. Task 15: 최종 통합 테스트 및 검증

---

## Task 1: Expo 프로젝트 초기화

**Files:**
- Create: `app.json`
- Create: `package.json`
- Create: `tsconfig.json`
- Modify: `README.md`

**Step 1: Expo 프로젝트 생성**

```bash
cd /Users/leejinw/Documents/codes/ljw/project/project--recommand-running-course-app--rn
pnpm create expo-app@latest . --template blank-typescript
```

> ⚠️ 기존 파일(README.md, CLAUDE.md, AGENTS.md, .cursor/)은 덮어쓰지 않도록 주의.

**Step 2: package.json 확인**

```bash
cat package.json
```

Expected: `"expo": "~52.x.x"` 버전 확인, `"main": "expo-router/entry"` 설정 확인

**Step 3: Expo Router로 전환**

```bash
pnpm add expo-router
```

`package.json`의 `"main"` 필드를 `"expo-router/entry"`로 수정:

```json
{
  "main": "expo-router/entry"
}
```

`app.json`에 scheme 추가:
```json
{
  "expo": {
    "name": "RunLoop",
    "slug": "runloop",
    "scheme": "runloop",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "러닝 코스 추적을 위해 위치 권한이 필요합니다.",
          "isAndroidBackgroundLocationEnabled": true
        }
      ]
    ]
  }
}
```

**Step 4: TypeScript strict 모드 활성화**

`tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: init expo project with expo-router and strict typescript"
```

---

## Task 2: 의존성 패키지 설치

**Step 1: 핵심 패키지 설치**

```bash
pnpm add nativewind tailwindcss
pnpm add @supabase/supabase-js
pnpm add zustand
pnpm add @tanstack/react-query
pnpm add react-native-maps
pnpm add @rnmapbox/maps
pnpm add expo-location
pnpm add expo-secure-store
pnpm add react-native-mmkv
pnpm add @react-native-async-storage/async-storage
```

**Step 2: 개발 의존성 설치**

```bash
pnpm add -D @types/react @types/react-native
pnpm add -D babel-plugin-module-resolver
```

**Step 3: NativeWind 전용 설치**

```bash
pnpm add nativewind@^4.0.1
pnpm add -D tailwindcss@^3.4.0
```

**Step 4: 설치 확인**

```bash
pnpm list --depth=0
```

Expected: 위에서 설치한 패키지들이 목록에 있어야 함

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install core dependencies (nativewind, supabase, zustand, react-query, maps)"
```

---

## Task 3: FSD 디렉토리 구조 생성

**Files:**
- Create: `src/app/` (앱 프로바이더, 글로벌 설정)
- Create: `src/screens/` (화면 컴포넌트)
- Create: `src/features/auth/`
- Create: `src/features/running/`
- Create: `src/features/history/`
- Create: `src/shared/ui/`
- Create: `src/shared/lib/`
- Create: `src/shared/config/`
- Create: `src/shared/api/`
- Create: `app/` (Expo Router 라우트)

**Step 1: 디렉토리 구조 생성**

```bash
mkdir -p src/app
mkdir -p src/screens
mkdir -p src/features/auth/{hooks,components,store}
mkdir -p src/features/running/{hooks,components,store,types}
mkdir -p src/features/history/{hooks,components,store,types}
mkdir -p src/shared/ui
mkdir -p src/shared/lib
mkdir -p src/shared/config
mkdir -p src/shared/api
mkdir -p app/\(auth\)
mkdir -p app/\(main\)
```

**Step 2: index.ts 배럴 파일 생성**

각 feature 디렉토리에 `index.ts` 생성:

`src/features/auth/index.ts`:
```typescript
export * from './hooks';
export * from './components';
export * from './store';
```

`src/features/running/index.ts`:
```typescript
export * from './hooks';
export * from './components';
export * from './store';
export * from './types';
```

`src/features/history/index.ts`:
```typescript
export * from './hooks';
export * from './components';
export * from './store';
export * from './types';
```

**Step 3: Commit**

```bash
git add src/ app/
git commit -m "chore: setup FSD directory structure"
```

---

## Task 4: 환경변수 및 공통 상수 설정

**Files:**
- Create: `.env.example`
- Create: `.env.local` (gitignore에 추가)
- Create: `src/shared/config/constants.ts`
- Create: `src/shared/config/env.ts`
- Modify: `.gitignore`

**Step 1: .env.example 생성**

```bash
cat > .env.example << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token
EXPO_PUBLIC_KAKAO_APP_KEY=your-kakao-native-app-key
EOF
```

**Step 2: .env.local 생성 (실제 키 입력)**

```bash
cp .env.example .env.local
# .env.local에 실제 키 값 입력
```

**Step 3: .gitignore에 .env.local 추가**

```bash
echo ".env.local" >> .gitignore
```

**Step 4: 환경변수 타입 선언 (`src/shared/config/env.ts`)**

```typescript
// src/shared/config/env.ts
const env = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!,
  KAKAO_APP_KEY: process.env.EXPO_PUBLIC_KAKAO_APP_KEY!,
} as const;

// 런타임 환경변수 검증
Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: EXPO_PUBLIC_${key}`);
  }
});

export default env;
```

**Step 5: 공통 상수 (`src/shared/config/constants.ts`)**

```typescript
// src/shared/config/constants.ts

// 코스 반경 옵션 (미터 단위)
export const RADIUS_OPTIONS = [500, 1000, 5000] as const;
export type RadiusOption = typeof RADIUS_OPTIONS[number];

// 목표 거리 설정 (킬로미터 단위)
export const MIN_TARGET_DISTANCE_KM = 1;
export const MAX_TARGET_DISTANCE_KM = 10;
export const TARGET_DISTANCE_STEP_KM = 1;

// 맵 설정
export const MAP_DEFAULT_ZOOM = 14;
export const MAP_TRACKING_ZOOM = 16;
export const MAP_3D_PITCH = 60;

// Mapbox 라우팅 설정
export const MAPBOX_ROUTING_PROFILE = 'walking' as const;
export const MAPBOX_ROUTING_EXCLUDE = 'unpaved' as const;

// API Timeout (ms)
export const API_TIMEOUT_MS = 10_000;

// 러닝 트래킹 GPS 업데이트 간격 (ms)
export const GPS_UPDATE_INTERVAL_MS = 3_000;
export const GPS_DISTANCE_INTERVAL_METERS = 5;
```

**Step 6: Commit**

```bash
git add src/shared/config/ .env.example .gitignore
git commit -m "chore: add env config and app constants"
```

---

## Task 5: Supabase 클라이언트 + DB 스키마

**Files:**
- Create: `src/shared/api/supabase.ts`
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/migrations/002_postgis_setup.sql`

**Step 1: Supabase 클라이언트 초기화 (`src/shared/api/supabase.ts`)**

```typescript
// src/shared/api/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import env from '@/shared/config/env';
import type { Database } from './database.types';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

**Step 2: DB 타입 정의 (`src/shared/api/database.types.ts`)**

```typescript
// src/shared/api/database.types.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          kakao_id: string | null;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      running_records: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          finished_at: string | null;
          distance_meters: number | null;
          duration_seconds: number | null;
          avg_pace_sec_per_km: number | null;
          route_geojson: GeoJSONLineString | null;
          planned_route_geojson: GeoJSONLineString | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['running_records']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['running_records']['Insert']>;
      };
    };
  };
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // [lng, lat]
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}
```

**Step 3: SQL 마이그레이션 파일 (`supabase/migrations/001_initial_schema.sql`)**

```sql
-- Enable PostGIS extension
create extension if not exists postgis;

-- Profiles 테이블
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  kakao_id text unique,
  username text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Running Records 테이블
create table if not exists public.running_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  distance_meters numeric(10, 2),
  duration_seconds integer,
  avg_pace_sec_per_km integer,
  route_geojson jsonb,       -- 실제 달린 궤적 (GeoJSON LineString)
  planned_route_geojson jsonb, -- 추천 코스 궤적
  created_at timestamptz default now() not null
);

alter table public.running_records enable row level security;

create policy "Users can manage own records"
  on public.running_records for all
  using (auth.uid() = user_id);

-- 새 유저 가입 시 profile 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Step 4: Supabase CLI로 마이그레이션 적용**

```bash
# Supabase CLI가 없다면 설치
pnpm add -D supabase

# 로컬 supabase 초기화 (처음 한 번)
pnpm supabase init

# Supabase 프로젝트에 로그인 및 연결
pnpm supabase login
pnpm supabase link --project-ref <YOUR_PROJECT_REF>

# 마이그레이션 적용
pnpm supabase db push
```

**Step 5: Commit**

```bash
git add src/shared/api/ supabase/
git commit -m "feat: setup supabase client and database schema with PostGIS"
```

---

## Task 6: NativeWind 설정

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Modify: `babel.config.js`
- Modify: `metro.config.js` (또는 생성)

**Step 1: tailwind.config.js 생성**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        surface: '#1a1a2e',
        card: '#16213e',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
```

**Step 2: global.css 생성**

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 3: babel.config.js 수정**

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
```

**Step 4: metro.config.js 생성/수정**

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

**Step 5: nativewind-env.d.ts 생성**

```typescript
// nativewind-env.d.ts
/// <reference types="nativewind/types" />
```

**Step 6: NativeWind 설정 검증**

```bash
pnpm expo start --clear
```

Expected: Metro bundler가 오류 없이 시작

**Step 7: Commit**

```bash
git add tailwind.config.js global.css babel.config.js metro.config.js nativewind-env.d.ts
git commit -m "chore: configure NativeWind v4 with Tailwind CSS"
```

---

## Task 7: 공통 유틸리티 (colorGenerator, routeParser)

**Files:**
- Create: `src/shared/lib/colorGenerator.ts`
- Create: `src/shared/lib/routeParser.ts`
- Create: `src/shared/lib/formatters.ts`
- Create: `src/shared/lib/__tests__/colorGenerator.test.ts`
- Create: `src/shared/lib/__tests__/formatters.test.ts`

**Step 1: 다중 히스토리 색상 생성기 (`src/shared/lib/colorGenerator.ts`)**

```typescript
// src/shared/lib/colorGenerator.ts

/**
 * 다중 히스토리 뷰에서 각 러닝 궤적에 고유 색상을 부여하기 위한 유틸리티
 * PRD 요구사항: 각 궤적마다 고유한 색상(Unique Color)을 동적으로 할당
 */

export const ROUTE_COLOR_PALETTE = [
  '#FF6B6B', // coral red
  '#4ECDC4', // teal
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEAA7', // soft yellow
  '#DDA0DD', // plum
  '#98D8C8', // mint
  '#F7DC6F', // golden
  '#BB8FCE', // lavender
  '#82E0AA', // light green
] as const;

export type RouteColor = typeof ROUTE_COLOR_PALETTE[number];

/**
 * 러닝 기록 ID 배열을 받아 각 기록에 고유 색상을 매핑한 Map을 반환
 * @param recordIds - 러닝 기록 ID 배열
 * @returns Map<recordId, color>
 */
export function generateRouteColorMap(recordIds: string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  recordIds.forEach((id, index) => {
    colorMap.set(id, ROUTE_COLOR_PALETTE[index % ROUTE_COLOR_PALETTE.length]);
  });
  return colorMap;
}

/**
 * 단일 인덱스에 대한 색상 반환
 */
export function getRouteColor(index: number): string {
  return ROUTE_COLOR_PALETTE[index % ROUTE_COLOR_PALETTE.length];
}
```

**Step 2: GeoJSON 경로 파서 (`src/shared/lib/routeParser.ts`)**

```typescript
// src/shared/lib/routeParser.ts
import type { GeoJSONLineString } from '@/shared/api/database.types';

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * GeoJSON LineString → react-native-maps 호환 LatLng 배열 변환
 * GeoJSON: [lng, lat], react-native-maps: { latitude, longitude }
 */
export function geojsonToLatLngArray(geojson: GeoJSONLineString): LatLng[] {
  return geojson.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

/**
 * LatLng 배열 → GeoJSON LineString 변환
 */
export function latLngArrayToGeojson(coords: LatLng[]): GeoJSONLineString {
  return {
    type: 'LineString',
    coordinates: coords.map(({ longitude, latitude }) => [longitude, latitude]),
  };
}

/**
 * 두 좌표 간 거리 계산 (Haversine formula, 미터 단위)
 */
export function calcDistanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371e3;
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/**
 * LatLng 배열의 총 경로 거리 계산 (미터 단위)
 */
export function calcTotalDistanceMeters(coords: LatLng[]): number {
  if (coords.length < 2) return 0;
  return coords.reduce((total, coord, i) => {
    if (i === 0) return 0;
    return total + calcDistanceMeters(coords[i - 1], coord);
  }, 0);
}
```

**Step 3: 포매터 유틸리티 (`src/shared/lib/formatters.ts`)**

```typescript
// src/shared/lib/formatters.ts

/**
 * 초 단위 시간 → "MM:SS" 또는 "HH:MM:SS" 형식 문자열
 */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * 초/km 페이스 → "MM'SS\"" 형식
 */
export function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = secPerKm % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
}

/**
 * 미터 → km 변환 (소수점 2자리)
 */
export function metersToKm(meters: number): number {
  return Math.round((meters / 1000) * 100) / 100;
}
```

**Step 4: 유틸 테스트 (`src/shared/lib/__tests__/colorGenerator.test.ts`)**

```typescript
// src/shared/lib/__tests__/colorGenerator.test.ts
import { generateRouteColorMap, getRouteColor, ROUTE_COLOR_PALETTE } from '../colorGenerator';

describe('colorGenerator', () => {
  it('각 ID에 고유 색상을 매핑해야 한다', () => {
    const ids = ['id-1', 'id-2', 'id-3'];
    const map = generateRouteColorMap(ids);
    expect(map.get('id-1')).toBe(ROUTE_COLOR_PALETTE[0]);
    expect(map.get('id-2')).toBe(ROUTE_COLOR_PALETTE[1]);
    expect(map.get('id-3')).toBe(ROUTE_COLOR_PALETTE[2]);
  });

  it('팔레트 크기를 초과하면 색상을 순환(cycle)해야 한다', () => {
    const ids = Array.from({ length: ROUTE_COLOR_PALETTE.length + 1 }, (_, i) => `id-${i}`);
    const map = generateRouteColorMap(ids);
    expect(map.get(`id-${ROUTE_COLOR_PALETTE.length}`)).toBe(ROUTE_COLOR_PALETTE[0]);
  });

  it('getRouteColor는 index % palette.length를 사용해야 한다', () => {
    expect(getRouteColor(0)).toBe(ROUTE_COLOR_PALETTE[0]);
    expect(getRouteColor(ROUTE_COLOR_PALETTE.length)).toBe(ROUTE_COLOR_PALETTE[0]);
  });
});
```

**Step 5: Formatter 테스트 (`src/shared/lib/__tests__/formatters.test.ts`)**

```typescript
// src/shared/lib/__tests__/formatters.test.ts
import { formatDuration, formatPace, metersToKm } from '../formatters';

describe('formatters', () => {
  describe('formatDuration', () => {
    it('60초 → "01:00"', () => expect(formatDuration(60)).toBe('01:00'));
    it('3600초 → "1:00:00"', () => expect(formatDuration(3600)).toBe('1:00:00'));
    it('3661초 → "1:01:01"', () => expect(formatDuration(3661)).toBe('1:01:01'));
  });

  describe('formatPace', () => {
    it('300초/km → "5\'00\""', () => expect(formatPace(300)).toBe("5'00\""));
    it('330초/km → "5\'30\""', () => expect(formatPace(330)).toBe("5'30\""));
  });

  describe('metersToKm', () => {
    it('5000m → 5km', () => expect(metersToKm(5000)).toBe(5));
    it('1234m → 1.23km', () => expect(metersToKm(1234)).toBe(1.23));
  });
});
```

**Step 6: 테스트 실행**

```bash
pnpm jest src/shared/lib/__tests__/
```

Expected: All 8 tests pass

**Step 7: Commit**

```bash
git add src/shared/lib/
git commit -m "feat: add shared utilities (colorGenerator, routeParser, formatters) with tests"
```

---

## Task 8: 공통 UI 컴포넌트

**Files:**
- Create: `src/shared/ui/Button.tsx`
- Create: `src/shared/ui/Card.tsx`
- Create: `src/shared/ui/SafeAreaWrapper.tsx`
- Create: `src/shared/ui/LoadingSpinner.tsx`
- Create: `src/shared/ui/index.ts`

**Step 1: Button 컴포넌트 (`src/shared/ui/Button.tsx`)**

```typescript
// src/shared/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClass = 'rounded-xl py-4 px-6 items-center justify-center flex-row';
  const variantClass = {
    primary: 'bg-primary-500',
    secondary: 'bg-card border border-primary-500',
    ghost: 'bg-transparent',
  }[variant];
  const textClass = {
    primary: 'text-white font-bold text-base',
    secondary: 'text-primary-500 font-bold text-base',
    ghost: 'text-white font-semibold text-base',
  }[variant];

  return (
    <TouchableOpacity
      className={`${baseClass} ${variantClass} ${disabled || isLoading ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
      <Text className={textClass}>{label}</Text>
    </TouchableOpacity>
  );
}
```

**Step 2: Card 컴포넌트 (`src/shared/ui/Card.tsx`)**

```typescript
// src/shared/ui/Card.tsx
import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-card rounded-2xl p-4 shadow-lg ${className}`}>
      {children}
    </View>
  );
}
```

**Step 3: SafeAreaWrapper (`src/shared/ui/SafeAreaWrapper.tsx`)**

```typescript
// src/shared/ui/SafeAreaWrapper.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeAreaWrapper({ children, className = '' }: SafeAreaWrapperProps) {
  return (
    <SafeAreaView className={`flex-1 bg-surface ${className}`}>
      {children}
    </SafeAreaView>
  );
}
```

**Step 4: LoadingSpinner (`src/shared/ui/LoadingSpinner.tsx`)**

```typescript
// src/shared/ui/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator size="large" color="#22c55e" />
      {message && <Text className="text-white mt-3 text-sm">{message}</Text>}
    </View>
  );
}
```

**Step 5: index.ts 배럴 export (`src/shared/ui/index.ts`)**

```typescript
// src/shared/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { SafeAreaWrapper } from './SafeAreaWrapper';
export { LoadingSpinner } from './LoadingSpinner';
```

**Step 6: Commit**

```bash
git add src/shared/ui/
git commit -m "feat: add shared UI components (Button, Card, SafeAreaWrapper, LoadingSpinner)"
```

---

## Task 9: 인증(Auth) Feature

**Files:**
- Create: `src/features/auth/hooks/useKakaoAuth.ts`
- Create: `src/features/auth/store/authStore.ts`
- Create: `src/features/auth/components/LoginScreen.tsx`
- Create: `src/screens/LoginScreen.tsx`
- Create: `app/(auth)/login.tsx`
- Modify: `src/features/auth/hooks/index.ts`

**Step 1: Auth 전역 상태 (`src/features/auth/store/authStore.ts`)**

```typescript
// src/features/auth/store/authStore.ts
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

**Step 2: 카카오 OAuth 훅 (`src/features/auth/hooks/useKakaoAuth.ts`)**

```typescript
// src/features/auth/hooks/useKakaoAuth.ts
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

      const redirectUrl = makeRedirectUri({ scheme: 'runloop', path: 'auth/callback' });

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
        const code = url.searchParams.get('code');
        if (code) {
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
          setSession(sessionData.session);
        }
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
```

**Step 3: 로그인 화면 컴포넌트 (`src/features/auth/components/LoginScreen.tsx`)**

```typescript
// src/features/auth/components/LoginScreen.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button } from '@/shared/ui';

interface LoginScreenProps {
  onKakaoLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export function LoginScreen({ onKakaoLogin, isLoading, error }: LoginScreenProps) {
  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
      <View className="items-center mb-16">
        <Text className="text-6xl font-black text-primary-500 tracking-tight">RunLoop</Text>
        <Text className="text-gray-400 mt-2 text-center text-base">
          {'매일 새로운 코스로\n러닝의 재미를 발견하세요'}
        </Text>
      </View>

      {error && (
        <View className="bg-red-900/30 border border-red-500 rounded-xl p-3 mb-4 w-full">
          <Text className="text-red-400 text-sm text-center">{error}</Text>
        </View>
      )}

      <Button
        label="카카오로 시작하기"
        onPress={onKakaoLogin}
        isLoading={isLoading}
        className="w-full bg-yellow-400"
      />
    </View>
  );
}
```

**Step 4: Login Screen 조립 (`src/screens/LoginScreen.tsx`)**

```typescript
// src/screens/LoginScreen.tsx
import React from 'react';
import { useKakaoAuth } from '@/features/auth/hooks/useKakaoAuth';
import { LoginScreen as LoginView } from '@/features/auth/components/LoginScreen';

export function LoginScreen() {
  const { signInWithKakao, isLoading, error } = useKakaoAuth();
  return (
    <LoginView
      onKakaoLogin={signInWithKakao}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

**Step 5: Expo Router 라우트 파일 (`app/(auth)/login.tsx`)**

```typescript
// app/(auth)/login.tsx
import { LoginScreen } from '@/screens/LoginScreen';
export default LoginScreen;
```

**Step 6: Commit**

```bash
git add src/features/auth/ src/screens/LoginScreen.tsx app/\(auth\)/
git commit -m "feat: add kakao oauth authentication with Supabase"
```

---

## Task 10: 코스 생성 Feature - Mapbox 안전 라우팅

**Files:**
- Create: `src/features/running/types/route.types.ts`
- Create: `src/features/running/hooks/useGenerateSafeRoute.ts`
- Create: `src/features/running/components/CourseOptionForm.tsx`
- Create: `src/features/running/components/CoursePreviewMap.tsx`
- Create: `src/features/running/store/runningStore.ts`

**Step 1: 러닝 타입 정의 (`src/features/running/types/route.types.ts`)**

```typescript
// src/features/running/types/route.types.ts
import type { GeoJSONLineString } from '@/shared/api/database.types';
import type { RadiusOption } from '@/shared/config/constants';

export interface CourseOptions {
  radiusMeters: RadiusOption;
  targetDistanceKm: number;
  originLatitude: number;
  originLongitude: number;
}

export interface GeneratedCourse {
  routeGeojson: GeoJSONLineString;
  totalDistanceMeters: number;
  estimatedDurationSeconds: number;
  elevationGainMeters?: number;
  waypoints: [number, number][]; // [lng, lat]
}

export type CourseGenerationStatus = 'idle' | 'generating' | 'ready' | 'error';
```

**Step 2: 안전 라우팅 훅 (`src/features/running/hooks/useGenerateSafeRoute.ts`)**

```typescript
// src/features/running/hooks/useGenerateSafeRoute.ts
import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import env from '@/shared/config/env';
import {
  MAPBOX_ROUTING_PROFILE,
  MAPBOX_ROUTING_EXCLUDE,
  API_TIMEOUT_MS,
} from '@/shared/config/constants';
import type { CourseOptions, GeneratedCourse } from '../types/route.types';

/**
 * 지정된 반경 내 랜덤 경유 지점 생성
 * 기준 좌표 주변의 임의의 방향과 거리로 3-4개 경유점 계산
 */
function generateRandomWaypoints(
  lat: number,
  lng: number,
  radiusMeters: number,
  targetDistanceKm: number
): [number, number][] {
  const numPoints = Math.min(3 + Math.floor(targetDistanceKm / 3), 5);
  const points: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI + (Math.random() * Math.PI) / numPoints;
    // 반경의 60-90% 범위 내 임의 거리
    const distance = radiusMeters * (0.6 + Math.random() * 0.3);
    const deltaLat = (distance * Math.cos(angle)) / 111_320;
    const deltaLng = (distance * Math.sin(angle)) / (111_320 * Math.cos((lat * Math.PI) / 180));
    points.push([lng + deltaLng, lat + deltaLat]);
  }

  return points;
}

async function fetchSafeRoute(options: CourseOptions): Promise<GeneratedCourse> {
  const { originLatitude: lat, originLongitude: lng, radiusMeters, targetDistanceKm } = options;
  const waypoints = generateRandomWaypoints(lat, lng, radiusMeters, targetDistanceKm);

  // 시작점과 종료점을 동일하게 설정 (Loop 코스)
  const origin = `${lng},${lat}`;
  const coordinates = [origin, ...waypoints.map((w) => w.join(',')), origin].join(';');

  // [중요] 보행자 프로필 + 비포장도로 제외 (PRD 안전 라우팅 규칙)
  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/${MAPBOX_ROUTING_PROFILE}/${coordinates}`
  );
  url.searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('overview', 'full');
  url.searchParams.set('exclude', MAPBOX_ROUTING_EXCLUDE);
  url.searchParams.set('annotations', 'distance,duration');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) throw new Error(`Mapbox API 오류: ${response.status}`);

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) throw new Error('경로를 생성할 수 없습니다.');

    return {
      routeGeojson: route.geometry as GeoJSONLineString,
      totalDistanceMeters: route.distance,
      estimatedDurationSeconds: route.duration,
      waypoints,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function useGenerateSafeRoute() {
  const [course, setCourse] = useState<GeneratedCourse | null>(null);

  const mutation = useMutation({
    mutationFn: fetchSafeRoute,
    onSuccess: (data) => setCourse(data),
  });

  const generateCourse = useCallback(
    (options: CourseOptions) => mutation.mutate(options),
    [mutation]
  );

  const reset = useCallback(() => {
    setCourse(null);
    mutation.reset();
  }, [mutation]);

  return {
    course,
    generateCourse,
    regenerateCourse: generateCourse,
    reset,
    status: mutation.status,
    error: mutation.error,
    isGenerating: mutation.isPending,
  };
}
```

**Step 3: 코스 옵션 폼 (`src/features/running/components/CourseOptionForm.tsx`)**

```typescript
// src/features/running/components/CourseOptionForm.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  RADIUS_OPTIONS,
  MIN_TARGET_DISTANCE_KM,
  MAX_TARGET_DISTANCE_KM,
  TARGET_DISTANCE_STEP_KM,
} from '@/shared/config/constants';
import type { RadiusOption } from '@/shared/config/constants';
import { Button } from '@/shared/ui';

interface CourseOptionFormProps {
  selectedRadius: RadiusOption;
  targetDistanceKm: number;
  onRadiusChange: (radius: RadiusOption) => void;
  onDistanceChange: (km: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const RADIUS_LABELS: Record<RadiusOption, string> = {
  500: '500m',
  1000: '1km',
  5000: '5km',
};

export function CourseOptionForm({
  selectedRadius,
  targetDistanceKm,
  onRadiusChange,
  onDistanceChange,
  onGenerate,
  isLoading,
}: CourseOptionFormProps) {
  return (
    <View className="p-4 bg-card rounded-2xl">
      <Text className="text-white font-bold text-lg mb-4">코스 옵션</Text>

      {/* 반경 선택 */}
      <View className="mb-6">
        <Text className="text-gray-400 text-sm mb-2">탐색 반경</Text>
        <View className="flex-row gap-2">
          {RADIUS_OPTIONS.map((radius) => (
            <TouchableOpacity
              key={radius}
              onPress={() => onRadiusChange(radius)}
              className={`flex-1 py-3 rounded-xl items-center ${
                selectedRadius === radius ? 'bg-primary-500' : 'bg-surface'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedRadius === radius ? 'text-white' : 'text-gray-400'
                }`}
              >
                {RADIUS_LABELS[radius]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 거리 슬라이더 */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-400 text-sm">목표 거리</Text>
          <Text className="text-primary-500 font-bold text-lg">{targetDistanceKm}km</Text>
        </View>
        <Slider
          minimumValue={MIN_TARGET_DISTANCE_KM}
          maximumValue={MAX_TARGET_DISTANCE_KM}
          step={TARGET_DISTANCE_STEP_KM}
          value={targetDistanceKm}
          onValueChange={(v) => onDistanceChange(Math.round(v))}
          minimumTrackTintColor="#22c55e"
          maximumTrackTintColor="#374151"
          thumbTintColor="#22c55e"
        />
      </View>

      <Button label="코스 생성하기" onPress={onGenerate} isLoading={isLoading} />
    </View>
  );
}
```

**Step 4: Commit**

```bash
git add src/features/running/
git commit -m "feat: add safe route generation with Mapbox pedestrian routing"
```

---

## Task 11: 러닝 트래킹 Feature

**Files:**
- Create: `src/features/running/hooks/useRunningTracker.ts`
- Create: `src/features/running/store/runningStore.ts`
- Create: `src/features/running/components/RunningHUD.tsx`
- Create: `src/features/running/components/RunningMap.tsx`

**Step 1: 러닝 상태 스토어 (`src/features/running/store/runningStore.ts`)**

```typescript
// src/features/running/store/runningStore.ts
import { create } from 'zustand';
import type { GeoJSONLineString } from '@/shared/api/database.types';
import type { GeneratedCourse } from '../types/route.types';

type RunningPhase = 'idle' | 'ready' | 'running' | 'paused' | 'finished';

interface RunningState {
  phase: RunningPhase;
  plannedCourse: GeneratedCourse | null;
  trackedCoords: { latitude: number; longitude: number }[];
  elapsedSeconds: number;
  distanceMeters: number;
  currentPaceSecPerKm: number;

  setPhase: (phase: RunningPhase) => void;
  setPlannedCourse: (course: GeneratedCourse) => void;
  appendCoord: (coord: { latitude: number; longitude: number }) => void;
  setElapsedSeconds: (seconds: number) => void;
  setDistanceMeters: (meters: number) => void;
  setCurrentPace: (secPerKm: number) => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as RunningPhase,
  plannedCourse: null,
  trackedCoords: [],
  elapsedSeconds: 0,
  distanceMeters: 0,
  currentPaceSecPerKm: 0,
};

export const useRunningStore = create<RunningState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setPlannedCourse: (course) => set({ plannedCourse: course }),
  appendCoord: (coord) =>
    set((state) => ({ trackedCoords: [...state.trackedCoords, coord] })),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  setDistanceMeters: (distanceMeters) => set({ distanceMeters }),
  setCurrentPace: (currentPaceSecPerKm) => set({ currentPaceSecPerKm }),
  reset: () => set(initialState),
}));
```

**Step 2: GPS 트래킹 훅 (`src/features/running/hooks/useRunningTracker.ts`)**

```typescript
// src/features/running/hooks/useRunningTracker.ts
import { useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { GPS_UPDATE_INTERVAL_MS, GPS_DISTANCE_INTERVAL_METERS } from '@/shared/config/constants';
import { calcDistanceMeters } from '@/shared/lib/routeParser';
import { useRunningStore } from '../store/runningStore';

export function useRunningTracker() {
  const {
    phase,
    trackedCoords,
    setPhase,
    appendCoord,
    setElapsedSeconds,
    setDistanceMeters,
    setCurrentPace,
    distanceMeters,
    elapsedSeconds,
    reset,
  } = useRunningStore();

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const accumulatedDistRef = useRef<number>(0);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('위치 권한이 필요합니다.');
    }

    await Location.requestBackgroundPermissionsAsync();

    setPhase('running');
    startTimeRef.current = Date.now();
    accumulatedDistRef.current = 0;

    // 타이머 시작
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    // GPS 위치 추적 시작
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: GPS_UPDATE_INTERVAL_MS,
        distanceInterval: GPS_DISTANCE_INTERVAL_METERS,
      },
      ({ coords }) => {
        const newCoord = { latitude: coords.latitude, longitude: coords.longitude };
        appendCoord(newCoord);

        if (lastCoordRef.current) {
          const delta = calcDistanceMeters(lastCoordRef.current, newCoord);
          accumulatedDistRef.current += delta;
          setDistanceMeters(accumulatedDistRef.current);

          const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
          if (accumulatedDistRef.current > 0 && elapsed > 0) {
            const paceSecPerKm = elapsed / (accumulatedDistRef.current / 1000);
            setCurrentPace(Math.round(paceSecPerKm));
          }
        }

        lastCoordRef.current = newCoord;
      }
    );
  }, [appendCoord, setPhase, setElapsedSeconds, setDistanceMeters, setCurrentPace]);

  const stopTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('finished');
  }, [setPhase]);

  const pauseTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('paused');
  }, [setPhase]);

  useEffect(() => {
    return () => {
      locationSubscription.current?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    phase,
    trackedCoords,
    distanceMeters,
    elapsedSeconds,
    startTracking,
    stopTracking,
    pauseTracking,
    reset,
  };
}
```

**Step 3: 러닝 HUD 컴포넌트 (`src/features/running/components/RunningHUD.tsx`)**

```typescript
// src/features/running/components/RunningHUD.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { formatDuration, formatPace, metersToKm } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui';

interface RunningHUDProps {
  elapsedSeconds: number;
  distanceMeters: number;
  paceSecPerKm: number;
  onStop: () => void;
  onPause: () => void;
}

export function RunningHUD({
  elapsedSeconds,
  distanceMeters,
  paceSecPerKm,
  onStop,
  onPause,
}: RunningHUDProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-card/95 rounded-t-3xl px-6 pt-4 pb-8">
      {/* 메인 거리 표시 - Glanceable UI */}
      <Text className="text-white text-7xl font-black text-center tracking-tighter">
        {metersToKm(distanceMeters).toFixed(2)}
      </Text>
      <Text className="text-gray-400 text-center text-sm mb-4">km</Text>

      {/* 페이스 / 시간 */}
      <View className="flex-row justify-around mb-6">
        <View className="items-center">
          <Text className="text-white text-2xl font-bold">
            {paceSecPerKm > 0 ? formatPace(paceSecPerKm) : '--:--'}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">페이스 /km</Text>
        </View>
        <View className="w-px bg-gray-700" />
        <View className="items-center">
          <Text className="text-white text-2xl font-bold">{formatDuration(elapsedSeconds)}</Text>
          <Text className="text-gray-500 text-xs mt-1">경과 시간</Text>
        </View>
      </View>

      {/* 컨트롤 버튼 */}
      <View className="flex-row gap-3">
        <Button label="일시정지" onPress={onPause} variant="secondary" className="flex-1" />
        <Button label="종료" onPress={onStop} className="flex-1 bg-red-600" />
      </View>
    </View>
  );
}
```

**Step 4: 러닝 맵 컴포넌트 (`src/features/running/components/RunningMap.tsx`)**

```typescript
// src/features/running/components/RunningMap.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MAP_TRACKING_ZOOM } from '@/shared/config/constants';
import { geojsonToLatLngArray } from '@/shared/lib/routeParser';
import type { LatLng } from '@/shared/lib/routeParser';
import type { GeneratedCourse } from '../types/route.types';

interface RunningMapProps {
  plannedCourse: GeneratedCourse | null;
  trackedCoords: LatLng[];
  currentLocation: LatLng | null;
}

export function RunningMap({ plannedCourse, trackedCoords, currentLocation }: RunningMapProps) {
  const plannedCoords = useMemo(
    () => (plannedCourse ? geojsonToLatLngArray(plannedCourse.routeGeojson) : []),
    [plannedCourse]
  );

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        followsUserLocation
      >
        {/* 추천 코스 (목표 궤적) - 반투명 회색 */}
        {plannedCoords.length > 1 && (
          <Polyline
            coordinates={plannedCoords}
            strokeColor="rgba(156, 163, 175, 0.7)"
            strokeWidth={4}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* 실제 달린 궤적 - 선명한 녹색 */}
        {trackedCoords.length > 1 && (
          <Polyline
            coordinates={trackedCoords}
            strokeColor="#22c55e"
            strokeWidth={5}
          />
        )}

        {/* 시작점 마커 */}
        {plannedCoords.length > 0 && (
          <Marker coordinate={plannedCoords[0]} title="출발/도착" pinColor="#22c55e" />
        )}
      </MapView>
    </View>
  );
}
```

**Step 5: Commit**

```bash
git add src/features/running/
git commit -m "feat: add real-time running tracker with GPS and HUD display"
```

---

## Task 12: 히스토리(History) Feature

**Files:**
- Create: `src/features/history/types/history.types.ts`
- Create: `src/features/history/hooks/useRunningHistory.ts`
- Create: `src/features/history/hooks/useMultiHistoryMap.ts`
- Create: `src/features/history/components/HistoryListItem.tsx`
- Create: `src/features/history/components/MultiHistoryMap.tsx`

**Step 1: 히스토리 타입 (`src/features/history/types/history.types.ts`)**

```typescript
// src/features/history/types/history.types.ts
import type { Database, GeoJSONLineString } from '@/shared/api/database.types';

export type RunningRecord = Database['public']['Tables']['running_records']['Row'];

export interface RunningRecordWithColor extends RunningRecord {
  color: string;
}
```

**Step 2: 히스토리 데이터 훅 (`src/features/history/hooks/useRunningHistory.ts`)**

```typescript
// src/features/history/hooks/useRunningHistory.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { RunningRecord } from '../types/history.types';

async function fetchRunningHistory(userId: string): Promise<RunningRecord[]> {
  const { data, error } = await supabase
    .from('running_records')
    .select('*')
    .eq('user_id', userId)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useRunningHistory() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['running-history', user?.id],
    queryFn: () => fetchRunningHistory(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  });
}
```

**Step 3: 다중 히스토리 맵 훅 (`src/features/history/hooks/useMultiHistoryMap.ts`)**

```typescript
// src/features/history/hooks/useMultiHistoryMap.ts
import { useMemo, useState } from 'react';
import { generateRouteColorMap } from '@/shared/lib/colorGenerator';
import { geojsonToLatLngArray } from '@/shared/lib/routeParser';
import type { RunningRecord, RunningRecordWithColor } from '../types/history.types';

export function useMultiHistoryMap(records: RunningRecord[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRecord = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(records.map((r) => r.id)));
  const clearAll = () => setSelectedIds(new Set());

  // 선택된 기록들에 고유 색상 매핑
  const colorMap = useMemo(
    () => generateRouteColorMap(records.map((r) => r.id)),
    [records]
  );

  // 렌더링에 필요한 폴리라인 데이터 준비 (useMemo로 성능 최적화)
  const selectedRoutes = useMemo(() => {
    return records
      .filter((r) => selectedIds.has(r.id) && r.route_geojson)
      .map((r) => ({
        id: r.id,
        coords: geojsonToLatLngArray(r.route_geojson!),
        color: colorMap.get(r.id) ?? '#22c55e',
        startedAt: r.started_at,
      }));
  }, [records, selectedIds, colorMap]);

  return {
    selectedIds,
    toggleRecord,
    selectAll,
    clearAll,
    selectedRoutes,
    colorMap,
  };
}
```

**Step 4: 히스토리 리스트 아이템 (`src/features/history/components/HistoryListItem.tsx`)**

```typescript
// src/features/history/components/HistoryListItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatDuration, formatPace, metersToKm } from '@/shared/lib/formatters';
import type { RunningRecord } from '../types/history.types';

interface HistoryListItemProps {
  record: RunningRecord;
  isSelected?: boolean;
  color?: string;
  onPress?: () => void;
  onToggleSelect?: () => void;
}

export function HistoryListItem({
  record,
  isSelected,
  color,
  onPress,
  onToggleSelect,
}: HistoryListItemProps) {
  const date = new Date(record.started_at).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <TouchableOpacity
      className={`bg-card rounded-2xl p-4 mb-3 border-2 ${
        isSelected ? 'border-primary-500' : 'border-transparent'
      }`}
      onPress={onPress ?? onToggleSelect}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        {/* 색상 인디케이터 (다중 선택 시) */}
        {color && (
          <View
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: color }}
          />
        )}
        <View className="flex-1">
          <Text className="text-gray-400 text-xs mb-1">{date}</Text>
          <View className="flex-row gap-4">
            <View>
              <Text className="text-white font-bold text-lg">
                {metersToKm(record.distance_meters ?? 0)}
                <Text className="text-gray-400 font-normal text-sm">km</Text>
              </Text>
            </View>
            <View>
              <Text className="text-white font-semibold">
                {formatDuration(record.duration_seconds ?? 0)}
              </Text>
            </View>
            {record.avg_pace_sec_per_km && (
              <View>
                <Text className="text-primary-500 font-semibold">
                  {formatPace(record.avg_pace_sec_per_km)}
                  <Text className="text-gray-400 font-normal text-xs">/km</Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
```

**Step 5: 다중 히스토리 맵 컴포넌트 (`src/features/history/components/MultiHistoryMap.tsx`)**

```typescript
// src/features/history/components/MultiHistoryMap.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { LatLng } from '@/shared/lib/routeParser';

interface RouteLayer {
  id: string;
  coords: LatLng[];
  color: string;
  startedAt: string;
}

interface MultiHistoryMapProps {
  routes: RouteLayer[];
}

export function MultiHistoryMap({ routes }: MultiHistoryMapProps) {
  // 전체 bounds 계산 (useMemo로 최적화)
  const region = useMemo(() => {
    const allCoords = routes.flatMap((r) => r.coords);
    if (allCoords.length === 0) return undefined;

    const lats = allCoords.map((c) => c.latitude);
    const lngs = allCoords.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.4 + 0.005,
      longitudeDelta: (maxLng - minLng) * 1.4 + 0.005,
    };
  }, [routes]);

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        provider={PROVIDER_GOOGLE}
        region={region}
      >
        {/* 각 러닝 기록을 고유 색상 폴리라인으로 렌더링 */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coords}
            strokeColor={route.color}
            strokeWidth={4}
          />
        ))}
      </MapView>
    </View>
  );
}
```

**Step 6: Commit**

```bash
git add src/features/history/
git commit -m "feat: add running history feature with multi-view map and unique color routing"
```

---

## Task 13: Screens 조립 및 Expo Router 네비게이션

**Files:**
- Create: `app/_layout.tsx` (루트 레이아웃)
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(main)/_layout.tsx`
- Create: `app/(main)/index.tsx` (홈: 코스 생성)
- Create: `app/(main)/running.tsx` (러닝 트래킹)
- Create: `app/(main)/history.tsx` (히스토리)
- Create: `src/app/Providers.tsx` (QueryClient, SafeArea 등)

**Step 1: 루트 프로바이더 (`src/app/Providers.tsx`)**

```typescript
// src/app/Providers.tsx
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
```

**Step 2: 루트 레이아웃 (`app/_layout.tsx`)**

```typescript
// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Providers } from '@/app/Providers';
import '../global.css';

export default function RootLayout() {
  const { setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
```

**Step 3: 인증 그룹 레이아웃 (`app/(auth)/_layout.tsx`)**

```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Step 4: 메인 그룹 레이아웃 (`app/(main)/_layout.tsx`)**

```typescript
// app/(main)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#16213e', borderTopColor: '#1f2937' },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '코스 생성',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="running"
        options={{
          title: '달리기',
          tabBarIcon: ({ color, size }) => <Ionicons name="fitness" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

**Step 5: 홈 화면 (`app/(main)/index.tsx`)**

```typescript
// app/(main)/index.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { SafeAreaWrapper, Button, Card, LoadingSpinner } from '@/shared/ui';
import { CourseOptionForm } from '@/features/running/components/CourseOptionForm';
import { useGenerateSafeRoute } from '@/features/running/hooks/useGenerateSafeRoute';
import { useRunningStore } from '@/features/running/store/runningStore';
import type { RadiusOption } from '@/shared/config/constants';

export default function HomeScreen() {
  const router = useRouter();
  const [radius, setRadius] = useState<RadiusOption>(1000);
  const [distance, setDistance] = useState(5);
  const { generateCourse, regenerateCourse, course, isGenerating, reset } = useGenerateSafeRoute();
  const { setPlannedCourse } = useRunningStore();

  const handleGenerate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    generateCourse({
      radiusMeters: radius,
      targetDistanceKm: distance,
      originLatitude: location.coords.latitude,
      originLongitude: location.coords.longitude,
    });
  };

  const handleAccept = () => {
    if (!course) return;
    setPlannedCourse(course);
    router.push('/(main)/running');
  };

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-white text-3xl font-black mb-6">RunLoop</Text>
        <CourseOptionForm
          selectedRadius={radius}
          targetDistanceKm={distance}
          onRadiusChange={setRadius}
          onDistanceChange={setDistance}
          onGenerate={handleGenerate}
          isLoading={isGenerating}
        />

        {course && (
          <Card className="mt-4">
            <Text className="text-white font-bold text-lg mb-2">코스 생성 완료!</Text>
            <Text className="text-gray-400">
              거리: {(course.totalDistanceMeters / 1000).toFixed(2)}km
            </Text>
            <Text className="text-gray-400 mb-4">
              예상 시간: {Math.round(course.estimatedDurationSeconds / 60)}분
            </Text>
            <View className="gap-2">
              <Button label="이 코스로 달리기" onPress={handleAccept} />
              <Button label="다시 생성하기" onPress={() => regenerateCourse({ radiusMeters: radius, targetDistanceKm: distance, originLatitude: 0, originLongitude: 0 })} variant="secondary" />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}
```

**Step 6: Commit**

```bash
git add app/ src/app/
git commit -m "feat: assemble screens with expo-router tab navigation"
```

---

## Task 14: 러닝 완료 후 Supabase 저장 로직

**Files:**
- Create: `src/features/running/hooks/useSaveRunningRecord.ts`
- Modify: `app/(main)/running.tsx`

**Step 1: 러닝 기록 저장 훅 (`src/features/running/hooks/useSaveRunningRecord.ts`)**

```typescript
// src/features/running/hooks/useSaveRunningRecord.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/features/auth/store/authStore';
import { latLngArrayToGeojson } from '@/shared/lib/routeParser';
import type { LatLng } from '@/shared/lib/routeParser';
import type { GeoJSONLineString } from '@/shared/api/database.types';

interface SaveRunningPayload {
  startedAt: Date;
  trackedCoords: LatLng[];
  elapsedSeconds: number;
  distanceMeters: number;
  plannedRouteGeojson: GeoJSONLineString | null;
}

export function useSaveRunningRecord() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveRunningPayload) => {
      if (!user?.id) throw new Error('로그인이 필요합니다.');

      const avgPace =
        payload.distanceMeters > 0
          ? Math.round(payload.elapsedSeconds / (payload.distanceMeters / 1000))
          : null;

      const { error } = await supabase.from('running_records').insert({
        user_id: user.id,
        started_at: payload.startedAt.toISOString(),
        finished_at: new Date().toISOString(),
        distance_meters: payload.distanceMeters,
        duration_seconds: payload.elapsedSeconds,
        avg_pace_sec_per_km: avgPace,
        route_geojson: latLngArrayToGeojson(payload.trackedCoords),
        planned_route_geojson: payload.plannedRouteGeojson,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      // 히스토리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['running-history'] });
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/features/running/hooks/useSaveRunningRecord.ts
git commit -m "feat: add running record save mutation with Supabase"
```

---

## Task 15: 최종 통합 검증

**Step 1: TypeScript 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 0 errors

**Step 2: 린트 체크**

```bash
pnpm eslint src/ app/ --ext .ts,.tsx
```

Expected: 0 warnings, 0 errors

**Step 3: 단위 테스트 실행**

```bash
pnpm jest --coverage
```

Expected: All tests pass, coverage > 70% on shared/lib

**Step 4: Expo 빌드 확인**

```bash
pnpm expo start --clear
```

Expected: Metro bundler starts without errors

**Step 5: 최종 커밋**

```bash
git add .
git commit -m "chore: final integration - all features implemented per PRD"
```

---

## 부록: 주요 환경변수 설정 가이드

### Supabase 설정
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. Authentication → Providers → Kakao 활성화
3. Settings → API에서 URL과 anon key 복사
4. `.env.local`에 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` 입력

### Mapbox 설정
1. [mapbox.com](https://mapbox.com)에서 계정 생성 및 Access Token 발급
2. `.env.local`에 `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` 입력

### 카카오 개발자 설정
1. [developers.kakao.com](https://developers.kakao.com)에서 앱 생성
2. 플랫폼 → iOS/Android 번들 ID 등록
3. 카카오 로그인 → 활성화
4. Supabase Dashboard에서 Kakao OAuth 설정

---

*Plan generated: 2026-03-17*
*Based on: AGENTS.md (PRD) + .cursor/rules/project-rules.mdc*
