import { identify, track } from '@/app/lib/telemetry';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '@/utils/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { PLANS, type PlanId } from '@/config/pricing';

// ── Types (unchanged — all 45 pages that consume useUser() need zero changes) ─
export type Profession =
  | 'Registered Psychotherapist'
  | 'Psychologist'
  | 'Social Worker'
  | 'Chiropractor'
  | 'Physiotherapist'
  | 'Registered Massage Therapist'
  | 'Occupational Therapist'
  | 'Naturopathic Doctor'
  | 'Acupuncturist'
  | 'Dietitian'
  | 'Speech-Language Pathologist';

export type PlanType = PlanId;
export type SubscriptionStatus =
  | 'none' | 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'paused';
export type BillingCycle = 'monthly' | 'annual';

export interface UserProfile {
  id: string; // real Supabase auth.users UUID
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  profession: Profession;
  registrationNumber: string;
  college: string;
  collegeAbbr: string;
  city: string;
  notesLabel: string;
  noteFormat: string;
  hstExempt: boolean;
  sessionRate: number;
  /** Clinician has opted in to AI Note Assist (see migration 20260924000300). */
  aiAssistEnabled: boolean;
}

export interface SubscriptionPlan {
  /** Effective plan right now — mirrors public.effective_plan() in SQL. */
  type: PlanType;
  status: SubscriptionStatus;
  cycle: BillingCycle;
  seats: number;
  pricePerSeat: number;
  /** On the no-card signup trial, or a Stripe trial. */
  isTrial: boolean;
  trialDaysRemaining: number | null;
  /** Payment failed; Stripe is retrying. */
  isPastDue: boolean;
  hasBillingAccount: boolean;
  /** Next renewal / trial end, formatted for display, or '—'. */
  renewsOn: string;
  cancelAt: string | null;
  nextBillingAmount: number;
}

interface UserContextType {
  user: UserProfile | null;
  subscription: SubscriptionPlan | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<'ok' | 'bad_credentials'>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAiAssistEnabled: (enabled: boolean) => Promise<boolean>;
}

// ── Profession metadata (unchanged) ──────────────────────────────────────────
const PROFESSION_META: Record<
  Profession,
  { college: string; collegeAbbr: string; notesLabel: string; noteFormat: string; hstExempt: boolean; sessionRate: number }
> = {
  'Registered Psychotherapist': { college: 'College of Registered Psychotherapists of Ontario', collegeAbbr: 'CRPO', notesLabel: 'Session Notes', noteFormat: 'DAP / Process Notes', hstExempt: true, sessionRate: 140 },
  'Psychologist': { college: 'College of Psychologists of Ontario', collegeAbbr: 'CPO', notesLabel: 'Session Notes', noteFormat: 'SOAP / Process Notes', hstExempt: true, sessionRate: 220 },
  'Social Worker': { college: 'Ontario College of Social Workers and Social Service Workers', collegeAbbr: 'OCSWSSW', notesLabel: 'Session Notes', noteFormat: 'DAP / PIE Notes', hstExempt: true, sessionRate: 130 },
  'Chiropractor': { college: 'College of Chiropractors of Ontario', collegeAbbr: 'CCO', notesLabel: 'SOAP Notes', noteFormat: 'SOAP Notes', hstExempt: false, sessionRate: 85 },
  'Physiotherapist': { college: 'College of Physiotherapists of Ontario', collegeAbbr: 'CPT', notesLabel: 'Treatment Notes', noteFormat: 'SOAP / Progress Notes', hstExempt: false, sessionRate: 120 },
  'Registered Massage Therapist': { college: 'College of Massage Therapists of Ontario', collegeAbbr: 'CMTO', notesLabel: 'Treatment Notes', noteFormat: 'SOAP Notes', hstExempt: false, sessionRate: 95 },
  'Occupational Therapist': { college: 'College of Occupational Therapists of Ontario', collegeAbbr: 'COTO', notesLabel: 'Clinical Notes', noteFormat: 'SOAP / Functional Notes', hstExempt: true, sessionRate: 140 },
  'Naturopathic Doctor': { college: 'College of Naturopaths of Ontario', collegeAbbr: 'CONO', notesLabel: 'Clinical Notes', noteFormat: 'SOAP Notes', hstExempt: false, sessionRate: 150 },
  'Acupuncturist': { college: 'College of Traditional Chinese Medicine Practitioners and Acupuncturists of Ontario', collegeAbbr: 'CTCMPAO', notesLabel: 'Treatment Notes', noteFormat: 'TCM Notes', hstExempt: false, sessionRate: 90 },
  'Dietitian': { college: 'College of Dietitians of Ontario', collegeAbbr: 'CDO', notesLabel: 'Clinical Notes', noteFormat: 'ADIME Notes', hstExempt: false, sessionRate: 120 },
  'Speech-Language Pathologist': { college: 'College of Audiologists and Speech-Language Pathologists of Ontario', collegeAbbr: 'CASLPO', notesLabel: 'Clinical Notes', noteFormat: 'SOAP / Progress Notes', hstExempt: true, sessionRate: 175 },
};

