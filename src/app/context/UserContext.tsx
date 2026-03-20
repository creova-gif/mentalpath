import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  login: (email: string, password: string) => 'ok' | 'bad_credentials';
  logout: () => void;
  setSubscription: (plan: SubscriptionPlan) => void;
}

const PROFESSION_META: Record<Profession, { college: string; collegeAbbr: string; notesLabel: string; noteFormat: string; hstExempt: boolean; sessionRate: number }> = {
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

function buildProfile(base: Omit<UserProfile, 'college' | 'collegeAbbr' | 'notesLabel' | 'noteFormat' | 'hstExempt' | 'sessionRate'>): UserProfile {
  const meta = PROFESSION_META[base.profession];
  return { ...base, ...meta };
}

const DEMO_ACCOUNTS: Array<{ email: string; password: string; profile: UserProfile; subscription: SubscriptionPlan }> = [
  {
    email: 'dr.osei@mentalpath.ca',
    password: 'demo1234',
    profile: buildProfile({
      name: 'Dr. Abena Osei-Mensah',
      firstName: 'Abena',
      lastName: 'Osei-Mensah',
      initials: 'AO',
      email: 'dr.osei@mentalpath.ca',
      profession: 'Registered Psychotherapist',
      registrationNumber: 'CRPO-004821',
      city: 'Toronto, ON',
    }),
    subscription: {
      type: 'solo',
      cycle: 'monthly',
      seats: 1,
      pricePerSeat: 79,
      trialDaysRemaining: null,
      isTrial: false,
      startDate: 'September 1, 2025',
      renewsOn: 'April 1, 2026',
      nextBillingAmount: 79,
    },
  },
  {
    email: 'dr.chen@spine360.ca',
    password: 'demo1234',
    profile: buildProfile({
      name: 'Dr. Marcus Chen',
      firstName: 'Marcus',
      lastName: 'Chen',
      initials: 'MC',
      email: 'dr.chen@spine360.ca',
      profession: 'Chiropractor',
      registrationNumber: 'CCO-012047',
      city: 'Vancouver, BC',
    }),
    subscription: {
      type: 'solo',
      cycle: 'annual',
      seats: 1,
      pricePerSeat: 69,
      trialDaysRemaining: null,
      isTrial: false,
      startDate: 'January 15, 2026',
      renewsOn: 'January 15, 2027',
      nextBillingAmount: 828,
    },
  },
  {
    email: 'sarah.patel@physiocare.ca',
    password: 'demo1234',
    profile: buildProfile({
      name: 'Sarah Patel',
      firstName: 'Sarah',
      lastName: 'Patel',
      initials: 'SP',
      email: 'sarah.patel@physiocare.ca',
      profession: 'Physiotherapist',
      registrationNumber: 'CPT-008834',
      city: 'Calgary, AB',
    }),
    subscription: {
      type: 'group',
      cycle: 'monthly',
      seats: 4,
      pricePerSeat: 69,
      trialDaysRemaining: null,
      isTrial: false,
      startDate: 'November 1, 2025',
      renewsOn: 'April 1, 2026',
      nextBillingAmount: 276,
    },
  },
  {
    email: 'j.williams@rmtcare.ca',
    password: 'demo1234',
    profile: buildProfile({
      name: 'Jordan Williams',
      firstName: 'Jordan',
      lastName: 'Williams',
      initials: 'JW',
      email: 'j.williams@rmtcare.ca',
      profession: 'Registered Massage Therapist',
      registrationNumber: 'CMTO-019923',
      city: 'Ottawa, ON',
    }),
    subscription: {
      type: 'solo',
      cycle: 'monthly',
      seats: 1,
      pricePerSeat: 79,
      trialDaysRemaining: 4,
      isTrial: true,
      startDate: 'March 16, 2026',
      renewsOn: 'March 23, 2026',
      nextBillingAmount: 79,
    },
  },
];

const UserContext = createContext<UserContextType | null>(null);

const STORAGE_KEY = 'mentalpath_user_email';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscriptionState] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const account = DEMO_ACCOUNTS.find(a => a.email === saved);
      if (account) {
        setUser(account.profile);
        setSubscriptionState(account.subscription);
      }
    }
  }, []);

  const login = (email: string, password: string): 'ok' | 'bad_credentials' => {
    const account = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    );
    if (!account) return 'bad_credentials';
    setUser(account.profile);
    setSubscriptionState(account.subscription);
    localStorage.setItem(STORAGE_KEY, account.email);
    return 'ok';
  };

  const logout = () => {
    setUser(null);
    setSubscriptionState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const setSubscription = (plan: SubscriptionPlan) => {
    setSubscriptionState(plan);
  };

  return (
    <UserContext.Provider value={{ user, subscription, isLoggedIn: !!user, login, logout, setSubscription }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}

export { DEMO_ACCOUNTS };
