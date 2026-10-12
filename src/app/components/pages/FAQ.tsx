import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, ShieldCheck, FileText, CreditCard, HelpCircle, Lock, type LucideIcon } from 'lucide-react';

// Answers describe what the product does today (see docs/privacy and the
// audit remediation log). Keep them in sync when behaviour changes.
const CATEGORIES: { id: string; icon: LucideIcon }[] = [
  { id: 'privacy', icon: ShieldCheck },
  { id: 'billing', icon: CreditCard },
  { id: 'features', icon: FileText },
  { id: 'technical', icon: HelpCircle },
  { id: 'regulatory', icon: Lock },
];

interface Qa { q: string; a: string }

export function FAQ() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>('privacy');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const categories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATEGORIES.map(c => ({
      ...c,
      title: t(`faq.categories.${c.id}.title`),
      faqs: (t(`faq.categories.${c.id}.items`, { returnObjects: true }) as Qa[])
        .filter(f => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
    })).filter(c => c.faqs.length > 0);
  }, [searchQuery, t]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--ink)] mb-2">{t('faq.title')}</h1>
        <p className="text-[var(--ink-muted)] text-sm">{t('faq.subtitle')}</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-muted)]" aria-hidden="true" />
        <input type="search" aria-label={t('faq.search')} placeholder={t('faq.search')} value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage)] bg-[var(--surface)]" />
      </div>

      <div className="space-y-3">
        {categories.map(category => {
          const Icon = category.icon;
          const isOpen = openCategory === category.id || searchQuery.trim() !== '';
          return (
            <section key={category.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
              <h2>
                <button onClick={() => setOpenCategory(openCategory === category.id ? null : category.id)} aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-4 hover:bg-[var(--warm)] transition-colors bg-transparent border-none cursor-pointer">
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[var(--sage)]" aria-hidden="true" />
                    <span className="font-medium text-[var(--ink)]">{category.title}</span>
                    <span className="text-xs text-[var(--ink-muted)] bg-[var(--warm)] px-2 py-1 rounded-full">{category.faqs.length}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-[var(--ink-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h2>
              {isOpen && (
                <div className="border-t border-[var(--border)]">
                  {category.faqs.map((faq, i) => {
                    const id = `${category.id}-${i}`;
                    const isFAQOpen = openFAQ === id;
                    return (
                      <div key={id} className="border-b border-[var(--border)] last:border-b-0">
                        <h3>
                          <button onClick={() => setOpenFAQ(isFAQOpen ? null : id)} aria-expanded={isFAQOpen} aria-controls={`faq-${id}`}
                            className="w-full flex items-start justify-between p-4 hover:bg-[var(--warm)] transition-colors text-left bg-transparent border-none cursor-pointer">
                            <span className="flex-1 font-medium text-[var(--ink)] pr-4">{faq.q}</span>
                            <ChevronDown className={`w-4 h-4 text-[var(--ink-muted)] flex-shrink-0 mt-1 transition-transform ${isFAQOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                          </button>
                        </h3>
                        {isFAQOpen && <p id={`faq-${id}`} className="px-4 pb-4 text-sm text-[var(--ink-soft)] leading-relaxed">{faq.a}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-[var(--ink-muted)] mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-medium text-[var(--ink)] mb-2">{t('faq.noResults')}</h2>
          <p className="text-[var(--ink-muted)] text-sm">{t('faq.tryAgain')}</p>
        </div>
      )}

      <p className="mt-10 text-sm text-[var(--ink-soft)] text-center">
        {t('faq.stillNeed')} <Link to="/contact" className="text-[var(--sage-deep)] underline">{t('faq.contactSupport')}</Link>
      </p>
    </div>
  );
}
