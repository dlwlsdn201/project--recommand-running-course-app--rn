/**
 * history 탭 내부 네비게이션 - index(목록) + [id](상세)를 Stack으로 처리.
 * 없을 경우 동적 라우트 [id]에서 route params 접근 시 "right operand of 'in' is not an object" 오류 발생.
 */
import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
