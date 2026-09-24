// Group practices: shared billing by seats. Membership never grants access to
// another clinician's clients or notes (see supabase/migrations/20260925000300_practices.sql).
import { supabase } from '@/utils/supabase/client';

export interface Practice { id: string; name: string; ownerId: string; isOwner: boolean }
export interface Seats { paid: number; used: number; pending: number }
export interface MemberSummary {
  clinicianId: string; name: string; profession: string | null; role: 'owner' | 'member'; joinedAt: string;
  activeClients: number; sessionsThisMonth: number; unsignedNotes: number;
}
export interface Invite { id: string; email: string; createdAt: string; expiresAt: string }

export async function getMyPractice(userId: string): Promise<Practice | null> {
  const { data, error } = await supabase.from('practices').select('id, name, owner_id').maybeSingle();
  if (error) throw error;
  return data ? { id: data.id, name: data.name, ownerId: data.owner_id, isOwner: data.owner_id === userId } : null;
}

export async function getSeats(): Promise<Seats> {
  const { data, error } = await supabase.rpc('my_practice_seats');
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) ?? { paid: 0, used: 0, pending: 0 };
  return { paid: row.paid ?? 0, used: row.used ?? 0, pending: row.pending ?? 0 };
}

export async function createPractice(name: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_practice', { p_name: name });
  if (error) throw error;
  return data as string;
}

export function inviteLink(token: string): string {
  return `${window.location.origin}/dashboard/group-practice?invite=${encodeURIComponent(token)}`;
}

/** Returns the one-time invite link. Only a hash of the token is stored. */
export async function inviteMember(email: string): Promise<string> {
  const { data, error } = await supabase.rpc('invite_practice_member', { p_email: email });
  if (error) throw error;
  return inviteLink(data as string);
}

export async function acceptInvite(token: string): Promise<void> {
  const { error } = await supabase.rpc('accept_practice_invite', { p_token: token });
  if (error) throw error;
}

export async function listPendingInvites(): Promise<Invite[]> {
  const { data, error } = await supabase
    .from('practice_invites')
    .select('id, email, created_at, expires_at')
    .is('accepted_at', null)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .filter(i => new Date(i.expires_at) > new Date())
    .map(i => ({ id: i.id, email: i.email, createdAt: i.created_at, expiresAt: i.expires_at }));
}

export async function revokeInvite(id: string): Promise<void> {
  const { error } = await supabase.rpc('revoke_practice_invite', { p_invite: id });
  if (error) throw error;
}

export async function listMembers(): Promise<MemberSummary[]> {
  const { data, error } = await supabase.rpc('practice_overview');
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(m => ({
    clinicianId: m.clinician_id,
    name: [m.first_name, m.last_name].filter(Boolean).join(' ') || 'Clinician',
    profession: m.profession,
    role: m.role,
    joinedAt: m.joined_at,
    activeClients: Number(m.active_clients),
    sessionsThisMonth: Number(m.sessions_this_month),
    unsignedNotes: Number(m.unsigned_notes),
  }));
}

export async function removeMember(clinicianId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_practice_member', { p_clinician: clinicianId });
  if (error) throw error;
}

export async function closePractice(): Promise<void> {
  const { error } = await supabase.rpc('close_practice');
  if (error) throw error;
}
