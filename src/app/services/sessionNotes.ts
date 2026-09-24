import { supabase } from '@/utils/supabase/client';
import { legacyDecrypt } from '@/utils/encryption';

export type NoteFormat = 'dap' | 'soap' | 'birp' | 'progress';

export interface NoteSummary {
  id: string;
  clientId: string | null;
  clientName: string;
  sessionDate: string;
  noteFormat: string;
  sessionNumber: number | null;
  isLocked: boolean;
  lockedAt: string | null;
  updatedAt: string;
}

export interface SessionNote {
  id: string;
  clientId: string | null;
  sessionDate: string;
  sessionType: string | null;
  durationMinutes: number | null;
  noteFormat: NoteFormat;
  sections: [string, string, string, string];
  aiUsed: boolean;
  isLocked: boolean;
  lockedAt: string | null;
  sessionNumber: number | null;
}

export interface NoteDraftInput {
  clientId: string;
  sessionDate: string;
  sessionType: string;
  durationMinutes: number;
  noteFormat: NoteFormat;
  sections: [string, string, string, string];
  aiUsed: boolean;
}

export interface Amendment {
  id: string;
  body: string;
  reason: string | null;
  createdAt: string;
}

// Metadata only — note content is never listed (see ADR 0001).
export async function listNotes(options: { clientId?: string; limit?: number } = {}): Promise<NoteSummary[]> {
  let query = supabase
    .from('session_notes')
    .select('id, client_id, session_date, note_format, session_number, is_locked, locked_at, updated_at, clients(first_name, last_name)')
    .order('session_date', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(options.limit ?? 100);
  if (options.clientId) query = query.eq('client_id', options.clientId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients ? `${row.clients.first_name} ${row.clients.last_name}`.trim() : '—',
    sessionDate: row.session_date,
    noteFormat: row.note_format,
    sessionNumber: row.session_number,
    isLocked: row.is_locked,
    lockedAt: row.locked_at,
    updatedAt: row.updated_at,
  }));
}

/** Reads note content through the audited get_session_note() function. */
export async function getNote(noteId: string, userId: string): Promise<SessionNote | null> {
  const { data, error } = await supabase.rpc('get_session_note', { p_note_id: noteId });
  if (error) throw error;
  const row = (data as any[] | null)?.[0];
  if (!row) return null;

  const raw = [row.section_1, row.section_2, row.section_3, row.section_4] as (string | null)[];
  const sections = (row.enc_version === 1
    ? await Promise.all(raw.map(v => legacyDecrypt(v, userId)))
    : raw.map(v => v ?? '')) as SessionNote['sections'];

  return {
    id: row.id,
    clientId: row.client_id,
    sessionDate: row.session_date,
    sessionType: row.session_type,
    durationMinutes: row.duration_minutes,
    noteFormat: (row.note_format ?? 'dap').toLowerCase() as NoteFormat,
    sections,
    aiUsed: !!row.ai_used,
    isLocked: row.is_locked,
    lockedAt: row.locked_at,
    sessionNumber: row.session_number,
  };
}

/**
 * Creates or updates a draft. Returns the note id. Content is encrypted in the
 * database with the clinician's data key (ADR 0001); the browser never writes
 * the table directly.
 */
export async function saveDraft(noteId: string | null, input: NoteDraftInput): Promise<string> {
  const { data, error } = await supabase.rpc('save_session_note', {
    p_note_id: noteId,
    p_client_id: input.clientId,
    p_session_date: input.sessionDate,
    p_session_type: input.sessionType,
    p_duration_minutes: input.durationMinutes,
    p_note_format: input.noteFormat,
    p_ai_used: input.aiUsed,
    p_section_1: input.sections[0] || null,
    p_section_2: input.sections[1] || null,
    p_section_3: input.sections[2] || null,
    p_section_4: input.sections[3] || null,
  });
  if (error) throw error;
  return data as string;
}

/** Locks a note. The database sets locked_at and rejects any later edit. */
export async function lockNote(noteId: string): Promise<void> {
  const { error } = await supabase.rpc('lock_session_note', { p_note_id: noteId });
  if (error) throw error;
}

export async function listAmendments(noteId: string): Promise<Amendment[]> {
  const { data, error } = await supabase
    .from('session_note_amendments')
    .select('id, body, reason, created_at')
    .eq('note_id', noteId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((a: any) => ({ id: a.id, body: a.body, reason: a.reason, createdAt: a.created_at }));
}

export async function addAmendment(noteId: string, body: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('session_note_amendments')
    .insert({ note_id: noteId, body, reason: reason || null });
  if (error) throw error;
}

export interface ClientOption { id: string; name: string; initials: string }

export async function listClientOptions(): Promise<ClientOption[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name')
    .neq('status', 'inactive')
    .order('last_name');
  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name}`.trim(),
    initials: `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase(),
  }));
}
