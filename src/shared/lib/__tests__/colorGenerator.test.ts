import { generateRouteColorMap, getRouteColor, ROUTE_COLOR_PALETTE } from '../colorGenerator';

describe('colorGenerator', () => {
  describe('generateRouteColorMap', () => {
    it('각 ID에 순서대로 고유 색상을 매핑해야 한다', () => {
      const ids = ['id-1', 'id-2', 'id-3'];
      const map = generateRouteColorMap(ids);
      expect(map.get('id-1')).toBe(ROUTE_COLOR_PALETTE[0]);
      expect(map.get('id-2')).toBe(ROUTE_COLOR_PALETTE[1]);
      expect(map.get('id-3')).toBe(ROUTE_COLOR_PALETTE[2]);
    });

    it('팔레트 크기를 초과하면 색상을 순환(cycle)해야 한다', () => {
      const ids = Array.from(
        { length: ROUTE_COLOR_PALETTE.length + 2 },
        (_, i) => `id-${i}`
      );
      const map = generateRouteColorMap(ids);
      expect(map.get(`id-${ROUTE_COLOR_PALETTE.length}`)).toBe(ROUTE_COLOR_PALETTE[0]);
      expect(map.get(`id-${ROUTE_COLOR_PALETTE.length + 1}`)).toBe(ROUTE_COLOR_PALETTE[1]);
    });

    it('빈 배열은 빈 Map을 반환해야 한다', () => {
      const map = generateRouteColorMap([]);
      expect(map.size).toBe(0);
    });
  });

  describe('getRouteColor', () => {
    it('0번 인덱스는 첫 번째 색상을 반환해야 한다', () => {
      expect(getRouteColor(0)).toBe(ROUTE_COLOR_PALETTE[0]);
    });

    it('팔레트 길이와 동일한 인덱스는 첫 번째 색상으로 순환해야 한다', () => {
      expect(getRouteColor(ROUTE_COLOR_PALETTE.length)).toBe(ROUTE_COLOR_PALETTE[0]);
    });
  });
});
