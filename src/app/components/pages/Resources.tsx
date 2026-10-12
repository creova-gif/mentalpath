import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Phone, Globe, Mail, Printer, ExternalLink, Heart } from 'lucide-react';

interface Resource {
  id: number;
  name: string;
  /** Key into resourcesPage.types; descriptions live in resourcesPage.items.<id>. */
  type: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  province: string;
  region?: string;
  culturalFocus?: string[];
  languages?: string[];
  available247?: boolean;
}

const resources: Resource[] = [
  // Ontario - Niagara Region
  {
    id: 1,
    name: 'Distress Centre Niagara',
    type: 'crisis',
    phone: '905-688-3711',
    website: 'https://www.dcniagara.org',
    province: 'ON',
    region: 'Niagara',
    available247: true,
    languages: ['EN', 'FR'],
  },
  {
    id: 2,
    name: 'YMCA Niagara - Immigrant Services',
    type: 'newcomer',
    phone: '905-646-7660',
    website: 'https://www.ymcaniagara.org',
    address: '61 St. Paul St, St. Catharines, ON',
    province: 'ON',
    region: 'Niagara',
    culturalFocus: ['Newcomer', 'Refugee'],
    languages: ['EN', 'FR', 'AR', 'ES'],
  },
  {
    id: 3,
    name: 'Niagara Regional Native Centre',
    type: 'cultural',
    phone: '905-684-5603',
    website: 'https://www.nrnc.ca',
    address: '295 Fourth Ave, St. Catharines, ON',
    province: 'ON',
    region: 'Niagara',
    culturalFocus: ['Indigenous'],
    languages: ['EN'],
  },
  {
    id: 4,
    name: 'Prideline Niagara',
    type: 'lgbtq',
    phone: '905-684-1118',
    website: 'https://www.pridelineniagara.com',
    province: 'ON',
    region: 'Niagara',
    culturalFocus: ['LGBTQ+'],
    languages: ['EN', 'FR'],
  },
  {
    id: 5,
    name: 'Folk Arts Multicultural Centre',
    type: 'cultural',
    phone: '905-685-6589',
    website: 'https://www.folkarts.ca',
    address: '85 Church St, St. Catharines, ON',
    province: 'ON',
    region: 'Niagara',
    culturalFocus: ['Newcomer', 'Racialized Communities'],
    languages: ['EN', 'FR', 'AR', 'ES', 'ZH'],
  },

  // Ontario - Toronto
  {
    id: 6,
    name: 'Across Boundaries',
    type: 'mental-health',
    phone: '416-787-3007',
    website: 'https://www.acrossboundaries.ca',
    province: 'ON',
    region: 'Toronto',
    culturalFocus: ['Racialized Communities', 'Newcomer'],
    languages: ['EN', 'AR', 'SO', 'TI'],
  },
  {
    id: 7,
    name: 'The 519',
    type: 'lgbtq',
    phone: '416-392-6874',
    website: 'https://www.the519.org',
    address: '519 Church St, Toronto, ON',
    province: 'ON',
    region: 'Toronto',
    culturalFocus: ['LGBTQ+'],
    languages: ['EN', 'FR'],
  },
  {
    id: 8,
    name: 'COSTI Immigrant Services',
    type: 'newcomer',
    phone: '416-658-1600',
    website: 'https://www.costi.org',
    province: 'ON',
    region: 'Toronto',
    culturalFocus: ['Newcomer', 'Refugee'],
    languages: ['EN', 'IT', 'ES', 'AR', 'ZH', 'UR', 'FA'],
  },
  {
    id: 9,
    name: 'Anishnawbe Health Toronto',
    type: 'indigenous',
    phone: '416-360-0486',
    website: 'https://www.aht.ca',
    province: 'ON',
    region: 'Toronto',
    culturalFocus: ['Indigenous'],
    languages: ['EN', 'OJ'],
  },
  {
    id: 10,
    name: 'Youthlink',
    type: 'youth',
    phone: '416-924-2100',
    website: 'https://www.youthlink.ca',
    province: 'ON',
    region: 'Toronto',
    culturalFocus: ['Youth'],
    languages: ['EN', 'FR'],
  },

  // Ontario - Ottawa
  {
    id: 11,
    name: 'Ottawa Distress Centre',
    type: 'crisis',
    phone: '613-238-3311',
    website: 'https://www.dcottawa.on.ca',
    province: 'ON',
    region: 'Ottawa',
    available247: true,
    languages: ['EN', 'FR'],
  },
  {
    id: 12,
    name: 'Catholic Centre for Immigrants',
    type: 'newcomer',
    phone: '613-232-9634',
    website: 'https://www.cciottawa.ca',
    province: 'ON',
    region: 'Ottawa',
    culturalFocus: ['Newcomer', 'Refugee'],
    languages: ['EN', 'FR', 'AR', 'SO'],
  },

  // British Columbia
  {
    id: 13,
    name: 'Crisis Centre BC',
    type: 'crisis',
    phone: '1-800-784-2433',
    website: 'https://crisiscentre.bc.ca',
    province: 'BC',
    available247: true,
    languages: ['EN'],
  },
  {
    id: 14,
    name: 'DIVERSEcity Community Resources Society',
    type: 'newcomer',
    phone: '604-597-0205',
    website: 'https://www.dcrs.ca',
    province: 'BC',
    region: 'Vancouver',
    culturalFocus: ['Newcomer', 'Refugee'],
    languages: ['EN', 'ZH', 'PA', 'HI', 'AR'],
  },
  {
    id: 15,
    name: 'Qmunity',
    type: 'lgbtq',
    phone: '604-684-5307',
    website: 'https://qmunity.ca',
    province: 'BC',
    region: 'Vancouver',
    culturalFocus: ['LGBTQ+'],
    languages: ['EN'],
  },

  // Alberta
  {
    id: 16,
    name: 'Distress Centre Calgary',
    type: 'crisis',
    phone: '403-266-4357',
    website: 'https://www.distresscentre.com',
    province: 'AB',
    region: 'Calgary',
    available247: true,
    languages: ['EN'],
  },
  {
    id: 17,
    name: 'Centre for Newcomers',
    type: 'newcomer',
    phone: '403-569-3325',
    website: 'https://www.centrefornewcomers.ca',
    province: 'AB',
    region: 'Calgary',
    culturalFocus: ['Newcomer', 'Refugee'],
    languages: ['EN', 'AR', 'ZH', 'FR', 'SO'],
  },
  {
    id: 18,
    name: 'Support Network',
    type: 'crisis',
    phone: '780-482-4357',
    website: 'https://www.supportnetwork.ca',
    province: 'AB',
    region: 'Edmonton',
    available247: true,
    languages: ['EN'],
  },

  // Quebec
  {
    id: 19,
    name: 'Tel-Aide',
    type: 'crisis',
    phone: '514-935-1101',
    website: 'https://www.tel-aide.org',
    province: 'QC',
    region: 'Montreal',
    available247: true,
    languages: ['FR', 'EN'],
  },
  {
    id: 20,
    name: 'AGIR - Action LGBTQ+ avec immigrant-es et réfugié-es',
    type: 'lgbtq',
    phone: '514-934-4096',
    website: 'https://www.agirmontreal.org',
    province: 'QC',
    region: 'Montreal',
    culturalFocus: ['LGBTQ+', 'Newcomer', 'Refugee'],
    languages: ['FR', 'EN', 'ES', 'AR'],
  },
  {
    id: 21,
    name: 'PROMIS',
    type: 'newcomer',
    phone: '514-342-2111',
    website: 'https://www.promis.qc.ca',
    province: 'QC',
    region: 'Montreal',
    culturalFocus: ['Newcomer', 'Refugee'],
    languages: ['FR', 'EN', 'AR', 'ES'],
  },

  // Nova Scotia
  {
    id: 22,
    name: 'Mental Health Crisis Line',
    type: 'crisis',
    phone: '1-888-429-8167',
    website: 'https://www.nsha.ca',
    province: 'NS',
    available247: true,
    languages: ['EN', 'FR'],
  },
  {
    id: 23,
    name: 'ISANS - Immigrant Services Association of Nova Scotia',
    type: 'newcomer',
    phone: '902-423-3607',
    website: 'https://www.isans.ca',
    province: 'NS',
    region: 'Halifax',
    culturalFocus: ['Newcomer', 'Refugee'],
    languages: ['EN', 'AR', 'FR'],
  },

  // Manitoba
  {
    id: 24,
    name: 'Klinic Crisis Line',
    type: 'crisis',
    phone: '204-786-8686',
    website: 'https://www.klinic.mb.ca',
    province: 'MB',
    region: 'Winnipeg',
    available247: true,
    languages: ['EN'],
  },
  {
    id: 25,
    name: 'Rainbow Resource Centre',
    type: 'lgbtq',
    phone: '204-474-0212',
    website: 'https://www.rainbowresourcecentre.org',
    province: 'MB',
    region: 'Winnipeg',
    culturalFocus: ['LGBTQ+'],
    languages: ['EN'],
  },

  // National Resources
  {
    id: 26,
    name: '9-8-8: Suicide Crisis Helpline',
    type: 'crisis',
    phone: '988',
    website: 'https://988.ca',
    province: 'National',
    available247: true,
    languages: ['EN', 'FR'],
  },
  {
    id: 27,
    name: 'Hope for Wellness Helpline',
    type: 'indigenous',
    phone: '1-855-242-3310',
    website: 'https://www.hopeforwellness.ca',
    province: 'National',
    available247: true,
    culturalFocus: ['Indigenous'],
    languages: ['EN', 'FR', 'CR', 'OJ', 'IN'],
  },
  {
    id: 28,
    name: 'Trans Lifeline',
    type: 'lgbtq',
    phone: '1-877-330-6366',
    website: 'https://translifeline.org',
    province: 'National',
    culturalFocus: ['LGBTQ+'],
    languages: ['EN', 'FR', 'ES'],
  },
  {
    id: 29,
    name: 'Kids Help Phone',
    type: 'youth',
    phone: '1-800-668-6868',
    website: 'https://kidshelpphone.ca',
    province: 'National',
    available247: true,
    culturalFocus: ['Youth'],
    languages: ['EN', 'FR'],
  },
  {
    id: 30,
    name: 'Black Youth Helpline',
    type: 'youth',
    phone: '1-833-294-8650',
    website: 'https://blackyouth.ca',
    province: 'National',
    culturalFocus: ['Youth', 'Racialized Communities'],
    languages: ['EN', 'FR'],
  },
];

