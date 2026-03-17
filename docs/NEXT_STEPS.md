# RunLoop - 다음 작업 가이드

> 다른 환경에서 이어서 개발할 때 이 문서를 먼저 읽고 Claude에게 작업을 요청하세요.

---

## 새 맥북 환경 세팅

```bash
# 1. 클론
git clone git@github.com:dlwlsdn201/project--recommand-running-course-app--rn.git
cd project--recommand-running-course-app--rn

# 2. 의존성 설치 (pnpm만 사용 - npm/yarn 금지)
pnpm install

# 3. 환경변수 파일 생성
cp .env.example .env.local
# .env.local을 열어서 아래 4개 값 채우기

# 4. 검증
pnpm tsc --noEmit   # 0 errors 확인
pnpm jest           # 16/16 pass 확인
pnpm expo start     # Metro 번들러 정상 기동 확인
```

---

## 1단계: 백엔드 런타임 설정 (필수 - 앱 실행 전 완료)

### 1-1. 환경변수 (.env.local)

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
EXPO_PUBLIC_KAKAO_APP_KEY=abcdef1234
```

각 키 발급 위치:
- **Supabase**: [supabase.com](https://supabase.com) → 프로젝트 → Settings → API
- **Mapbox**: [mapbox.com](https://mapbox.com) → Tokens
- **Kakao**: [developers.kakao.com](https://developers.kakao.com) → 앱 → 앱 키 → REST API 키

### 1-2. Supabase DB 마이그레이션

Supabase 대시보드 → SQL Editor에서 아래 파일 실행:

```
supabase/migrations/001_initial_schema.sql
```

실행 내용: PostGIS extension, profiles 테이블, running_records 테이블, RLS 정책, 신규 유저 트리거

### 1-3. Kakao OAuth 설정

1. [Supabase 대시보드](https://supabase.com) → Authentication → Providers → Kakao 활성화
2. Kakao Developers → 앱 → 카카오 로그인 → 활성화
3. Kakao Developers → 플랫폼 → iOS/Android 번들 ID 등록
   - iOS: `com.runloop.app` (app.json의 bundleIdentifier)
   - Android: `com.runloop.app` (app.json의 package)
4. Redirect URI: `runloop://auth/callback`

---

## 2단계: 코드 작업 - 버그 수정 (우선순위 높음)

> Claude에게 요청할 때: "docs/NEXT_STEPS.md의 2단계 작업을 진행해줘"

### BUG-1: Auth Guard 미구현 (앱 흐름 깨짐)

**문제**: `app/_layout.tsx`에 인증 상태에 따른 화면 리다이렉트 로직이 없음. 로그인 안 된 유저가 메인 탭에 접근 가능.

**구현 위치**: `app/_layout.tsx`

**구현 내용**:
```typescript
// useAuthStore의 session, isLoading을 보고
// isLoading: true → LoadingSpinner 표시
// session: null → router.replace('/(auth)/login')
// session: 존재 → router.replace('/(main)')
```

### BUG-2: 러닝 시작 시 startedAt 저장 누락

**문제**: `useRunningTracker.ts`의 `startTracking()`에서 `setStartedAt(new Date())`를 호출하지 않아 러닝 기록 저장 시 `startedAt`이 항상 `null`이 됨.

**구현 위치**: `src/features/running/hooks/useRunningTracker.ts`

**수정 내용**: `startTracking()` 함수 안에서 `setPhase('running')` 직후 `setStartedAt(new Date())` 추가.

### BUG-3: Pause → Resume 로직 오작동

**문제**: `app/(main)/running.tsx`에서 일시정지 상태일 때 버튼이 `handleStart`를 호출하는데, `handleStart`는 GPS 권한을 다시 요청하고 타이머를 초기화함. Resume이 아닌 fresh start가 됨.

**구현 위치**: `src/features/running/hooks/useRunningTracker.ts` + `app/(main)/running.tsx`

**수정 내용**: `useRunningTracker`에 `resumeTracking()` 함수 추가. pause 시 경과 시간을 ref로 보존해 재개 시 이어서 계산.

---

## 3단계: 코드 작업 - 미완성 기능 (우선순위 중간)

> Claude에게 요청할 때: "docs/NEXT_STEPS.md의 3단계 작업을 진행해줘"

### FEAT-1: 코스 미리보기 지도 (CoursePreviewMap)