// ── Demo accounts (local development only) ───────────────────────────────────
// Seeded by supabase/seed_demo_users_fixed.sql into a *local/dev* project only.
// They must never exist in production auth. Login always goes through
// Supabase Auth — there is no client-side bypass.
export const DEMO_ACCOUNTS = [
  { email: 'dr.osei@mentalpath.ca',       firstName: 'Abena',  lastName: 'Osei-Mensah', profession: 'Registered Psychotherapist' as Profession, regNumber: 'CRPO-004821', city: 'Toronto, ON',    planType: 'solo' as PlanType,  planCycle: 'monthly' as BillingCycle, pricePerSeat: 79,  seats: 1, isTrial: false, starts: 'September 1, 2025',  renews: 'April 1, 2026',    nextAmount: 79  },
  { email: 'dr.chen@spine360.ca',         firstName: 'Marcus', lastName: 'Chen',         profession: 'Chiropractor' as Profession,                regNumber: 'CCO-012047', city: 'Vancouver, BC', planType: 'solo' as PlanType,  planCycle: 'annual' as BillingCycle,  pricePerSeat: 69,  seats: 1, isTrial: false, starts: 'January 15, 2026',  renews: 'January 15, 2027', nextAmount: 828 },
  { email: 'sarah.patel@physiocare.ca',   firstName: 'Sarah',  lastName: 'Patel',        profession: 'Physiotherapist' as Profession,              regNumber: 'CPT-008834', city: 'Calgary, AB',   planType: 'group' as PlanType, planCycle: 'monthly' as BillingCycle, pricePerSeat: 69,  seats: 4, isTrial: false, starts: 'November 1, 2025',  renews: 'April 1, 2026',    nextAmount: 276 },
  { email: 'j.williams@rmtcare.ca',       firstName: 'Jordan', lastName: 'Williams',     profession: 'Registered Massage Therapist' as Profession, regNumber: 'CMTO-019923',city: 'Ottawa, ON',    planType: 'solo' as PlanType,  planCycle: 'monthly' as BillingCycle, pricePerSeat: 79,  seats: 1, isTrial: true,  starts: 'March 16, 2026',    renews: 'March 23, 2026',   nextAmount: 79  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

// clinicians table — real schema confirmed from DB
interface ClinicianRow {
  id: string;
  first_name: string;
  last_name: string;
  profession: string;
  reg_number: string | null;
  city: string | null;
  session_rate: number | null;
  hst_exempt: boolean | null;
  plan_type: string | null;
  plan_cycle: string | null;
  plan_seats: number | null;
  price_per_seat: number | null;
  is_trial: boolean | null;
  trial_ends_at: string | null;
  plan_starts_at: string | null;
  plan_renews_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  ai_assist_enabled: boolean | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
}

// Map DB profession_code slug → Profession display string
const PROFESSION_TYPE_MAP: Record<string, Profession> = {
  psychotherapist:       'Registered Psychotherapist',
  psychologist:          'Psychologist',
  social_worker:         'Social Worker',
  chiropractor:          'Chiropractor',
  physiotherapist:       'Physiotherapist',
  rmt:                   'Registered Massage Therapist',
  occupational_therapist:'Occupational Therapist',
  naturopath:            'Naturopathic Doctor',
  acupuncturist:         'Acupuncturist',
  dietitian:             'Dietitian',
  slp:                   'Speech-Language Pathologist',
};

const PAID_STATUSES = new Set(['active', 'trialing', 'past_due']);

export function buildSubscriptionFromClinicianRow(row: ClinicianRow | null, now = new Date()): SubscriptionPlan {
  const status = (row?.subscription_status ?? 'none') as SubscriptionStatus;
  const paid = PAID_STATUSES.has(status);
  const trialEndsAt = row?.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const onSignupTrial = !paid && !!row?.is_trial && !!trialEndsAt && trialEndsAt > now;
  const type: PlanType = paid ? ((row?.plan_type as PlanType) ?? 'solo') : onSignupTrial ? 'solo' : 'starter';
  const isTrial = onSignupTrial || status === 'trialing';
  const trialDaysRemaining = isTrial && trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000))
    : null;
  const fmtDate = (val: string | null | undefined) =>
    val ? new Date(val).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const seats = row?.plan_seats ?? 1;
  const pricePerSeat = type === 'starter' ? 0 : Number(row?.price_per_seat ?? PLANS[type].priceCad);

  return {
    type,
    status,
    cycle: (row?.plan_cycle ?? 'monthly') as BillingCycle,
    seats,
    pricePerSeat,
    isTrial,
    trialDaysRemaining,
    isPastDue: status === 'past_due',
    hasBillingAccount: !!row?.stripe_customer_id,
    renewsOn: fmtDate(paid ? (row?.current_period_end ?? row?.plan_renews_at) : isTrial ? row?.trial_ends_at : null),
    cancelAt: row?.cancel_at ?? null,
    nextBillingAmount: paid ? pricePerSeat * seats : 0,
  };
}

