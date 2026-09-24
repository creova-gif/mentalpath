// Data access for practice screens (clients, appointments, invoices, audit log).
// All queries run as the signed-in clinician; Postgres RLS scopes every row.
import { supabase } from '@/utils/supabase/client';

export type ClientStatus = 'active' | 'waitlist' | 'inactive';

export interface ClientRecord {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  pronouns: string | null;
  status: ClientStatus;
  sessionType: string | null;
  rate: number | null;
  culturalTags: string[];
  referralSource: string | null;
  notes: string | null;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toClient(row: any): ClientRecord {
  const first = row.first_name ?? '';
  const last = row.last_name ?? '';
  return {
    id: row.id,
    firstName: first,
    lastName: last,
    name: `${first} ${last}`.trim(),
    initials: `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase(),
    email: row.email ?? null,
    phone: row.phone ?? null,
    dateOfBirth: row.date_of_birth ?? null,
    pronouns: row.pronouns ?? null,
    status: (row.status ?? 'active') as ClientStatus,
    sessionType: row.session_type ?? null,
    rate: row.rate != null ? Number(row.rate) : null,
    culturalTags: row.cultural_tags ?? [],
    referralSource: row.referral_source ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
  };
}

export async function listClients(status?: ClientStatus): Promise<ClientRecord[]> {
  let q = supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(toClient);
}

export async function getClient(id: string): Promise<ClientRecord | null> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toClient(data) : null;
}

export async function setClientStatus(id: string, status: ClientStatus): Promise<void> {
  const { error } = await supabase.from('clients').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function addWaitlistClient(clinicianId: string, input: { firstName: string; lastName: string; email?: string; notes?: string }) {
  const { error } = await supabase.from('clients').insert({
    clinician_id: clinicianId,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email || null,
    notes: input.notes || null,
    status: 'waitlist',
  });
  if (error) throw error;
}

// ── Appointments ────────────────────────────────────────────────────────────
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  clientId: string | null;
  clientName: string;
  scheduledAt: string;
  durationMinutes: number;
  sessionType: string;
  status: AppointmentStatus;
  noteId: string | null;
}

export async function listAppointments(fromIso: string, toIso: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, client_id, scheduled_at, duration_minutes, session_type, status, note_id, clients(first_name, last_name)')
    .gte('scheduled_at', fromIso)
    .lt('scheduled_at', toIso)
    .order('scheduled_at');
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((a: any) => ({
    id: a.id,
    clientId: a.client_id,
    clientName: a.clients ? `${a.clients.first_name} ${a.clients.last_name}`.trim() : '—',
    scheduledAt: a.scheduled_at,
    durationMinutes: a.duration_minutes ?? 50,
    sessionType: a.session_type ?? 'individual',
    status: (a.status ?? 'scheduled') as AppointmentStatus,
    noteId: a.note_id,
  }));
}

export async function createAppointment(clinicianId: string, input: {
  clientId: string; scheduledAt: string; durationMinutes: number; sessionType: string;
}): Promise<void> {
  const { error } = await supabase.from('appointments').insert({
    clinician_id: clinicianId,
    client_id: input.clientId,
    scheduled_at: input.scheduledAt,
    duration_minutes: input.durationMinutes,
    session_type: input.sessionType,
    status: 'scheduled',
  });
  if (error) throw error;
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus, cancellationReason?: string) {
  const { error } = await supabase.from('appointments')
    .update({ status, ...(cancellationReason ? { cancellation_reason: cancellationReason } : {}) })
    .eq('id', id);
  if (error) throw error;
}

// ── Invoices ────────────────────────────────────────────────────────────────
export interface InvoiceSummary { id: string; number: string; date: string; amount: number; status: string }

export async function listInvoicesForClient(clientId: string): Promise<InvoiceSummary[]> {
  const { data, error } = await supabase.from('invoices')
    .select('id, invoice_number, date, amount, status').eq('client_id', clientId).order('date', { ascending: false });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((i: any) => ({ id: i.id, number: i.invoice_number, date: i.date, amount: Number(i.amount), status: i.status }));
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  activeClients: number;
  waitlist: number;
  draftNotes: number;
  outstandingAmount: number;
  outstandingCount: number;
  collectedThisMonth: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartIso = monthStart.toISOString().slice(0, 10);
  const [active, waitlist, drafts, invoices] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'waitlist'),
    supabase.from('session_notes').select('id', { count: 'exact', head: true }).eq('is_locked', false),
    supabase.from('invoices').select('amount, status, date'),
  ]);
  for (const r of [active, waitlist, drafts, invoices]) if (r.error) throw r.error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = (invoices.data ?? []) as any[];
  const outstanding = inv.filter(i => i.status === 'pending' || i.status === 'overdue');
  return {
    activeClients: active.count ?? 0,
    waitlist: waitlist.count ?? 0,
    draftNotes: drafts.count ?? 0,
    outstandingAmount: outstanding.reduce((s, i) => s + Number(i.amount), 0),
    outstandingCount: outstanding.length,
    collectedThisMonth: inv.filter(i => i.status === 'paid' && i.date >= monthStartIso).reduce((s, i) => s + Number(i.amount), 0),
  };
}

// ── Audit log ───────────────────────────────────────────────────────────────
export interface AuditEntry {
  id: number;
  action: string;
  tableName: string;
  recordId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export async function listAuditLog(limit = 200): Promise<AuditEntry[]> {
  const { data, error } = await supabase.from('audit_log')
    .select('id, action, table_name, record_id, details, ip_address, created_at')
    .order('id', { ascending: false }).limit(limit);
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((a: any) => ({
    id: a.id, action: a.action, tableName: a.table_name, recordId: a.record_id,
    details: a.details, ipAddress: a.ip_address, createdAt: a.created_at,
  }));
}

export const formatCad = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
