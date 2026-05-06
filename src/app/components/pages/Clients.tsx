import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { ClientDetailPanel } from '../modals/ClientDetailPanel';
import { NoteModal } from '../modals/NoteModal';
import { NewClientModal } from '../modals/NewClientModal';
import { supabase } from '@/utils/supabase/client';
import { useUser } from '@/app/context/UserContext';
import { useDebounce } from '@/app/hooks/useDebounce';

export type Client = {
  id: string;
  initials: string;
  name: string;
  since: string;
  status: 'active' | 'waitlist' | 'inactive';
  nextSession: string;
  sessions: string;
  tags: string[];
  rate: string;
  color: string;
  dbClient?: any;
};

const AVATAR_COLORS = ['c-av-a', 'c-av-b', 'c-av-c', 'c-av-d', 'c-av-e', 'c-av-f'];

export function Clients() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [noteModalClient, setNoteModalClient] = useState<Client | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    async function fetchClients() {
      if (!user) return;
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        setIsLoading(false);
        return;
      }

      const formattedClients: Client[] = data.map((row: any, i: number) => {
        const firstName = row.first_name || '';
        const lastName = row.last_name || '';
        const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
        
        const createdDate = new Date(row.created_at);
        const sinceStr = `${t('clients.since')} ${createdDate.toLocaleString('default', { month: 'short' })} ${createdDate.getFullYear()} · ${t('clients.rp')}: ${user.lastName}`;

        return {
          id: row.id,
          initials: initials || '?',
          name: `${firstName} ${lastName}`.trim(),
          since: sinceStr,
          status: row.status as any,
          nextSession: '—', // Need additional tables (e.g. sessions) to populate
          sessions: '—',    
          tags: row.pronouns ? [row.pronouns] : [], 
          rate: `$${user.sessionRate}/hr`,
          color: AVATAR_COLORS[i % AVATAR_COLORS.length],
          dbClient: row,
        };
      });

      setClients(formattedClients);
      setIsLoading(false);
    }

    fetchClients();
  }, [user, refreshKey]);

  const allTags = Array.from(new Set(clients.flatMap(c => c.tags))).filter(Boolean);

  const filteredClients = clients.filter((client) => {
    const matchesFilter = filter === 'all' || client.status === filter;
    const matchesSearch = !debouncedSearchQuery || 
      client.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      client.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'all' || client.tags.includes(selectedTag);
      
    return matchesFilter && matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'newest') return new Date(b.dbClient?.created_at || 0).getTime() - new Date(a.dbClient?.created_at || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.dbClient?.created_at || 0).getTime() - new Date(b.dbClient?.created_at || 0).getTime();
    return 0;
  });

  return (
    <>
      {/* Header and filters */}
      <div className="flex flex-col mb-5 gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-sm text-[var(--ink-muted)]">
            {clients.filter(c => c.status === 'active').length} {t('clients.activeClients')} · {clients.filter(c => c.status === 'waitlist').length} {t('clients.onWaitlist')}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsNewClientModalOpen(true)}
              className="hidden sm:block px-4 py-1.5 rounded-[20px] text-xs font-medium border border-[var(--sage)] bg-[var(--sage)] text-white cursor-pointer transition-all hover:bg-[var(--sage-deep)] hover:border-[var(--sage-deep)] whitespace-nowrap shadow-sm"
            >
              {t('clients.newClientBtn')}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--ink-muted)]" />
            </div>
            <input
              type="text"
              placeholder={t('clients.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white placeholder-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sage)] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1 items-center scrollbar-none">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>{t('clients.filters.all')}</FilterButton>
            <FilterButton active={filter === 'active'} onClick={() => setFilter('active')}>{t('clients.filters.active')}</FilterButton>
            <FilterButton active={filter === 'waitlist'} onClick={() => setFilter('waitlist')}>{t('clients.filters.waitlist')}</FilterButton>
            <FilterButton active={filter === 'inactive'} onClick={() => setFilter('inactive')}>{t('clients.filters.inactive')}</FilterButton>
            
            <div className="h-5 w-px bg-[var(--border)] mx-1 hidden sm:block"></div>

            <select
              title={t('clients.sort.title', 'Sort by')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-[20px] text-xs font-medium border border-[var(--border)] bg-transparent text-[var(--ink-soft)] outline-none focus:border-[var(--sage)] focus:ring-1 focus:ring-[var(--sage)] transition-all cursor-pointer"
            >
              <option value="newest">{t('clients.sort.newest', 'Newest First')}</option>
              <option value="oldest">{t('clients.sort.oldest', 'Oldest First')}</option>
              <option value="name-asc">{t('clients.sort.nameAsc', 'Name (A-Z)')}</option>
              <option value="name-desc">{t('clients.sort.nameDesc', 'Name (Z-A)')}</option>
            </select>

            {allTags.length > 0 && (
              <select
                title={t('clients.tags.title', 'Filter by tag')}
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-1.5 rounded-[20px] text-xs font-medium border border-[var(--border)] bg-transparent text-[var(--ink-soft)] outline-none focus:border-[var(--sage)] focus:ring-1 focus:ring-[var(--sage)] transition-all cursor-pointer max-w-[120px] text-ellipsis"
              >
                <option value="all">{t('clients.tags.all', 'All Tags')}</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
      
      <div className="sm:hidden mb-4">
        <button 
          onClick={() => setIsNewClientModalOpen(true)}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--sage)] bg-[var(--sage)] text-white cursor-pointer transition-all hover:bg-[var(--sage-deep)] hover:border-[var(--sage-deep)] shadow-sm"
        >
          {t('clients.addNewClientBtn')}
        </button>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('clients.columns.client')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('clients.columns.status')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('clients.columns.nextSession')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('clients.columns.sessions')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('clients.columns.culturalContext')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]">
                {t('clients.columns.rate')}
              </th>
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--ink-muted)] px-5 py-2.5 bg-[var(--warm)]"></th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, i) => (
              <tr
                key={i}
                onClick={() => setSelectedClient(client)}
                className="transition-all duration-100 cursor-pointer hover:[&>td]:bg-[var(--warm)]"
              >
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-sm text-[var(--ink-soft)] align-middle">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(client.color)}`}>
                      {client.initials}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--ink)] text-sm">{client.name}</div>
                      <div className="text-xs text-[var(--ink-muted)]">{client.since}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-sm text-[var(--ink-soft)] align-middle">
                  <StatusPill status={client.status} />
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-sm text-[var(--ink-soft)] align-middle">
                  {client.nextSession}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-sm text-[var(--ink-soft)] align-middle">
                  {client.sessions}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-sm text-[var(--ink-soft)] align-middle">
                  {client.tags.map((tag, j) => (
                    <span
                      key={j}
                      className="inline-block text-[11px] px-2 py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)] m-0.5 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-sm text-[var(--ink-soft)] align-middle">
                  {client.rate}
                </td>
                <td className="px-5 py-3.5 border-t border-[var(--border)] text-sm text-[var(--ink-soft)] align-middle">
                  {client.sessions !== '—' && client.sessions !== 'Intake' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteModalClient(client);
                      }}
                      className="px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]"
                    >
                      {t('clients.addNoteBtn')}
                    </button>
                  )}
                  {client.sessions === 'Intake' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/dashboard/session-prep');
                      }}
                      className="px-2.5 py-[5px] rounded-md text-xs font-medium border border-[var(--sage)] bg-transparent cursor-pointer text-[var(--sage)] transition-all duration-150 hover:bg-[var(--sage-pale)]"
                    >
                      {t('clients.prepIntakeBtn')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Shown on mobile only */}
      <div className="lg:hidden space-y-3">
        {filteredClients.map((client, i) => (
          <div
            key={i}
            onClick={() => setSelectedClient(client)}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${getAvatarColor(client.color)}`}>
                {client.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--ink)] text-base mb-1">{client.name}</div>
                <div className="text-xs text-[var(--ink-muted)] mb-2">{client.since}</div>
                <StatusPill status={client.status} />
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">{t('clients.mobileLabels.nextSession')}</span>
                <span className="text-[var(--ink)] font-medium">{client.nextSession}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">{t('clients.mobileLabels.progress')}</span>
                <span className="text-[var(--ink)]">{client.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-muted)]">{t('clients.mobileLabels.rate')}</span>
                <span className="text-[var(--ink)]">{client.rate}</span>
              </div>
            </div>

            {client.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-1.5">
                {client.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="inline-block text-[11px] px-2 py-0.5 rounded bg-[var(--sage-pale)] text-[var(--sage-deep)] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {client.sessions !== '—' && client.sessions !== 'Intake' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNoteModalClient(client as any);
                }}
                className="mt-3 w-full px-3 py-2 rounded-md text-sm font-medium border border-[var(--border)] bg-transparent cursor-pointer text-[var(--ink-soft)] transition-all duration-150 hover:bg-[var(--sage-pale)] hover:border-[var(--sage-light)] hover:text-[var(--sage-deep)]"
              >
                {t('clients.addNoteMobileBtn')}
              </button>
            )}
            {client.sessions === 'Intake' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/dashboard/session-prep');
                }}
                className="mt-3 w-full px-3 py-2 rounded-md text-sm font-medium border border-[var(--sage)] bg-transparent cursor-pointer text-[var(--sage)] transition-all duration-150 hover:bg-[var(--sage-pale)]"
              >
                {t('clients.prepIntakeMobileBtn')}
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedClient && <ClientDetailPanel client={selectedClient} onClose={() => setSelectedClient(null)} />}
      {noteModalClient && <NoteModal client={noteModalClient} onClose={() => setNoteModalClient(null)} />}
      {isNewClientModalOpen && (
        <NewClientModal 
          onClose={() => setIsNewClientModalOpen(false)} 
          onClientAdded={() => setRefreshKey(prev => prev + 1)} 
        />
      )}
    </>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-[20px] text-xs font-medium border border-[var(--border)] cursor-pointer transition-all duration-150 ${
        active
          ? 'bg-[var(--sage)] border-[var(--sage)] text-white'
          : 'bg-transparent text-[var(--ink-muted)] hover:bg-[var(--warm)]'
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: 'active' | 'waitlist' | 'inactive' }) {
  const { t } = useTranslation();
  const styles = {
    active: 'bg-[#e8f4f0] text-[var(--sage-deep)] before:bg-[var(--sage)]',
    waitlist: 'bg-[#fef3e2] text-[#7a4a00] before:bg-[var(--gold)]',
    inactive: 'bg-[var(--warm)] text-[var(--ink-muted)] before:bg-[var(--ink-muted)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-[5px] text-xs font-medium px-2.5 py-[3px] rounded-[20px] before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full ${styles[status]}`}
    >
      {t(`clients.filters.${status}`)}
    </span>
  );
}

function getAvatarColor(color: string) {
  if (color.startsWith('bg-')) return color;
  const colors: Record<string, string> = {
    'c-av-a': 'bg-[#d4e8e4] text-[var(--sage-deep)]',
    'c-av-b': 'bg-[#e8d4d4] text-[#7a3030]',
    'c-av-c': 'bg-[#d4d4e8] text-[#303070]',
    'c-av-d': 'bg-[#e8e4d4] text-[#5a4a10]',
    'c-av-e': 'bg-[#e4d4e8] text-[#5a1a6a]',
    'c-av-f': 'bg-[#d4e8d4] text-[#1a5a1a]',
  };
  return colors[color] || colors['c-av-a'];
}