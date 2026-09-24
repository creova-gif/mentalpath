import { supabase } from '@/utils/supabase/client';
import type { Instrument, Severity } from '@/app/lib/instruments';

export interface OutcomeMeasure {
  id: string;
  clientId: string;
  instrument: Instrument;
  administeredOn: string;
  itemScores: number[];
  total: number;
  severity: Severity;
  riskFlag: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toMeasure = (r: any): OutcomeMeasure => ({
  id: r.id, clientId: r.client_id, instrument: r.instrument, administeredOn: r.administered_on,
  itemScores: r.item_scores ?? [], total: r.total_score, severity: r.severity, riskFlag: r.risk_flag,
});

/** Newest first. */
export async function listMeasures(clientId?: string): Promise<OutcomeMeasure[]> {
  let q = supabase.from('outcome_measures')
    .select('id, client_id, instrument, administered_on, item_scores, total_score, severity, risk_flag')
    .order('administered_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (clientId) q = q.eq('client_id', clientId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(toMeasure);
}

/** Totals, severity and the item-9 flag are computed by the database. */
export async function recordMeasure(input: { clientId: string; instrument: Instrument; administeredOn: string; itemScores: number[] }): Promise<OutcomeMeasure> {
  const { data, error } = await supabase.from('outcome_measures')
    .insert({
      client_id: input.clientId, instrument: input.instrument, administered_on: input.administeredOn,
      item_scores: input.itemScores, total_score: 0, severity: 'minimal',
    })
    .select('id, client_id, instrument, administered_on, item_scores, total_score, severity, risk_flag')
    .single();
  if (error) throw error;
  return toMeasure(data);
}

export async function deleteMeasure(id: string): Promise<void> {
  const { error } = await supabase.from('outcome_measures').delete().eq('id', id);
  if (error) throw error;
}
