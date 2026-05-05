import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from 'src/utils/supabase/client';
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
function buildProfileFromClinicianRow(
  row: Record<string, unknown>,
  email: string
): UserProfile {
  const profession = row.profession as Profession;
  const meta = PROFESSION_META[profession] ?? PROFESSION_META['Registered Psychotherapist'];
  const firstName = String(row.first_name ?? '');
  const lastName = String(row.last_name ?? '');
  return {
    id: String(row.id),
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    initials: `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase(),
    email,
    profession,
    registrationNumber: String(row.reg_number ?? ''),
    city: String(row.city ?? ''),
    ...meta,
    sessionRate: Number(row.session_rate ?? meta.sessionRate),
    hstExempt: Boolean(row.hst_exempt ?? meta.hstExempt),
  };
}

function buildSubscriptionFromClinicianRow(row: Record<string, unknown>): SubscriptionPlan {
  const pricePerSeat = Number(row.price_per_seat ?? 79);
  const seats = Number(row.plan_seats ?? 1);
  const isTrial = Boolean(row.is_trial ?? false);
  const trialEndsAt = row.trial_ends_at ? new Date(String(row.trial_ends_at)) : null;
  const now = new Date();
  const trialDaysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000))
    : null;

  const fmtDate = (val: unknown) =>
    val ? new Date(String(val)).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return {
    type: (row.plan_type as PlanType) ?? 'solo',
    cycle: (row.plan_cycle as BillingCycle) ?? 'monthly',
    seats,
    pricePerSeat,
    trialDaysRemaining: isTrial ? trialDaysRemaining : null,
    isTrial,
    startDate: fmtDate(row.plan_starts_at),
    renewsOn: fmtDate(row.plan_renews_at),
    nextBillingAmount: pricePerSeat * seats,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscriptionState] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from clinicians table given a Supabase session
  const loadProfile = useCallback(async (session: Session) => {
    const { data, error } = await supabase
      .from('clinicians')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !data) {
      // Clinicians row doesn't exist yet — could be a brand-new sign-up.
      // Fall through without crashing.
      console.warn('No clinician profile found for user', session.user.id);
      return;
    }

    setUser(buildProfileFromClinicianRow(data as Record<string, unknown>, session.user.email ?? ''));
    setSubscriptionState(buildSubscriptionFromClinicianRow(data as Record<string, unknown>));
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      return 'bad_credentials';
    }
    return 'ok';
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
