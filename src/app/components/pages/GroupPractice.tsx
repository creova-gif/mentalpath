import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUser } from '../../context/UserContext';
import { openBillingPortal, startCheckout } from '../../services/billing';
import {
  acceptInvite, closePractice, createPractice, getMyPractice, getSeats, inviteMember, listMembers,
  listPendingInvites, removeMember, revokeInvite,
  type Invite, type MemberSummary, type Practice, type Seats,
} from '../../services/groupPractice';
import { PLANS, formatPrice } from '@/config/pricing';

const card = 'bg-white border border-[var(--border)] rounded-xl p-5';
const primary = 'px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60';
const secondary = 'px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[13px] cursor-pointer hover:bg-[var(--warm)] disabled:opacity-60';
const input = 'px-3 py-2 rounded-lg border border-[var(--border)] text-[13px] bg-white';

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err));

export function GroupPractice() {
  const { t } = useTranslation();
  const { user, refreshProfile } = useUser();
  const [params, setParams] = useSearchParams();
  const inviteToken = params.get('invite');

  const [practice, setPractice] = useState<Practice | null | undefined>(undefined);
  const [seats, setSeats] = useState<Seats>({ paid: 0, used: 0, pending: 0 });
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [seatCount, setSeatCount] = useState(2);
  const [lastLink, setLastLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const p = await getMyPractice(user.id);
      setPractice(p);
      if (p) {
        setSeats(await getSeats());
        if (p.isOwner) {
          const [m, i] = await Promise.all([listMembers(), listPendingInvites()]);
          setMembers(m);
          setInvites(i);
        }
      }
    } catch (err) {
      toast.error(errorMessage(err));
      setPractice(null);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>, success?: string) => {
    setBusy(true);
    try {
      await fn();
      if (success) toast.success(success);
      await load();
      await refreshProfile?.();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (practice === undefined) return <div role="status" className="p-8 text-sm text-[var(--ink-muted)]">{t('groupPractice.loading')}</div>;

  const acceptBanner = inviteToken && !practice && (
    <section className={`${card} border-[var(--sage)]`} aria-labelledby="invite-heading">
      <h2 id="invite-heading" className="text-sm font-medium mb-1">{t('groupPractice.invite.title')}</h2>
      <p className="text-[13px] text-[var(--ink-soft)] mb-3">{t('groupPractice.invite.body')}</p>
      <button className={primary} disabled={busy}
        onClick={() => act(async () => { await acceptInvite(inviteToken); setParams({}, { replace: true }); }, t('groupPractice.invite.joined'))}>
        {t('groupPractice.invite.accept')}
      </button>
    </section>
  );

  const privacyNote = <p className="text-xs text-[var(--ink-muted)]">{t('groupPractice.privacyNote')}</p>;

  // ── Not in a practice ─────────────────────────────────────────────────────
  if (!practice) {
    return (
      <main className="p-6 space-y-4 max-w-3xl">
        <h1 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{t('groupPractice.title')}</h1>
        {acceptBanner}
        <section className={card} aria-labelledby="create-heading">
          <h2 id="create-heading" className="text-sm font-medium mb-1">{t('groupPractice.create.title')}</h2>
          <p className="text-[13px] text-[var(--ink-soft)] mb-3">
            {t('groupPractice.create.body', { price: formatPrice(PLANS.group.priceCad) })}
          </p>
          <form className="flex flex-wrap gap-2 items-end" onSubmit={e => { e.preventDefault(); act(() => createPractice(name), t('groupPractice.create.done')); }}>
            <label className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
              {t('groupPractice.create.nameLabel')}
              <input className={input} value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={120} />
            </label>
            <button type="submit" className={primary} disabled={busy || name.trim().length < 2}>{t('groupPractice.create.submit')}</button>
          </form>
        </section>
        {privacyNote}
      </main>
    );
  }

  // ── Member view ───────────────────────────────────────────────────────────
  if (!practice.isOwner) {
    return (
      <main className="p-6 space-y-4 max-w-3xl">
        <h1 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{practice.name}</h1>
        <section className={card}>
          <p className="text-[13px] text-[var(--ink-soft)] mb-3">
            {seats.paid > 0 && seats.used <= seats.paid ? t('groupPractice.member.covered') : t('groupPractice.member.notCovered')}
          </p>
          <button className={secondary} disabled={busy}
            onClick={() => { if (window.confirm(t('groupPractice.member.leaveConfirm'))) act(() => removeMember(user!.id), t('groupPractice.member.left')); }}>
            {t('groupPractice.member.leave')}
          </button>
        </section>
        {privacyNote}
      </main>
    );
  }

  // ── Owner view ────────────────────────────────────────────────────────────
  const freeSeats = Math.max(0, seats.paid - seats.used - seats.pending);
  return (
    <main className="p-6 space-y-4 max-w-4xl">
      <h1 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{practice.name}</h1>

      <section className={card} aria-labelledby="seats-heading">
        <h2 id="seats-heading" className="text-sm font-medium mb-2">{t('groupPractice.seats.title')}</h2>
        {seats.paid === 0 ? (
          <form className="flex flex-wrap gap-2 items-end" onSubmit={e => { e.preventDefault(); act(() => startCheckout({ plan: 'group', seats: seatCount })); }}>
            <p className="w-full text-[13px] text-[var(--ink-soft)]">{t('groupPractice.seats.none', { price: formatPrice(PLANS.group.priceCad) })}</p>
            <label className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
              {t('groupPractice.seats.countLabel')}
              <input type="number" className={`${input} w-24`} min={2} max={50} value={seatCount}
                onChange={e => setSeatCount(Math.max(2, Math.min(50, Number(e.target.value) || 2)))} />
            </label>
            <button type="submit" className={primary} disabled={busy}>
              {t('groupPractice.seats.subscribe', { total: formatPrice(PLANS.group.priceCad * seatCount) })}
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-4 text-[13px]">
            <span>{t('groupPractice.seats.summary', { used: seats.used, pending: seats.pending, paid: seats.paid })}</span>
            <button className={secondary} disabled={busy} onClick={() => act(openBillingPortal)}>{t('groupPractice.seats.manage')}</button>
          </div>
        )}
      </section>

      {seats.paid > 0 && (
        <section className={card} aria-labelledby="invite-member-heading">
          <h2 id="invite-member-heading" className="text-sm font-medium mb-2">{t('groupPractice.inviteMember.title')}</h2>
          <form className="flex flex-wrap gap-2 items-end"
            onSubmit={e => { e.preventDefault(); act(async () => { setLastLink(await inviteMember(email)); setEmail(''); }, t('groupPractice.inviteMember.created')); }}>
            <label className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
              {t('groupPractice.inviteMember.emailLabel')}
              <input type="email" className={`${input} w-72`} value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <button type="submit" className={primary} disabled={busy || freeSeats === 0}>{t('groupPractice.inviteMember.submit')}</button>
            {freeSeats === 0 && <span className="text-xs text-amber-800">{t('groupPractice.inviteMember.full')}</span>}
          </form>
          {lastLink && (
            <div className="mt-3 text-[13px]">
              <p className="text-[var(--ink-soft)] mb-1">{t('groupPractice.inviteMember.linkHelp')}</p>
              <div className="flex gap-2">
                <input readOnly className={`${input} flex-1`} value={lastLink} aria-label={t('groupPractice.inviteMember.linkLabel')} onFocus={e => e.target.select()} />
                <button className={secondary} onClick={() => navigator.clipboard?.writeText(lastLink).then(() => toast.success(t('groupPractice.inviteMember.copied')))}>
                  {t('groupPractice.inviteMember.copy')}
                </button>
              </div>
            </div>
          )}
          {invites.length > 0 && (
            <ul className="mt-4 divide-y divide-[var(--border)] text-[13px]" aria-label={t('groupPractice.inviteMember.pending')}>
              {invites.map(i => (
                <li key={i.id} className="flex justify-between items-center py-2">
                  <span>{i.email} <span className="text-xs text-[var(--ink-muted)]">· {t('groupPractice.inviteMember.expires', { date: new Date(i.expiresAt).toLocaleDateString() })}</span></span>
                  <button className={secondary} disabled={busy} onClick={() => act(() => revokeInvite(i.id), t('groupPractice.inviteMember.revoked'))}>
                    {t('groupPractice.inviteMember.revoke')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className={card} aria-labelledby="members-heading">
        <h2 id="members-heading" className="text-sm font-medium mb-2">{t('groupPractice.members.title')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-xs text-[var(--ink-muted)]">
                <th className="py-2 font-normal">{t('groupPractice.members.name')}</th>
                <th className="py-2 font-normal">{t('groupPractice.members.activeClients')}</th>
                <th className="py-2 font-normal">{t('groupPractice.members.sessionsThisMonth')}</th>
                <th className="py-2 font-normal">{t('groupPractice.members.unsignedNotes')}</th>
                <th className="py-2 font-normal"><span className="sr-only">{t('groupPractice.members.actions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.clinicianId} className="border-t border-[var(--border)]">
                  <td className="py-2">{m.name}{m.role === 'owner' && <span className="ml-2 text-xs text-[var(--sage-deep)]">{t('groupPractice.members.owner')}</span>}</td>
                  <td className="py-2">{m.activeClients}</td>
                  <td className="py-2">{m.sessionsThisMonth}</td>
                  <td className="py-2">{m.unsignedNotes}</td>
                  <td className="py-2 text-right">
                    {m.role !== 'owner' && (
                      <button className={secondary} disabled={busy}
                        onClick={() => { if (window.confirm(t('groupPractice.members.removeConfirm', { name: m.name }))) act(() => removeMember(m.clinicianId), t('groupPractice.members.removed')); }}>
                        {t('groupPractice.members.remove')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {members.length <= 1 && (
          <button className={`${secondary} mt-4`} disabled={busy}
            onClick={() => { if (window.confirm(t('groupPractice.close.confirm'))) act(closePractice, t('groupPractice.close.done')); }}>
            {t('groupPractice.close.button')}
          </button>
        )}
      </section>
      {privacyNote}
    </main>
  );
}
