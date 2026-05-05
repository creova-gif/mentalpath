import { ProfessionLanding, ProfessionConfig } from './ProfessionLanding';

const config: ProfessionConfig = {
  name: 'Naturopathic Doctor',
  namePlural: 'naturopathic doctors',
  regBody: 'CONO (College of Naturopaths of Ontario)',
  badge: 'Built for Canadian NDs · PHIPA compliant',
  heroTitle: 'Whole-person care.',
  heroTitleItalic: 'Whole-practice management.',
  heroSubtitle: 'Practice management built for Canadian Naturopathic Doctors. CONO-compliant records, comprehensive intake forms, protocol tracking, and CAD billing — all PHIPA-compliant, all in one place.',
  accentStat: { number: '90min', label: 'average ND initial consultation time' },
  problems: [
    {
      tag: 'Complex intake, fragmented tools',
      title: 'ND intakes are long — your software shouldn\'t make them longer',
      desc: 'A first ND visit covers health history, lifestyle, diet, supplements, labs, and family history. Generic intake forms miss half of it. You end up building custom forms in Google Docs every time.',
    },
    {
      tag: 'PHIPA risk',
      title: 'US software is non-compliant',
      desc: 'Naturopathic patient records contain sensitive PHI. Storing them on American servers violates PHIPA and CONO standards. MentalPath keeps all data in Canada on encrypted, ca-central-1 servers.',
    },
    {
      tag: 'Protocol tracking is manual',
      title: 'Supplement and treatment protocols live in your head',
      desc: 'Tracking which supplements a patient is on, at what dose, since when — and comparing their current labs to baseline — requires either a great memory or a spreadsheet. Neither scales.',
    },
  ],
  features: [
    {
      title: 'Comprehensive Intake Builder',
      desc: 'Build ND-specific intake forms covering health history, lifestyle, diet, supplements, labs, and family history. Clients complete before the first visit.',
      icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
    },
    {
      title: 'CONO-Compliant Records',
      desc: 'Note templates built to CONO documentation standards. AI-assisted drafting. Sign off in under 5 minutes.',
      icon: <><path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.37 2.63L14 7l-1.5 4.5L17 10l4.37-4.37a2.12 2.12 0 10-3-3z"/></>,
    },
    {
      title: 'Client Portal for Protocol Sharing',
      desc: 'Share supplement protocols, dietary recommendations, and lab results securely. Clients access their plan between visits.',
      icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    },
    {
      title: 'CAD Billing + Booking',
      desc: 'Online booking for 90-min initial and 45-min follow-up visits. Invoice in CAD, collect via Stripe, generate tax summaries.',
      icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    },
  ],
  testimonial: {
    quote: 'The intake forms alone saved me hours a week. My patients arrive at their first visit with everything already in the system.',
    name: 'Dr. Leila N., ND',
    title: 'Naturopathic Doctor · Calgary, AB',
  },
  college: 'CONO',
  collegeStandard: 'CONO-compliant records',
};

export function ForNaturopaths() {
  return <ProfessionLanding config={config} />;
}
