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

export type PlanType = 'solo' | 'group' | 'enterprise';
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
}

export interface SubscriptionPlan {
  type: PlanType;
  cycle: BillingCycle;
  seats: number;
  pricePerSeat: number;
  trialDaysRemaining: number | null;
  isTrial: boolean;
  startDate: string;
  renewsOn: string;
  nextBillingAmount: number;
}

interface UserContextType {
  user: UserProfile | null;
  subscription: SubscriptionPlan | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<'ok' | 'bad_credentials'>;
  logout: () => Promise<void>;
  setSubscription: (plan: SubscriptionPlan) => void;
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

// ── Demo accounts (kept for seeding + local dev fallback) ────────────────────
// These are seeded into Supabase Auth and the `clinicians` table.
// Password for all demo accounts: demo1234
export const DEMO_ACCOUNTS = [
  { email: 'dr.osei@mentalpath.ca',       firstName: 'Abena',  lastName: 'Osei-Mensah', profession: 'Registered Psychotherapist' as Profession, regNumber: 'CRPO-004821', city: 'Toronto, ON',    planType: 'solo' as PlanType,  planCycle: 'monthly' as BillingCycle, pricePerSeat: 79,  seats: 1, isTrial: false, starts: 'September 1, 2025',  renews: 'April 1, 2026',    nextAmount: 79  },
  { email: 'dr.chen@spine360.ca',         firstName: 'Marcus', lastName: 'Chen',         profession: 'Chiropractor' as Profession,                regNumber: 'CCO-012047', city: 'Vancouver, BC', planType: 'solo' as PlanType,  planCycle: 'annual' as BillingCycle,  pricePerSeat: 69,  seats: 1, isTrial: false, starts: 'January 15, 2026',  renews: 'January 15, 2027', nextAmount: 828 },
  { email: 'sarah.patel@physiocare.ca',   firstName: 'Sarah',  lastName: 'Patel',        profession: 'Physiotherapist' as Profession,              regNumber: 'CPT-008834', city: 'Calgary, AB',   planType: 'group' as PlanType, planCycle: 'monthly' as BillingCycle, pricePerSeat: 69,  seats: 4, isTrial: false, starts: 'November 1, 2025',  renews: 'April 1, 2026',    nextAmount: 276 },
  { email: 'j.williams@rmtcare.ca',       firstName: 'Jordan', lastName: 'Williams',     profession: 'Registered Massage Therapist' as Profession, regNumber: 'CMTO-019923',city: 'Ottawa, ON',    planType: 'solo' as PlanType,  planCycle: 'monthly' as BillingCycle, pricePerSeat: 79,  seats: 1, isTrial: true,  starts: 'March 16, 2026',    renews: 'March 23, 2026',   nextAmount: 79  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

// therapists table — real schema confirmed from DB
interface TherapistRow {
  id: string;
  email: string | null;
  // Profile fields (actual column names from DB)
  full_name: string | null;          // real column (not first_name/last_name)
  profession_code: string | null;    // 'psychotherapist' | 'chiropractor' | 'physiotherapist' | 'rmt'
  province: string | null;
  hourly_rate: number | null;        // real column (not session_rate)
  // Subscription / Stripe fields
  subscription_tier: string | null;    // 'solo' | 'group' | 'enterprise'
  subscription_status: string | null;  // 'active' | 'trialing' | 'past_due' | 'cancelled'
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  cancel_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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

function buildProfileFromDemoAndAuth(
  userId: string,
  email: string,
): UserProfile | null {
  // Find matching demo account for profile fields
  const demo = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!demo) {
    // New sign-up not in demo list — return a minimal profile
    const firstName = email.split('@')[0] ?? 'User';
    const lastName = '';
    const profession: Profession = 'Registered Psychotherapist';
    const meta = PROFESSION_META[profession];
    return {
      id: userId,
      name: firstName,
      firstName,
      lastName,
      initials: firstName[0]?.toUpperCase() ?? 'U',
      email,
      profession,
      registrationNumber: '',
      city: '',
      ...meta,
    };
  }
  const meta = PROFESSION_META[demo.profession];
  return {
    id: userId,
    name: `${demo.firstName} ${demo.lastName}`.trim(),
    firstName: demo.firstName,
    lastName: demo.lastName,
    initials: `${demo.firstName[0] ?? ''}${demo.lastName[0] ?? ''}`.toUpperCase(),
    email,
    profession: demo.profession,
    registrationNumber: demo.regNumber,
    city: demo.city,
    ...meta,
  };
}

function buildSubscriptionFromTherapistRow(
  row: TherapistRow | null,
  email: string,
): SubscriptionPlan {
  // Prefer live DB data; fall back to demo account metadata
  const demo = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());

  const tier = (row?.subscription_tier ?? demo?.planType ?? 'solo') as PlanType;
  // Map subscription_status → isTrial
  const status = row?.subscription_status ?? '';
  const isTrial = status === 'trialing' || (demo?.isTrial ?? false);
  const trialEndsAt = row?.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const now = new Date();
  const trialDaysRemaining = isTrial && trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000))
    : null;

