// src/shared/lib/formatters.ts
import { METERS_PER_KM } from '@/shared/config/constants';

/**
 * 초 단위 시간 → "MM:SS" 또는 "H:MM:SS" 형식 문자열
 * 예: 65 → "01:05", 3661 → "1:01:01"
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
 * 예: 300 → "5'00\"", 330 → "5'30\""
 */
export function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = secPerKm % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
}

/**
 * 미터 → km 변환 (소수점 2자리)
 * 예: 5000 → 5, 1234 → 1.23
 */
export function metersToKm(meters: number): number {
  return Math.round((meters / METERS_PER_KM) * 100) / 100;
}
