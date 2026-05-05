import { ProfessionLanding, ProfessionConfig } from './ProfessionLanding';

const config: ProfessionConfig = {
  name: 'Registered Massage Therapist',
  namePlural: 'massage therapists',
  regBody: 'CMTO (College of Massage Therapists of Ontario)',
  badge: 'Built for Canadian RMTs · PHIPA compliant',
  heroTitle: 'Every treatment,',
  heroTitleItalic: 'perfectly documented.',
  heroSubtitle: 'Practice management built for Registered Massage Therapists. CMTO-compliant SOAP notes, insurance receipts your clients can actually submit, online booking, and CAD billing — in one PHIPA-compliant platform.',
  accentStat: { number: '87%', label: 'of RMT clients claim through extended health benefits' },
  problems: [
    {
      tag: 'Insurance receipt rejections',
      title: 'Clients get their receipts rejected',
      desc: 'If your receipt doesn\'t include your CMTO registration number, profession code, and the correct service description, extended health insurers reject the claim. Your clients come back frustrated — and blame you.',
    },
    {
      tag: 'SOAP note burden',
      title: 'Writing notes after every treatment takes too long',
      desc: 'CMTO requires a SOAP note for every treatment. Writing them from scratch after 6–8 treatments a day burns your evenings and weekends. Most RMTs spend 45–90 min/day on notes alone.',
    },
    {
      tag: 'Scheduling gaps cost money',
      title: 'Last-minute cancellations go unfilled',
      desc: 'Without a waitlist and automated rebooking, a cancelled 60-minute appointment means lost revenue. Most RMTs have no automated system to fill gaps.',
    },
  ],
  features: [
    {
      title: 'Insurance Receipts',
      desc: 'CMTO-formatted receipts with your registration number, profession code, and service description. Clients submit to Blue Cross, Sun Life, Manulife, Green Shield without issues.',
      icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
    },
    {
      title: 'AI SOAP Notes',
      desc: 'Draft CMTO-compliant SOAP notes in under 60 seconds. Review and sign. Never start from a blank page again.',
      icon: <><path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.37 2.63L14 7l-1.5 4.5L17 10l4.37-4.37a2.12 2.12 0 10-3-3z"/></>,
    },
    {
      title: 'Online Booking',
      desc: 'Clients book 60 or 90-minute treatments online. Automated reminders reduce no-shows. Waitlist fills cancellations automatically.',
      icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    },
    {
      title: 'CAD Billing + Cancellation Policy',
      desc: 'Invoice in Canadian dollars, collect via Stripe, and automatically charge late-cancellation fees per your policy.',
      icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    },
  ],
  testimonial: {
    quote: 'My clients used to get their claims rejected constantly. Since switching to MentalPath receipts, I haven\'t had a single complaint.',
    name: 'Priya R., RMT',
    title: 'Registered Massage Therapist · Toronto, ON',
  },
  college: 'CMTO',
  collegeStandard: 'CMTO-compliant records',
};

export function ForMassageTherapists() {
  return <ProfessionLanding config={config} />;
}
