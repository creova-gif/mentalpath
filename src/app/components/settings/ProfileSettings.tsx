import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';
import { useUser } from '../../context/UserContext';

// Writes only the profile columns browsers are allowed to update
// (see migration 20260923_lock_clinician_billing_columns.sql).
export function ProfileSettings() {
  const { user, refreshProfile } = useUser();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    regNumber: user?.registrationNumber ?? '',
    city: user?.city ?? '',
    sessionRate: String(user?.sessionRate ?? ''),
    hstExempt: user?.hstExempt ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(form.sessionRate);
    if (!form.firstName.trim()) return setError('First name is required.');
    if (!Number.isFinite(rate) || rate < 0 || rate > 99999) return setError('Enter a valid session rate.');
    setError('');
    setSaving(true);
    const { error: dbError } = await supabase.from('clinicians').update({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      reg_number: form.regNumber.trim() || null,
      city: form.city.trim() || null,
      session_rate: rate,
      hst_exempt: form.hstExempt,
    }).eq('id', user.id);
    setSaving(false);
    if (dbError) return setError(dbError.message);
    await refreshProfile();
    toast.success('Profile saved');
  };

  const input = 'w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13px] outline-none focus:border-[var(--sage)]';
  const label = 'block text-xs font-medium text-[var(--ink-soft)] mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-4 max-w-2xl">
      <div className="text-sm font-medium text-[var(--ink)]">Profile & practice</div>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="pf-first" className={label}>First name</label><input id="pf-first" className={input} value={form.firstName} onChange={set('firstName')} maxLength={100} required /></div>
        <div><label htmlFor="pf-last" className={label}>Last name</label><input id="pf-last" className={input} value={form.lastName} onChange={set('lastName')} maxLength={100} /></div>
      </div>
      <div>
        <label htmlFor="pf-email" className={label}>Email</label>
        <input id="pf-email" className={`${input} bg-[var(--warm)] text-[var(--ink-muted)]`} value={user.email} readOnly />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className={label}>Profession</span>
          <div className="text-[13px] py-2.5">{user.profession} · {user.collegeAbbr}</div>
        </div>
        <div><label htmlFor="pf-reg" className={label}>College registration number</label><input id="pf-reg" className={input} value={form.regNumber} onChange={set('regNumber')} maxLength={50} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="pf-city" className={label}>City / province</label><input id="pf-city" className={input} value={form.city} onChange={set('city')} maxLength={100} /></div>
        <div><label htmlFor="pf-rate" className={label}>Default session rate (CAD)</label><input id="pf-rate" type="number" min={0} step="0.01" className={input} value={form.sessionRate} onChange={set('sessionRate')} /></div>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-[var(--ink-soft)]">
        <input type="checkbox" checked={form.hstExempt} onChange={set('hstExempt')} className="w-4 h-4 accent-[var(--sage)]" />
        My services are HST/GST-exempt
      </label>
      {error && <p role="alert" className="text-sm text-[var(--red)]">{error}</p>}
      <button type="submit" disabled={saving}
        className="px-4 py-2 rounded-lg bg-[var(--sage)] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[var(--sage-deep)] disabled:opacity-60">
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
