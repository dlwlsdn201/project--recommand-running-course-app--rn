import { formatDuration, formatPace, metersToKm } from '../formatters';

describe('formatters', () => {
  describe('formatDuration', () => {
    it('60초 → "01:00"', () => {
      expect(formatDuration(60)).toBe('01:00');
    });
    it('65초 → "01:05"', () => {
      expect(formatDuration(65)).toBe('01:05');
    });
    it('3600초 → "1:00:00"', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
    });
    it('3661초 → "1:01:01"', () => {
      expect(formatDuration(3661)).toBe('1:01:01');
    });
    it('0초 → "00:00"', () => {
      expect(formatDuration(0)).toBe('00:00');
    });
  });

  describe('formatPace', () => {
    it('300초/km → "5\'00\""', () => {
      expect(formatPace(300)).toBe("5'00\"");
    });
    it('330초/km → "5\'30\""', () => {
      expect(formatPace(330)).toBe("5'30\"");
    });
    it('360초/km → "6\'00\""', () => {
      expect(formatPace(360)).toBe("6'00\"");
    });
  });

  describe('metersToKm', () => {
    it('5000m → 5km', () => {
      expect(metersToKm(5000)).toBe(5);
    });
    it('1234m → 1.23km', () => {
      expect(metersToKm(1234)).toBe(1.23);
    });
    it('0m → 0km', () => {
      expect(metersToKm(0)).toBe(0);
    });
  });
});
