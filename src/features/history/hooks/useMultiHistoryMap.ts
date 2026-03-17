// src/features/history/hooks/useMultiHistoryMap.ts
import { useMemo, useState } from 'react';
import { generateRouteColorMap } from '@/shared/lib/colorGenerator';
import { geojsonToLatLngArray } from '@/shared/lib/routeParser';
import type { RunningRecord } from '../types/history.types';

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

  // 선택된 기록들에 고유 색상 매핑 (PRD: 각 궤적마다 고유한 색상)
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