// Labels for these codes live in resourcesPage.* (EN/FR).
const PROVINCES = ['all', 'National', 'ON', 'BC', 'AB', 'QC', 'NS', 'MB', 'SK', 'NB', 'PE', 'NL', 'YT', 'NT', 'NU'];
const TYPES = ['all', 'crisis', 'newcomer', 'lgbtq', 'indigenous', 'youth', 'cultural', 'mental-health'];
const COMMUNITIES: { id: string; color: string }[] = [
  { id: 'all', color: 'bg-gray-100 text-gray-700' },
  { id: 'Newcomer', color: 'bg-[#E1F5EE] text-[#085041]' },
  { id: 'Refugee', color: 'bg-[#E6F1FB] text-[#0C447C]' },
  { id: 'LGBTQ+', color: 'bg-[#EEEDFE] text-[#3C3489]' },
  { id: 'Indigenous', color: 'bg-[#FAEEDA] text-[#633806]' },
  { id: 'Youth', color: 'bg-[#FAECE7] text-[#712B13]' },
  { id: 'Racialized Communities', color: 'bg-[#FBEAF0] text-[#72243E]' },
];

export function Resources() {
  const { t } = useTranslation();
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCulturalFocus, setSelectedCulturalFocus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const describe = (r: Resource) => t(`resourcesPage.items.${r.id}`);
  const typeLabel = (id: string) => t(`resourcesPage.types.${id}`);
  const communityLabel = (id: string) => t(`resourcesPage.communities.${id}`);
  const q = searchQuery.trim().toLowerCase();
  const filteredResources = resources.filter(r =>
    (selectedProvince === 'all' || r.province === selectedProvince)
    && (selectedType === 'all' || r.type === selectedType)
    && (selectedCulturalFocus === 'all' || r.culturalFocus?.includes(selectedCulturalFocus))
    && (!q || r.name.toLowerCase().includes(q) || describe(r).toLowerCase().includes(q) || typeLabel(r.type).toLowerCase().includes(q)));

  const select = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c6f] text-sm';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 no-print">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#2C3E35] mb-2">{t('resourcesPage.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600">{t('resourcesPage.subtitle')}</p>
          </div>
          <button onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4a7c6f] text-white rounded-lg hover:bg-[#3d6b5f] transition-colors w-full sm:w-auto border-none cursor-pointer">
            <Printer className="w-4 h-4" aria-hidden="true" />
            {t('resourcesPage.print')}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">{t('resourcesPage.noticeTitle')}</h2>
              <p className="text-xs sm:text-sm text-blue-800">{t('resourcesPage.noticeBody')}</p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <input type="search" aria-label={t('resourcesPage.search')} placeholder={t('resourcesPage.search')} value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c6f] text-sm sm:text-base" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="res-province" className="block text-sm font-medium text-gray-700 mb-2">{t('resourcesPage.province')}</label>
            <select id="res-province" value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)} className={select}>
              {PROVINCES.map(code => <option key={code} value={code}>{t(`resourcesPage.provinces.${code}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="res-type" className="block text-sm font-medium text-gray-700 mb-2">{t('resourcesPage.type')}</label>
            <select id="res-type" value={selectedType} onChange={e => setSelectedType(e.target.value)} className={select}>
              {TYPES.map(id => <option key={id} value={id}>{typeLabel(id)}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="res-community" className="block text-sm font-medium text-gray-700 mb-2">{t('resourcesPage.community')}</label>
            <select id="res-community" value={selectedCulturalFocus} onChange={e => setSelectedCulturalFocus(e.target.value)} className={select}>
              {COMMUNITIES.map(c => <option key={c.id} value={c.id}>{communityLabel(c.id)}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {COMMUNITIES.map(c => (
            <button key={c.id} onClick={() => setSelectedCulturalFocus(c.id)} aria-pressed={selectedCulturalFocus === c.id}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all border-none cursor-pointer ${selectedCulturalFocus === c.id ? c.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {communityLabel(c.id)}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4" aria-live="polite">{t('resourcesPage.showing', { count: filteredResources.length })}</div>
      </div>

      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm sm:text-base">{t('resourcesPage.none')}</p>
          </div>
        ) : filteredResources.map(resource => (
          <article key={resource.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow print:break-inside-avoid print:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold text-[#2C3E35]">{resource.name}</h3>
              {resource.available247 && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">24/7</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2 py-1 bg-[#E8F3F0] text-[#2d5049] text-xs font-medium rounded">{typeLabel(resource.type)}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {resource.province === 'National' ? t('resourcesPage.provinces.National') : `${resource.province}${resource.region ? ` - ${resource.region}` : ''}`}
              </span>
              {resource.culturalFocus?.map(focus => {
                const c = COMMUNITIES.find(x => x.id === focus);
                return c ? <span key={focus} className={`px-2 py-1 text-xs font-medium rounded ${c.color}`}>{communityLabel(focus)}</span> : null;
              })}
            </div>
            <p className="text-sm sm:text-base text-gray-700 mb-4">{describe(resource)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resource.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#4a7c6f] flex-shrink-0" aria-hidden="true" />
                  <a href={`tel:${resource.phone}`} className="text-[#2d5049] hover:underline break-all">{resource.phone}</a>
                </div>
              )}
              {resource.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-[#4a7c6f] flex-shrink-0" aria-hidden="true" />
                  <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-[#2d5049] hover:underline flex items-center gap-1 truncate">
                    <span className="truncate">{t('resourcesPage.website', { name: resource.name })}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                  </a>
                </div>
              )}
              {resource.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#4a7c6f] flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${resource.email}`} className="text-[#2d5049] hover:underline break-all">{resource.email}</a>
                </div>
              )}
              {resource.address && (
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[#4a7c6f] flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-700">{resource.address}</span>
                </div>
              )}
            </div>
            {resource.languages && resource.languages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">{t('resourcesPage.languages', { list: resource.languages.join(', ') })}</div>
            )}
          </article>
        ))}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
