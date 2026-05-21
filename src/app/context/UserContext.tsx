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

function buildSubscriptionFromClinicianRow(
  row: ClinicianRow | null,
  email: string,
): SubscriptionPlan {
  // Prefer live DB data; fall back to demo account metadata
  const demo = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());

  const tier = (row?.plan_type ?? demo?.planType ?? 'solo') as PlanType;
  // Map is_trial directly
  const isTrial = row?.is_trial ?? demo?.isTrial ?? false;
  const trialEndsAt = row?.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const now = new Date();
  const trialDaysRemaining = isTrial && trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000))
    : null;

  const pricePerSeat = row?.price_per_seat ?? demo?.pricePerSeat ?? 79;
  const seats = row?.plan_seats ?? demo?.seats ?? 1;

  const fmtDate = (val: string | null | undefined) =>
    val ? new Date(val).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return {
    type: tier,
    cycle: (row?.plan_cycle ?? demo?.planCycle ?? 'monthly') as BillingCycle,
    seats,
    pricePerSeat,
    trialDaysRemaining: isTrial ? trialDaysRemaining : null,
    isTrial,
    startDate: fmtDate(row?.plan_starts_at ?? demo?.starts),
    renewsOn: fmtDate(row?.plan_renews_at ?? demo?.renews),
    nextBillingAmount: pricePerSeat * seats,
  };
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
      .select('id, first_name, last_name, profession, reg_number, city, session_rate, hst_exempt, plan_type, plan_cycle, plan_seats, price_per_seat, is_trial, trial_ends_at, plan_starts_at, plan_renews_at, created_at, updated_at')
      .eq('id', session.user.id)
      .maybeSingle();

    const row = data as ClinicianRow | null;

    // Build profile: prefer DB values, fall back to DEMO_ACCOUNTS by email
    const demo = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());

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
    });

    setSubscriptionState(buildSubscriptionFromClinicianRow(row, email));
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
      ).toString(16).padStart(8, '0') + '-d000-4000-8000-' + Date.now().toString(16).padStart(12, '0');

      const profile = buildProfileFromDemoAndAuth(fakeId, email);
      if (profile) setUser(profile);
      setSubscriptionState(buildSubscriptionFromClinicianRow(null, email));
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
