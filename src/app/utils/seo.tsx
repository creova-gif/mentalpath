import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export function SEO({
  title = 'MentalPath — PHIPA-Compliant Practice Management for Canadian Therapists',
  description = 'Practice management built for Canadian therapists, psychotherapists, and social workers. PHIPA-compliant, culturally-informed client management, session notes, billing, and client portal. From $49/month.',
  keywords = 'PHIPA compliant therapy software, Canadian therapist practice management, psychotherapy practice software Canada, mental health EMR Canada, therapy billing software, PIPEDA compliant, Ontario therapist software, Quebec psychotherapist software, bilingual therapy software',
  ogImage = '/og-image.png',
  canonical
}: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // Open Graph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:type', 'website', true);
    
    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, keywords, ogImage, canonical]);

  return null;
}

export function addStructuredData(data: object) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  
  return () => {
    document.head.removeChild(script);
  };
}

export const mentalPathSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MentalPath',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Practice Management Software',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '79',
    priceCurrency: 'CAD',
    priceSpecification: [
      {
        '@type': 'UnitPriceSpecification',
        price: '0',
        priceCurrency: 'CAD',
        name: 'Starter Plan'
      },
      {
        '@type': 'UnitPriceSpecification',
        price: '49',
        priceCurrency: 'CAD',
        name: 'Solo Practitioner Plan',
        billingDuration: 'P1M'
      },
      {
        '@type': 'UnitPriceSpecification',
        price: '79',
        priceCurrency: 'CAD',
        name: 'Group Practice Plan',
        billingDuration: 'P1M'
      }
    ]
  },
  author: {
    '@type': 'Organization',
    name: 'MentalPath',
    url: 'https://mentalpath.ca'
  },
  description: 'PHIPA-compliant practice management software for Canadian mental health practitioners. Includes client management, session notes, billing, and client portal.',
  featureList: [
    'PHIPA & PIPEDA Compliant',
    'Canadian Server Hosting (AWS ca-central-1)',
    'Client Management with Cultural Templates',
    'Session Notes (SOAP, DAP, BIRP)',
    'AI-Assisted Note Generation',
    'Billing & Invoicing',
    'Client Portal',
    'Bilingual (English/French)',
    'T2125 Tax Export'
  ],
  image: '/og-image.png',
  screenshot: '/dashboard-preview.png',
  softwareVersion: '1.0',
  releaseNotes: 'Initial launch with bilingual support',
  countriesSupported: 'CA',
  inLanguage: ['en-CA', 'fr-CA']
};