**문제**: 홈 화면(`app/(main)/index.tsx`)에서 코스 생성 후 지도 미리보기 없이 텍스트만 표시됨. PRD 3.4에 "제안된 코스" 표시 명시.

**구현 위치**:
- `src/features/running/components/CoursePreviewMap.tsx` (신규)
- `app/(main)/index.tsx` (수정 - CoursePreviewMap 삽입)

**구현 내용**: 생성된 코스의 GeoJSON을 react-native-maps Polyline으로 표시. 시작/종료 Marker 포함.

### FEAT-2: 히스토리 상세 화면

**문제**: `app/(main)/history.tsx`에서 기록 탭 → 상세 화면 이동 없음. 단일 기록 선택 시 상세 분석 뷰 필요 (PRD 3.7).

**구현 위치**:
- `app/(main)/history/[id].tsx` (신규 - 동적 라우트)
- `src/features/history/components/HistoryDetailView.tsx` (신규)

**구현 내용**: 특정 기록의 달린 궤적 지도 + 거리/시간/페이스 상세 표시.

### FEAT-3: 러닝 중 일시정지 → 재개 UI 개선

**문제**: 현재 일시정지 시 "일시 정지됨" 배너만 표시됨. 재개 버튼이 명확하지 않음.

**구현 위치**: `app/(main)/running.tsx`

**구현 내용**: pause 상태에서 HUD 버튼을 "재개" + "종료" 두 버튼으로 교체.

---

## 4단계: 코드 작업 - PRD 완성 기능 (우선순위 낮음)

> Claude에게 요청할 때: "docs/NEXT_STEPS.md의 4단계 작업을 진행해줘"

### FEAT-4: 고도(Elevation) 데이터 표시

**PRD 3.3**: "코스의 총 거리 및 예상 소요 시간, 고도 정보를 함께 제공"

- Mapbox Directions API `annotations`에 `congestion` 외에 elevation 요청
- `GeneratedCourse` 타입에 `elevationGainMeters` 필드 활성화
- 홈 화면 코스 결과 카드에 고도 표시 추가

### FEAT-5: 3D 맵 뷰 (히스토리 상세)

**PRD 3.7**: "3D/2D 맵에 시각화"

- `@rnmapbox/maps`의 `MapView` + `Camera pitch` 활용
- 히스토리 상세 화면에 2D/3D 토글 버튼 추가

### FEAT-6: 카카오 로그인 후 프로필 자동 등록 확인

**체크 필요**: Supabase `handle_new_user` 트리거가 카카오 OAuth 유저에 대해 정상 동작하는지 실 기기에서 확인.

---

## 현재 구현 완료 상태

| 구분 | 파일 | 상태 |
|------|------|------|
| 인증 | `src/features/auth/` | ✅ 완료 |
| 코스 생성 | `src/features/running/hooks/useGenerateSafeRoute.ts` | ✅ 완료 |
| 코스 옵션 UI | `src/features/running/components/CourseOptionForm.tsx` | ✅ 완료 |
| GPS 트래킹 | `src/features/running/hooks/useRunningTracker.ts` | ⚠️ BUG-2,3 |
| 러닝 HUD | `src/features/running/components/RunningHUD.tsx` | ✅ 완료 |
| 러닝 지도 | `src/features/running/components/RunningMap.tsx` | ✅ 완료 |
| 기록 저장 | `src/features/running/hooks/useSaveRunningRecord.ts` | ✅ 완료 |
| 히스토리 목록 | `src/features/history/` | ✅ 완료 |
| 다중 히스토리 맵 | `src/features/history/components/MultiHistoryMap.tsx` | ✅ 완료 |
| 네비게이션 | `app/_layout.tsx`, `app/(main)/_layout.tsx` | ⚠️ BUG-1 |
| 홈 화면 | `app/(main)/index.tsx` | ⚠️ FEAT-1 |
| 러닝 화면 | `app/(main)/running.tsx` | ⚠️ BUG-3 |
| 히스토리 화면 | `app/(main)/history.tsx` | ⚠️ FEAT-2 |

---

## Claude에게 작업 요청 방법

새 맥북에서 Claude Code를 열고 아래처럼 요청하세요:

```
@docs/NEXT_STEPS.md 와 @AGENTS.md 를 참고해서 2단계 버그 수정 작업을 진행해줘.
```

또는 특정 항목만:

```
@docs/NEXT_STEPS.md 의 BUG-1 (Auth Guard) 를 구현해줘.
```
