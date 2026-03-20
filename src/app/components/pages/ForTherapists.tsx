import { ProfessionLanding, ProfessionConfig } from './ProfessionLanding';

const config: ProfessionConfig = {
  name: 'Therapist',
  namePlural: 'therapists',
  regBody: 'CRPO, CPO & OCSW',
  badge: 'Built for Canadian therapists · PHIPA compliant',
  heroTitle: 'Less admin.',
  heroTitleItalic: 'More presence with your clients.',
  heroSubtitle: 'Practice management built for Canadian psychotherapists, registered social workers, and counsellors. PHIPA-compliant, culturally-informed, and priced for solo practice.',
  accentStat: { number: '8h', label: 'admin hours saved per week on average' },
  problems: [
    {
      tag: 'Privacy breach risk',
      title: 'US software violates PHIPA',
      desc: 'SimplePractice, TheraNest, and TherapyNotes store your clients\' most sensitive mental health records on American servers. Your College requires Canadian data residency — most US tools fail this.',
    },
    {
      tag: '$400–1,200/yr wasted',
      title: 'Enterprise pricing for solo work',
      desc: 'Jane App starts at $54/mo and climbs fast. Owl Practice at $89/mo. You\'re paying for features built for 10-clinician clinics. 70% of Canadian therapists work solo or in pairs.',
    },
    {
      tag: '2–3 hrs/week on notes',
      title: 'Clinical notes take too long',
      desc: 'Writing SOAP and DAP notes from scratch after every session burns your evenings. No AI assistant, no CRPO-standard templates, no auto-fill from session context.',
    },
  ],
  features: [
    {
      title: 'AI Clinical Note Drafting',
      desc: 'Draft SOAP or DAP notes in under 60 seconds. Review, edit, and sign. CRPO documentation standards built in.',
      icon: <><path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.37 2.63L14 7l-1.5 4.5L17 10l4.37-4.37a2.12 2.12 0 10-3-3z"/></>,
    },
    {
      title: 'Outcome Measures',
      desc: 'PHQ-9, GAD-7, WHODAS auto-scored and trended over time. Flag elevated risk automatically.',
      icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    },
    {
      title: 'Cultural Intake Forms',
      desc: 'Newcomer trauma, racialized stress, and community-specific frameworks — built into intake, not bolted on.',
      icon: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></>,
    },
    {
      title: 'CAD Billing + Receipts',
      desc: 'Send invoices in Canadian dollars, collect via Stripe, generate T2125 summaries at tax time.',
      icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    },
  ],
  testimonial: {
    quote: 'MentalPath cut my after-session admin from 45 minutes to under 10. The CRPO note templates alone are worth the subscription.',
    name: 'Dr. Amara S.',
    title: 'Registered Psychotherapist, CRPO · Toronto, ON',
  },
  college: 'CRPO',
  collegeStandard: 'CRPO-compliant records',
};

export function ForTherapists() {
  return <ProfessionLanding config={config} />;
}
