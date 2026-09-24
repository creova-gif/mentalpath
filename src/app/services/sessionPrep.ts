// Session prep: everything a clinician needs before upcoming sessions, built
// from metadata only (no note content is fetched here).
import { supabase } from '@/utils/supabase/client';
import { listAppointments, type Appointment } from './practice';
import { listMeasures, type OutcomeMeasure } from './outcomes';
import { describeChange } from '@/app/lib/instruments';

export interface PrepNote { id: string; clientId: string; sessionDate: string; isLocked: boolean }
export interface PrepInvoice { clientId: string; amount: number; status: string }

export interface PrepCard {
  appointment: Appointment;
  sessionNumber: number;
  lastSession: PrepNote | null;
  unsignedNotes: number;
  latest: { measure: OutcomeMeasure; change: ReturnType<typeof describeChange>; delta: number | null }[];
  outstanding: { count: number; amount: number };
}

/** Pure: assembles prep cards. Exported for unit tests. */
export function buildPrepCards(appointments: Appointment[], notes: PrepNote[], measures: OutcomeMeasure[], invoices: PrepInvoice[]): PrepCard[] {
  return appointments.filter(a => a.status !== 'cancelled' && a.clientId).map(appointment => {
    const cid = appointment.clientId!;
    const clientNotes = notes.filter(n => n.clientId === cid).sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
    const clientMeasures = measures.filter(m => m.clientId === cid)
      .sort((a, b) => b.administeredOn.localeCompare(a.administeredOn));
    const latest = (['PHQ-9', 'GAD-7'] as const).flatMap(inst => {
      const [cur, prev] = clientMeasures.filter(m => m.instrument === inst);
      return cur ? [{ measure: cur, change: describeChange(cur.total, prev?.total), delta: prev ? cur.total - prev.total : null }] : [];
    });
    const owing = invoices.filter(i => i.clientId === cid && (i.status === 'pending' || i.status === 'overdue'));
    return {
      appointment,
      sessionNumber: clientNotes.length + 1,
      lastSession: clientNotes[0] ?? null,
      unsignedNotes: clientNotes.filter(n => !n.isLocked).length,
      latest,
      outstanding: { count: owing.length, amount: owing.reduce((s, i) => s + i.amount, 0) },
    };
  });
}

export async function loadSessionPrep(days = 7, now = new Date()): Promise<PrepCard[]> {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + days);
  const appointments = await listAppointments(from.toISOString(), to.toISOString());
  const ids = [...new Set(appointments.map(a => a.clientId).filter((x): x is string => !!x))];
  if (ids.length === 0) return [];

  const [notes, measures, invoices] = await Promise.all([
    supabase.from('session_notes').select('id, client_id, session_date, is_locked').in('client_id', ids),
    listMeasures(),
    supabase.from('invoices').select('client_id, amount, status').in('client_id', ids).in('status', ['pending', 'overdue']),
  ]);
  if (notes.error) throw notes.error;
  if (invoices.error) throw invoices.error;
  return buildPrepCards(
    appointments,
    (notes.data ?? []).map(n => ({ id: n.id, clientId: n.client_id, sessionDate: n.session_date, isLocked: n.is_locked })),
    measures.filter(m => ids.includes(m.clientId)),
    (invoices.data ?? []).map(i => ({ clientId: i.client_id, amount: Number(i.amount), status: i.status })),
  );
}
