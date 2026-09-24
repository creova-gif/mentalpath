// PHQ-9 and GAD-7 definitions. Scoring mirrors public.outcome_measures_score()
// in supabase/migrations/20260925000400_outcome_measures.sql — the database is
// authoritative; this is only for the live preview while entering answers.
export type Instrument = 'PHQ-9' | 'GAD-7';
export type Severity = 'minimal' | 'mild' | 'moderate' | 'moderately severe' | 'severe';

export const INSTRUMENTS: Record<Instrument, { key: 'phq9' | 'gad7'; items: number; max: number }> = {
  'PHQ-9': { key: 'phq9', items: 9, max: 27 },
  'GAD-7': { key: 'gad7', items: 7, max: 21 },
};

export function scoreInstrument(instrument: Instrument, items: number[]): { total: number; severity: Severity; riskFlag: boolean } {
  const total = items.reduce((a, b) => a + b, 0);
  const severity: Severity =
    total <= 4 ? 'minimal'
      : total <= 9 ? 'mild'
        : total <= 14 ? 'moderate'
          : instrument === 'PHQ-9' && total <= 19 ? 'moderately severe'
            : 'severe';
  return { total, severity, riskFlag: instrument === 'PHQ-9' && (items[8] ?? 0) > 0 };
}

/** A change of 5+ points on either scale is commonly treated as clinically meaningful. */
export function describeChange(current: number, previous: number | undefined): 'improved' | 'worsened' | 'stable' | null {
  if (previous === undefined) return null;
  const d = current - previous;
  return d <= -5 ? 'improved' : d >= 5 ? 'worsened' : 'stable';
}
