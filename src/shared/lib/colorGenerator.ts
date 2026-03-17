// src/shared/lib/colorGenerator.ts
/**
 * 다중 히스토리 뷰에서 각 러닝 궤적에 고유 색상을 부여하기 위한 유틸리티
 * PRD 요구사항: 다중 히스토리 뷰 활성화 시 각 궤적마다 고유한 색상(Unique Color) 동적 할당
 * project-rules.mdc: 색상값을 컴포넌트 내 하드코딩 금지, 이 파일을 통해서만 할당
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

export type RouteColor = (typeof ROUTE_COLOR_PALETTE)[number];

/**
 * 러닝 기록 ID 배열을 받아 각 기록에 고유 색상을 매핑한 Map을 반환
 * 팔레트 크기 초과 시 순환(cycle) 적용
 * @param recordIds - 러닝 기록 ID 배열
 * @returns Map<recordId, hexColor>
 */
export function generateRouteColorMap(recordIds: string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  recordIds.forEach((id, index) => {
    colorMap.set(id, ROUTE_COLOR_PALETTE[index % ROUTE_COLOR_PALETTE.length]);
  });
  return colorMap;
}

/**
 * 단일 인덱스에 대한 색상 반환 (팔레트 순환 적용)
 */
export function getRouteColor(index: number): string {
  return ROUTE_COLOR_PALETTE[index % ROUTE_COLOR_PALETTE.length];
}