// Older builds mirrored note drafts (plaintext PHI) and identifiers into
// localStorage. Remove anything they left behind on this device.
const LEGACY_STORAGE_PREFIXES = ['session_note_draft_', 'note_modal_draft_'];
const LEGACY_STORAGE_KEYS = ['mentalpath_user_id', 'user_email'];
export function purgeLegacyLocalData() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (LEGACY_STORAGE_KEYS.includes(key) || LEGACY_STORAGE_PREFIXES.some(p => key.startsWith(p)))) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage unavailable (private mode) — nothing to purge.
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscriptionState] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inactivity Timeout Listener
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout().then(() => {
          toast.error("Session Expired", {
            description: "You have been logged out due to 15 minutes of inactivity to protect health data."
          });
        });
      }, 900000); // 15 minutes
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [user]);

  // Load profile: query 'clinicians' for all data (profile + subscription).
  // Falls back to DEMO_ACCOUNTS for any missing profile fields.
  const loadProfile = useCallback(async (session: Session) => {
    const email = session.user.email ?? '';

    // Get live data from clinicians table using REAL column names
    const { data } = await supabase
      .from('clinicians')
      .select('id, first_name, last_name, profession, reg_number, city, session_rate, hst_exempt, plan_type, plan_cycle, plan_seats, price_per_seat, is_trial, trial_ends_at, plan_starts_at, plan_renews_at, created_at, updated_at, ai_assist_enabled, subscription_status, stripe_customer_id, current_period_end, cancel_at')
      .eq('id', session.user.id)
      .maybeSingle();

    const row = data as ClinicianRow | null;

    // Build profile: prefer DB values, fall back to DEMO_ACCOUNTS by email
    const demo = import.meta.env.DEV ? DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase()) : undefined;

    const professionSlug = row?.profession ?? '';
    const mappedProfession = PROFESSION_TYPE_MAP[professionSlug] ?? professionSlug;
    
    // We check if it's a valid Profession type by seeing if it's in PROFESSION_META
    const isValideProfession = mappedProfession in PROFESSION_META;
    const profession: Profession = isValideProfession 
      ? (mappedProfession as Profession)
      : (demo?.profession ?? 'Registered Psychotherapist');

    const meta = PROFESSION_META[profession];

    const firstName = row?.first_name || demo?.firstName || email.split('@')[0];
    const lastName  = row?.last_name || demo?.lastName  || '';
    const city      = row?.city ? row.city : (demo?.city ?? '');
    const rateFromDB = row?.session_rate ? Number(row.session_rate) : null;
    const hstExemptFromDB = row?.hst_exempt ?? null;

    setUser({
      id: session.user.id,
      name: `${firstName} ${lastName}`.trim() || email,
      firstName,
      lastName,
      initials: `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || email[0]?.toUpperCase() || 'U',
      email,
      profession,
      registrationNumber: row?.reg_number || demo?.regNumber || '',
      city,
      ...meta,
      sessionRate: rateFromDB ?? meta.sessionRate,
      hstExempt: hstExemptFromDB !== null ? hstExemptFromDB : meta.hstExempt,
      aiAssistEnabled: row?.ai_assist_enabled ?? false,
    });

    setSubscriptionState(buildSubscriptionFromClinicianRow(row));
    identify(session.user.id);
  }, []);


  // Bootstrap: listen to Supabase auth state changes.
  // Supabase holds an auth lock while this callback runs, so awaiting any other
  // Supabase call inside it deadlocks (the app hung on "Loading…" after a page
  // reload). Work that needs the client is deferred with setTimeout.
  useEffect(() => {
    purgeLegacyLocalData();
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        identify(null);
        setUser(null);
        setSubscriptionState(null);
        setIsLoading(false);
        return;
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setTimeout(() => {
          loadProfile(session)
            .catch(err => console.error('Profile load failed:', err))
            .finally(() => setIsLoading(false));
        }, 0);
      }
    });
    return () => authSub.unsubscribe();
  }, [loadProfile]);

  const login = async (email: string, password: string): Promise<'ok' | 'bad_credentials'> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      // Load the profile before the caller navigates, so protected routes see the user.
      await loadProfile(data.session);
      return 'ok';
    }

    console.error('Login error:', error?.message ?? 'no session returned');
    return 'bad_credentials';
  };

  const logout = async () => {
    purgeLegacyLocalData();
    await supabase.auth.signOut();
  };

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await loadProfile(session);
  }, [loadProfile]);

  const setAiAssistEnabled = async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase.from('clinicians').update({ ai_assist_enabled: enabled }).eq('id', user.id);
    if (error) return false;
    if (enabled) track('ai_assist_enabled');
    setUser({ ...user, aiAssistEnabled: enabled });
    return true;
  };

  return (
    <UserContext.Provider value={{ user, subscription, isLoggedIn: !!user, isLoading, login, logout, refreshProfile, setAiAssistEnabled }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
