import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Compass, 
  Users, 
  Clock, 
  ShieldAlert, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lock,
  Plus,
  Search,
  Calendar,
  X,
  BookOpen,
  MessageSquare,
  Image as ImageIcon,
  Home
} from 'lucide-react';
import { PersonaId, UserProfile, JournalSession, WallpaperId } from '../types';
import { PERSONAS } from '../lib/personas';
import { groupSessionsByTime } from '../lib/journalStorage';
import { formatDateSafe } from '../lib/sanitize';

export type NavTabId = 'sanctuary' | 'flashback' | 'duo' | 'timecapsule' | 'telemetry';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  persona: PersonaId;
  wallpaper?: WallpaperId;
  user: UserProfile | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  sessions?: JournalSession[];
  activeSessionId?: string | null;
  onNewReflection?: () => void;
  onSelectSession?: (session: JournalSession) => void;
  onGoHome?: () => void;
}

interface NavItemConfig {
  id: NavTabId;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  colorClass: string;
  glowClass: string;
  borderClass: string;
  activeBgClass: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'sanctuary',
    label: 'Sanctuary',
    subtitle: 'Private Reflections & AI',
    icon: Sparkles,
    colorClass: 'text-indigo-300',
    glowClass: 'shadow-[0_0_16px_rgba(129,140,248,0.6)] bg-indigo-400',
    borderClass: 'border-indigo-400/40',
    activeBgClass: 'from-indigo-500/20 via-purple-500/10 to-transparent'
  },
  {
    id: 'flashback',
    label: 'Flashbacks',
    subtitle: 'Perspective & Growth Shift',
    icon: Compass,
    colorClass: 'text-amber-300',
    glowClass: 'shadow-[0_0_16px_rgba(251,191,36,0.6)] bg-amber-400',
    borderClass: 'border-amber-400/40',
    activeBgClass: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  {
    id: 'duo',
    label: 'Squad Room',
    subtitle: '5-Member Live Shared Space',
    icon: Users,
    colorClass: 'text-emerald-300',
    glowClass: 'shadow-[0_0_16px_rgba(52,211,153,0.6)] bg-emerald-400',
    borderClass: 'border-emerald-400/40',
    activeBgClass: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  {
    id: 'timecapsule',
    label: 'Time Capsule',
    subtitle: 'Sealed Future Me Letters',
    icon: Clock,
    colorClass: 'text-pink-300',
    glowClass: 'shadow-[0_0_16px_rgba(244,114,182,0.6)] bg-pink-400',
    borderClass: 'border-pink-400/40',
    activeBgClass: 'from-pink-500/20 via-rose-500/10 to-transparent'
  },
  {
    id: 'telemetry',
    label: 'Telemetry',
    subtitle: 'Zero-Trust Audit & Metrics',
    icon: ShieldAlert,
    colorClass: 'text-cyan-300',
    glowClass: 'shadow-[0_0_16px_rgba(34,211,238,0.6)] bg-cyan-400',
    borderClass: 'border-cyan-400/40',
    activeBgClass: 'from-cyan-500/20 via-sky-500/10 to-transparent'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  persona,
  wallpaper,
  user: _user,
  isCollapsed = false,
  onToggleCollapse,
  sessions = [],
  activeSessionId,
  onNewReflection,
  onSelectSession,
  onGoHome
}) => {
  const activePersonaConfig = PERSONAS[persona] || PERSONAS.shayari;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Filter sessions based on search query and optional date filter
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // 1. Date filter check
      if (selectedDateFilter) {
        const sessionDate = session.dateKey || new Date(session.createdAt).toISOString().split('T')[0];
        if (sessionDate !== selectedDateFilter) {
          return false;
        }
      }

      // 2. Keyword search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const titleMatch = session.title?.toLowerCase().includes(q);
      const previewMatch = session.preview?.toLowerCase().includes(q);
      const moodMatch = session.moodBadge?.toLowerCase().includes(q);
      const tagsMatch = session.tags?.some((t) => t.toLowerCase().includes(q));
      const messageMatch = session.messages?.some((m) => m.text?.toLowerCase().includes(q));

      return titleMatch || previewMatch || moodMatch || tagsMatch || messageMatch;
    });
  }, [sessions, searchQuery, selectedDateFilter]);

  // Group chronologically into Today, Yesterday, Earlier this Month, and Previous Months
  const grouped = useMemo(() => {
    return groupSessionsByTime(filteredSessions);
  }, [filteredSessions]);

  const totalEntriesCount = sessions.length;

  return (
    <aside 
      id="aura-left-sidebar"
      aria-label="Aura Primary Navigation & Journal Archive"
      className={`hidden md:flex flex-col justify-between shrink-0 rounded-3xl backdrop-blur-2xl transition-all duration-300 select-none h-full min-h-0 overflow-hidden ${
        isCollapsed ? 'w-20 p-2.5' : 'w-72 lg:w-80 p-3.5'
      } ${
        wallpaper === 'cosmic_starlight'
          ? 'bg-[#090912]/50 border border-[rgba(167,139,250,0.25)] shadow-[0_8px_32px_rgba(99,102,241,0.25),0_0_24px_rgba(167,139,250,0.15)]'
          : 'bg-white/[0.08] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]'
      }`}
    >
      {/* Top Header & New Reflection Action Button */}
      <div className="space-y-3 shrink-0">
        {/* Header Title + Collapse Button */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1 pb-1 border-b border-white/10`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-200/90 font-semibold">
                Sanctuary Spaces
              </span>
            </div>
          ) : (
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse" />
          )}

          {onToggleCollapse && (
            <button
              id="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapse}
              className="p-1 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* 1. TOP ACTION BUTTON: Prominent "+ New Day's Reflection" */}
        {onNewReflection && (
          <div className="pt-0.5">
            {!isCollapsed ? (
              <button
                id="sidebar-new-reflection-btn"
                onClick={onNewReflection}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/35 via-purple-500/30 to-pink-500/25 hover:from-indigo-500/45 hover:via-purple-500/40 hover:to-pink-500/35 border border-indigo-400/40 hover:border-indigo-300/60 shadow-[0_4px_20px_rgba(99,102,241,0.25)] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] group cursor-pointer"
                title="Start a fresh, unburdened reflection session for today"
              >
                <div className="p-1 rounded-lg bg-white/20 group-hover:bg-white/30 group-hover:rotate-90 transition-all duration-300">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="tracking-wide">+ New Day's Reflection</span>
              </button>
            ) : (
              <button
                id="sidebar-new-reflection-collapsed-btn"
                onClick={onNewReflection}
                title="+ New Day's Reflection"
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500/35 to-purple-500/30 border border-indigo-400/40 hover:border-indigo-300/60 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-200" />
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs (Sanctuary, Flashbacks, Squad Room, Time Capsule, Telemetry) */}
        <nav className="space-y-1" aria-label="Main Spaces Navigation">
          {/* Quick Return to Welcome Screen (1st Screen) */}
          {onGoHome && (
            <button
              id="sidebar-go-home-btn"
              onClick={onGoHome}
              title="Return to Welcome Screen (1st Screen)"
              className={`w-full group flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-indigo-200/90 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/30 hover:border-indigo-300/50 transition-all cursor-pointer shadow-sm active:scale-95 mb-1.5 ${
                isCollapsed ? 'justify-center p-2' : ''
              }`}
            >
              <Home className="w-3.5 h-3.5 text-indigo-300 shrink-0 group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span>← Welcome Screen (1st Screen)</span>}
            </button>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-${item.id}-btn`}
                data-nav-id={`nav-${item.id}-btn`}
                onClick={() => setActiveTab(item.id)}
                title={`${item.label} — ${item.subtitle}`}
                className={`w-full group relative flex items-center gap-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                  isCollapsed ? 'justify-center p-2' : 'px-2.5 py-1.5'
                } ${
                  isActive
                    ? `bg-gradient-to-r ${item.activeBgClass} border ${item.borderClass} text-white font-medium shadow-md`
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                {/* Active Glow Indicator (Left Accent Pill) */}
                {isActive && (
                  <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full ${item.glowClass}`} 
                  />
                )}

                {/* Tab Icon Container */}
                <div 
                  className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-white/15 shadow-inner border border-white/20'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? item.colorClass : 'text-white/70 group-hover:text-white'}`} />
                </div>

                {/* Typography & Subtitles */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <span className={`w-1.5 h-1.5 rounded-full ${item.glowClass}`} />
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle Section: 2. INTERACTIVE SEARCH & 3. CHRONOLOGICAL DATED ENTRIES */}
      {!isCollapsed ? (
        <div className="flex-1 flex flex-col min-h-0 pt-3 border-t border-white/10 mt-3 overflow-hidden">
          {/* Section Header with Total Counter */}
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/60 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              <span>Journal History</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
              {filteredSessions.length} {filteredSessions.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Search Input Bar with Instant Filtering & Date Picker Icon */}
          <div className="space-y-1.5 mb-2.5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-white/40 pointer-events-none" />
              <input
                id="sidebar-journal-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries (e.g. SIH, hackathon, career)..."
                className="w-full pl-8 pr-16 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-400/60 focus:bg-black/50 transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-white/40 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {/* Date Picker Button */}
                <label 
                  className={`p-1 rounded hover:bg-white/10 cursor-pointer transition-colors ${
                    selectedDateFilter ? 'text-indigo-300 bg-white/10' : 'text-white/40 hover:text-white'
                  }`} 
                  title="Filter entries by specific calendar date"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={selectedDateFilter || ''}
                    onChange={(e) => setSelectedDateFilter(e.target.value || null)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Active Date Filter Chip (Dismissible) */}
            {selectedDateFilter && (
              <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-[10px] text-indigo-200">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Filtered: {formatDateSafe(selectedDateFilter)}</span>
                </span>
                <button
                  onClick={() => setSelectedDateFilter(null)}
                  className="hover:text-white ml-1 font-semibold"
                  title="Remove date filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Chronological Dated Entries List (Scrollable Container) */}
          <div 
            id="sidebar-journal-entries-list"
            className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-0"
          >
            {filteredSessions.length === 0 ? (
              <div className="py-8 px-2 text-center text-white/40 text-xs">
                <BookOpen className="w-6 h-6 mx-auto mb-2 opacity-30 text-indigo-300" />
                <p className="font-medium text-white/60">No matching entries</p>
                <p className="text-[10px] mt-1 text-white/40">
                  {searchQuery || selectedDateFilter
                    ? 'Try adjusting your search terms or clearing the date filter.'
                    : 'Click "+ New Day\'s Reflection" to create your first journal entry.'}
                </p>
                {(searchQuery || selectedDateFilter) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDateFilter(null);
                    }}
                    className="mt-2 text-[11px] text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* 1. Today Group */}
                {grouped.today.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
                        Today
                      </span>
                      <span className="text-[9px] text-white/40 font-mono">
                        {formatDateSafe(grouped.today[0].createdAt)}
                      </span>
                    </div>
                    {grouped.today.map((sess) => (
                      <JournalEntryCard
                        key={sess.id}
                        session={sess}
                        isActive={activeSessionId === sess.id}
                        onSelect={() => onSelectSession && onSelectSession(sess)}
                      />
                    ))}
                  </div>
                )}

                {/* 2. Yesterday Group */}
                {grouped.yesterday.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                        Yesterday
                      </span>
                      <span className="text-[9px] text-white/40 font-mono">
                        {formatDateSafe(grouped.yesterday[0].createdAt)}
                      </span>
                    </div>
                    {grouped.yesterday.map((sess) => (
                      <JournalEntryCard
                        key={sess.id}
                        session={sess}
                        isActive={activeSessionId === sess.id}
                        onSelect={() => onSelectSession && onSelectSession(sess)}
                      />
                    ))}
                  </div>
                )}

                {/* 3. Earlier this Month Group */}
                {grouped.earlierThisMonth.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/90 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                        Earlier this Month
                      </span>
                    </div>
                    {grouped.earlierThisMonth.map((sess) => (
                      <JournalEntryCard
                        key={sess.id}
                        session={sess}
                        isActive={activeSessionId === sess.id}
                        onSelect={() => onSelectSession && onSelectSession(sess)}
                      />
                    ))}
                  </div>
                )}

                {/* 4. Previous Months Group */}
                {grouped.previousMonths.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-pink-300/90 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400/80" />
                        Previous Months
                      </span>
                    </div>
                    {grouped.previousMonths.map((sess) => (
                      <JournalEntryCard
                        key={sess.id}
                        session={sess}
                        isActive={activeSessionId === sess.id}
                        onSelect={() => onSelectSession && onSelectSession(sess)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Middle Icon Indicator */
        <div className="my-auto flex flex-col items-center gap-2 py-4 border-y border-white/10">
          <div 
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
            title={`${totalEntriesCount} Saved Journal Reflections. Click to expand.`}
            onClick={onToggleCollapse}
          >
            <BookOpen className="w-4 h-4 text-indigo-300" />
          </div>
          <span className="text-[9px] font-mono text-white/40">{totalEntriesCount}</span>
        </div>
      )}

      {/* Sidebar Footer: Active Persona Badge & Zero-Trust Shield */}
      <div className="pt-2.5 border-t border-white/10 space-y-2 shrink-0">
        {!isCollapsed ? (
          <>
            {/* Active Persona Mini Card */}
            <div className="p-2 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-indigo-300/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Persona</span>
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {activePersonaConfig.name}
                </div>
              </div>
              <span className="text-sm shrink-0">{activePersonaConfig.badge.split(' ')[0]}</span>
            </div>

            {/* Zero-Trust Compliance Seal */}
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/20 border border-white/5 text-[10px] text-white/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px]">Zero-Trust Vault</span>
              </div>
              <span className="font-mono text-emerald-400/90 text-[9px]">ISOLATED</span>
            </div>
          </>
        ) : (
          <div 
            className="flex justify-center p-2 rounded-xl text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer" 
            title="Zero-Trust Architecture: User-Bound AES-GCM Encrypted Vault"
          >
            <Lock className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};

/**
 * Interactive Journal Entry Card Component
 */
const JournalEntryCard: React.FC<{
  session: JournalSession;
  isActive: boolean;
  onSelect: () => void;
}> = ({ session, isActive, onSelect }) => {
  const personaConfig = PERSONAS[session.personaId] || PERSONAS.shayari;
  const messagesCount = session.messages?.length || 0;
  const momentsCount = session.moments?.length || 0;

  return (
    <div
      id={`journal-card-${session.id}`}
      onClick={onSelect}
      className={`group relative p-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
        isActive
          ? 'bg-white/[0.14] border-indigo-400/60 shadow-[0_4px_16px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/40'
          : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-white/20'
      }`}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-400 rounded-r-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
      )}

      {/* Top Row: Date & Mood Badge */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] text-white/50 font-mono flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-white/40" />
          <span>{formatDateSafe(session.createdAt)}</span>
        </span>

        {session.moodBadge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 font-medium">
            {session.moodBadge}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className={`text-xs font-semibold tracking-tight line-clamp-1 transition-colors ${
        isActive ? 'text-white' : 'text-white/90 group-hover:text-white'
      }`}>
        {session.title}
      </h4>

      {/* Evocative Preview Snippet */}
      {session.preview && (
        <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5 italic group-hover:text-white/70 transition-colors">
          "{session.preview}"
        </p>
      )}

      {/* Bottom Footer: Persona Tag & Counts */}
      <div className="mt-2 flex items-center justify-between text-[9px] text-white/50 pt-1.5 border-t border-white/5">
        {/* Persona Tag */}
        <span className="flex items-center gap-1 text-indigo-300 font-medium truncate max-w-[140px]">
          <span>{personaConfig.avatarIcon}</span>
          <span className="truncate">{personaConfig.name}</span>
        </span>

        {/* Counters */}
        <div className="flex items-center gap-2 shrink-0">
          {momentsCount > 0 && (
            <span className="flex items-center gap-0.5 text-cyan-300 font-mono" title={`${momentsCount} polaroid photo moment(s)`}>
              <ImageIcon className="w-2.5 h-2.5" />
              <span>{momentsCount}</span>
            </span>
          )}
          <span className="flex items-center gap-0.5 font-mono text-white/40" title={`${messagesCount} messages`}>
            <MessageSquare className="w-2.5 h-2.5" />
            <span>{messagesCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile Bottom Navigation Dock
 */
export const MobileBottomNav: React.FC<{
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  onGoHome?: () => void;
}> = ({ activeTab, setActiveTab, onGoHome }) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-3 inset-x-3 z-40 backdrop-blur-2xl bg-black/85 border border-white/20 rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-around"
    >
      {onGoHome && (
        <button
          id="mobile-nav-home-btn"
          onClick={onGoHome}
          className="flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer text-indigo-300 hover:text-white"
          title="Return to Welcome Screen (1st Screen)"
        >
          <Home className="w-4 h-4 text-indigo-300" />
          <span className="text-[10px] tracking-tight">1st Screen</span>
        </button>
      )}

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}-btn`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'bg-white/15 text-white font-medium shadow-sm border border-white/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? item.colorClass : 'text-white/70'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
