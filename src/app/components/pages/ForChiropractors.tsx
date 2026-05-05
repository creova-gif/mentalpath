import { ProfessionLanding, ProfessionConfig } from './ProfessionLanding';

const config: ProfessionConfig = {
  name: 'Chiropractor',
  namePlural: 'chiropractors',
  regBody: 'CCO (College of Chiropractors of Ontario)',
  badge: 'Built for Canadian chiropractors · PHIPA compliant',
  heroTitle: 'Your adjustments deserve',
  heroTitleItalic: 'better records.',
  heroSubtitle: 'Practice management built for Canadian chiropractors. CCO-compliant SOAP notes, insurance receipts for extended health benefits, online booking, and CAD billing — all in one PHIPA-compliant platform.',
  accentStat: { number: '94%', label: 'of chiropractic clients have extended health benefits' },
  problems: [
    {
      tag: 'Insurance receipt headaches',
      title: 'Generating insurance receipts takes too long',
      desc: 'Blue Cross, Sun Life, Manulife, Green Shield — each has slightly different receipt requirements. Without the right provider number, service code, and format, your clients can\'t get reimbursed and they blame you.',
    },
    {
      tag: 'PHIPA risk',
      title: 'US software puts you at risk',
      desc: 'Storing patient records on American servers violates PHIPA. Your CCO registration could be at risk. MentalPath stores all PHI on Canadian servers in the ca-central-1 region.',
    },
    {
      tag: 'No-show + late cancellation losses',
      title: 'Revenue leaks from scheduling gaps',
      desc: 'Last-minute cancellations with no automated policy enforcement cost solo chiropractors an average of $400–800/month in unbilled time.',
    },
  ],
  features: [
    {
      title: 'Insurance Receipts',
      desc: 'Generate extended health benefit receipts in the correct format for Blue Cross, Sun Life, Manulife, and Green Shield. Provider number and service codes pre-filled.',
      icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
    },
    {
      title: 'CCO-Compliant SOAP Notes',
      desc: 'Note templates built to CCO documentation standards. Sign off on notes in under 5 minutes after each adjustment.',
      icon: <><path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.37 2.63L14 7l-1.5 4.5L17 10l4.37-4.37a2.12 2.12 0 10-3-3z"/></>,
    },
    {
      title: 'Treatment Plan Tracking',
      desc: 'Set a treatment course at intake (e.g. 12 sessions), track progress visit by visit, and prompt reassessment at the review date.',
      icon: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    },
    {
      title: 'Online Booking + CAD Billing',
      desc: 'Clients book their own appointments. Invoices go out automatically. Collect via Stripe in Canadian dollars.',
      icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    },
  ],
  testimonial: {
    quote: 'Finally a Canadian platform that generates proper insurance receipts. My clients stopped emailing me asking why their claims were rejected.',
    name: 'Dr. Marcus T., DC',
    title: 'Chiropractor · Ottawa, ON',
  },
  college: 'CCO',
  collegeStandard: 'CCO-compliant records',
};

export function ForChiropractors() {
  return <ProfessionLanding config={config} />;
}
