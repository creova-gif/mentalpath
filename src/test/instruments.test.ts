import { describe, expect, it } from 'vitest';
import { describeChange, scoreInstrument } from '@/app/lib/instruments';

describe('outcome measure scoring (mirrors the database trigger)', () => {
  it('uses the published PHQ-9 bands and flags item 9', () => {
    expect(scoreInstrument('PHQ-9', [2, 2, 2, 2, 2, 1, 1, 1, 1])).toEqual({ total: 14, severity: 'moderate', riskFlag: true });
    expect(scoreInstrument('PHQ-9', [3, 3, 3, 3, 3, 3, 0, 0, 0])).toEqual({ total: 18, severity: 'moderately severe', riskFlag: false });
    expect(scoreInstrument('PHQ-9', Array(9).fill(3)).severity).toBe('severe');
    expect(scoreInstrument('PHQ-9', Array(9).fill(0)).severity).toBe('minimal');
  });
  it('uses the published GAD-7 bands (no moderately-severe band)', () => {
    expect(scoreInstrument('GAD-7', [1, 1, 1, 1, 1, 0, 0]).severity).toBe('mild');
    expect(scoreInstrument('GAD-7', [3, 3, 3, 3, 3, 0, 0])).toEqual({ total: 15, severity: 'severe', riskFlag: false });
  });
  it('treats a 5-point change as meaningful', () => {
    expect(describeChange(9, 14)).toBe('improved');
    expect(describeChange(14, 9)).toBe('worsened');
    expect(describeChange(12, 14)).toBe('stable');
    expect(describeChange(12, undefined)).toBeNull();
  });
});