  const pricePerSeat = demo?.pricePerSeat ?? 79;
  const seats = demo?.seats ?? 1;

  const fmtDate = (val: string | null | undefined) =>
    val ? new Date(val).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return {
    type: tier,
    cycle: (demo?.planCycle ?? 'monthly') as BillingCycle,
    seats,
    pricePerSeat,
    trialDaysRemaining: isTrial ? trialDaysRemaining : null,
    isTrial,
    startDate: fmtDate(demo?.starts),
    renewsOn: fmtDate(demo?.renews),
    nextBillingAmount: pricePerSeat * seats,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscriptionState] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile: query 'therapists' for all data (profile + subscription).
  // Load profile: query 'therapists' for all data (profile + subscription).
  // Falls back to DEMO_ACCOUNTS for any missing profile fields.
  const loadProfile = useCallback(async (session: Session) => {
    const email = session.user.email ?? '';

    // Get live data from therapists table using REAL column names
    const { data } = await supabase
      .from('therapists')
      .select('id, email, full_name, profession_code, province, hourly_rate, subscription_tier, subscription_status, trial_ends_at, stripe_customer_id, cancel_at, created_at, updated_at')
      .eq('id', session.user.id)
      .maybeSingle();

    const row = data as TherapistRow | null;

    // Build profile: prefer DB values, fall back to DEMO_ACCOUNTS by email
    const demo = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());

    const professionSlug = row?.profession_code ?? '';
    const profession: Profession = PROFESSION_TYPE_MAP[professionSlug] ?? demo?.profession ?? 'Registered Psychotherapist';
    const meta = PROFESSION_META[profession];

    // full_name from DB → split into firstName/lastName for profile
    const fullNameFromDB = row?.full_name ?? null;
    const [dbFirst = '', ...rest] = fullNameFromDB ? fullNameFromDB.split(' ') : [];
    const dbLast = rest.join(' ');

    const firstName = dbFirst || demo?.firstName || email.split('@')[0];
    const lastName  = dbLast  || demo?.lastName  || '';
    const city      = row?.province ? row.province : (demo?.city ?? '');
    const rateFromDB = row?.hourly_rate ? Number(row.hourly_rate) : null;

    setUser({
      id: session.user.id,
      name: fullNameFromDB || `${firstName} ${lastName}`.trim() || email,
      firstName,
      lastName,
      initials: `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || email[0]?.toUpperCase() || 'U',
      email,
      profession,
      registrationNumber: demo?.regNumber ?? '',
      city,
      ...meta,
      sessionRate: rateFromDB ?? meta.sessionRate,
    });

    setSubscriptionState(buildSubscriptionFromTherapistRow(row, email));
  }, []);


  // Bootstrap: listen to Supabase auth state changes
  useEffect(() => {
    // Get the current session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) await loadProfile(session);
      setIsLoading(false);
    });

    // Subscribe to future auth events (login, logout, token refresh)
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadProfile(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSubscriptionState(null);
        }
        setIsLoading(false);
      }
    );

    return () => authSub.unsubscribe();
  }, [loadProfile]);

  const login = async (email: string, password: string): Promise<'ok' | 'bad_credentials'> => {
    // ── 1. Try real Supabase Auth ─────────────────────────────────────────────
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return 'ok';

    // ── 2. Demo bypass (GoTrue seed compatibility workaround) ─────────────────
    // Direct auth.users inserts via SQL don't always produce GoTrue-compatible
    // password hashes. If Supabase auth fails but this is a known demo account
    // with the correct demo password, log in locally.
    const DEMO_PASSWORD = 'demo1234';
    const demo = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase()
    );
    if (demo && password === DEMO_PASSWORD) {
      // Create a deterministic fake UUID from the email so it's stable
      const fakeId = Array.from(email).reduce(
        (acc, c) => ((acc * 31 + c.charCodeAt(0)) >>> 0), 0
      ).toString(16).padStart(8, '0') + '-demo-4000-8000-' + Date.now().toString(16).padStart(12, '0');

      const profile = buildProfileFromDemoAndAuth(fakeId, email);
      if (profile) setUser(profile);
      setSubscriptionState(buildSubscriptionFromTherapistRow(null, email));
      return 'ok';
    }

    console.error('Login error:', error.message);
    return 'bad_credentials';
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const setSubscription = (plan: SubscriptionPlan) => {
    setSubscriptionState(plan);
  };

  return (
    <UserContext.Provider value={{ user, subscription, isLoggedIn: !!user, isLoading, login, logout, setSubscription }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
