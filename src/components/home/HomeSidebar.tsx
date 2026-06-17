import React, { useState } from 'react';
import {
  Clock,
  Settings,
  Globe,
  LayoutTemplate,
  Search,
  ChevronDown,
  Bell,
  FileText,
  Grid,
  HelpCircle,
  Trash2,
  Folder,
  ArrowUpRight,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarFooter } from './SidebarFooter';

export type HomeSidebarTab = 'home' | 'templates' | 'settings' | 'community';

interface HomeSidebarProps {
  activeTab: HomeSidebarTab;
  onTabChange: (tab: HomeSidebarTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  projectFilter: 'all' | 'drafts' | 'trash';
  onProjectFilterChange: (filter: 'all' | 'drafts' | 'trash') => void;
}

export function HomeSidebar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
}: HomeSidebarProps): React.ReactElement {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Collapsible states
  const [teamOpen, setTeamOpen] = useState(true);
  const [starredOpen, setStarredOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Username display
  const username = user?.email ? user.email.split('@')[0] : 'rocxman';

  function handleLogoutClick(): void {
    setUserDropdownOpen(false);
    void logout();
  }

  function selectTab(tab: HomeSidebarTab): void {
    onTabChange(tab);
    // If selecting setting or templates or community, reset project filter to default 'all'
    if (tab !== 'home') {
      onProjectFilterChange('all');
    }
  }

  return (
    <aside className="sticky top-0 z-20 flex w-full flex-col border-b border-[var(--color-brand-border)] bg-[var(--brand-surface)] md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      
      {/* Top Header: Figma-style Profile Dropdown + Notif Bell */}
      <div className="relative flex h-14 items-center justify-between border-b border-[var(--color-brand-border)] px-4">
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-sm font-bold text-[var(--brand-text)] hover:bg-white/5 transition-all text-left w-full cursor-pointer focus:outline-none"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
              {username[0].toUpperCase()}
            </div>
            <span className="truncate flex-1 font-outfit text-xs">{username}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--brand-secondary)] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {userDropdownOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30"
                onClick={() => setUserDropdownOpen(false)}
                aria-label="Close user menu"
              />
              <div className="absolute top-full left-2 z-40 mt-1 w-52 rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-1 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2 border-b border-[var(--color-brand-border)] text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text-muted)]">Signed in as</p>
                  <p className="truncate text-xs font-semibold text-[var(--brand-text)]">{user?.email ?? 'local-guest@mnwhile.dev'}</p>
                </div>
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left mt-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setUserDropdownOpen(false); navigate('/auth'); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-lime-400 hover:bg-lime-500/10 transition-colors text-left mt-1 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In to Sync</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--brand-text-muted)] hover:bg-white/5 hover:text-white transition-colors cursor-pointer focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[var(--brand-surface)] animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30"
                onClick={() => setNotifOpen(false)}
                aria-label="Close notification menu"
              />
              <div className="absolute top-full right-0 z-40 mt-1 w-64 rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-3 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-text-muted)] mb-2.5">Notifications</h4>
                <div className="space-y-2.5">
                  <div className="rounded-lg bg-white/5 p-2 border border-white/5">
                    <p className="text-[10px] font-semibold text-[var(--brand-text)] mb-0.5">Welcome to MNWHILE FlowKit!</p>
                    <p className="text-[9px] text-[var(--brand-secondary)] leading-relaxed">Start designing premium local-first diagrams now.</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 border border-white/5 opacity-80">
                    <p className="text-[10px] font-semibold text-[var(--brand-text)] mb-0.5">Vercel Deploy Successful</p>
                    <p className="text-[9px] text-[var(--brand-secondary)] leading-relaxed">Your release is fully compiled and running.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="px-3.5 pt-3.5 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-[var(--brand-text-muted)] opacity-60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--color-brand-border)] bg-black/15 dark:bg-black/20 text-xs text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] shadow-inner focus:outline-none focus:border-lime-500/30 transition-all font-outfit"
          />
        </div>
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-4 no-scrollbar">
        
        {/* Section 1: Core Navigation */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => selectTab('home')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'home' && projectFilter === 'all'
                ? 'bg-white/10 text-white shadow-inner font-bold'
                : 'text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1">{t('nav.recents', 'Recents')}</span>
          </button>

          <button
            type="button"
            onClick={() => selectTab('community')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'community'
                ? 'bg-white/10 text-white shadow-inner font-bold'
                : 'text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1">Community</span>
          </button>

          <button
            type="button"
            onClick={() => selectTab('templates')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'templates'
                ? 'bg-white/10 text-white shadow-inner font-bold'
                : 'text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1">Templates</span>
          </button>

          <button
            type="button"
            onClick={() => selectTab('settings')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'settings'
                ? 'bg-white/10 text-white shadow-inner font-bold'
                : 'text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1">{t('nav.settings', 'Settings')}</span>
          </button>
        </div>

        {/* Section 2: Collapsible Team List */}
        <div>
          <button
            type="button"
            onClick={() => setTeamOpen(!teamOpen)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text-muted)] hover:text-white transition-colors text-left select-none cursor-pointer focus:outline-none"
          >
            <ChevronDown className={`w-3 h-3 text-[var(--brand-text-muted)] shrink-0 transition-transform ${teamOpen ? '' : '-rotate-90'}`} />
            <span className="truncate flex-1">{username}{"'s team"}</span>
            <div className="flex shrink-0 items-center gap-1">
              <span className="rounded-md border border-white/10 bg-white/5 px-1 py-0.2 text-[8px] text-[var(--brand-secondary)]">Free</span>
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white shadow">1</div>
            </div>
          </button>

          {teamOpen && (
            <div className="mt-1 pl-4 space-y-0.5 border-l border-white/5 ml-4.5 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => { onTabChange('home'); onProjectFilterChange('drafts'); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer text-left ${
                  activeTab === 'home' && projectFilter === 'drafts'
                    ? 'bg-white/10 text-white'
                    : 'text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-amber-500/80" />
                <span>Drafts</span>
              </button>

              <button
                type="button"
                onClick={() => { onTabChange('home'); onProjectFilterChange('all'); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer text-left ${
                  activeTab === 'home' && projectFilter === 'all' && activeTab === 'home'
                    ? 'bg-white/10 text-white'
                    : 'text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5 shrink-0 text-blue-500/80" />
                <span>All projects</span>
              </button>

              <button
                type="button"
                onClick={() => selectTab('templates')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white transition-all cursor-pointer text-left"
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-teal-500/80" />
                <span>Resources</span>
              </button>

              <button
                type="button"
                onClick={() => { onTabChange('home'); onProjectFilterChange('trash'); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer text-left ${
                  activeTab === 'home' && projectFilter === 'trash'
                    ? 'bg-white/10 text-white'
                    : 'text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0 text-red-500/80" />
                <span>Trash</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Collapsible Starred Section */}
        <div>
          <button
            type="button"
            onClick={() => setStarredOpen(!starredOpen)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text-muted)] hover:text-white transition-colors text-left select-none cursor-pointer focus:outline-none"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--brand-text-muted)] shrink-0 transition-transform ${starredOpen ? '' : '-rotate-90'}`} />
            <span>Starred</span>
          </button>

          {starredOpen && (
            <div className="mt-1 pl-4 space-y-0.5 border-l border-white/5 ml-4.5 animate-in fade-in duration-200">
              <div className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--brand-secondary)] select-none">
                <Folder className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span>team project</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Interactive Usage banner */}
        <div className="px-2 pt-2">
          <a
            href="#/home"
            onClick={(e) => { e.preventDefault(); selectTab('settings'); }}
            className="group flex flex-col rounded-xl border border-[var(--color-brand-border)] bg-white/[0.02] p-3 text-left shadow-sm transition-all hover:bg-white/[0.04] hover:border-white/10"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-[var(--brand-text)] group-hover:text-lime-400 transition-colors">{"See what's included"}</span>
              <ChevronRight className="w-3 h-3 text-[var(--brand-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[9px] text-[var(--brand-secondary)] leading-relaxed">
              Your plan and usage details. Toggle canvas constraints and MCP features.
            </p>
          </a>
        </div>
      </div>

      {/* Bottom Upgrade Promo Card */}
      <div className="px-4 py-2 border-t border-[var(--color-brand-border)]">
        <div className="rounded-xl bg-gradient-to-b from-indigo-950/20 to-transparent border border-indigo-500/20 p-3 shadow-md text-left">
          <p className="text-[10px] font-bold text-[var(--brand-text)] mb-1">Upgrade for more features</p>
          <p className="text-[9px] text-[var(--brand-secondary)] leading-normal mb-3">
            Ready to go beyond this free plan? Upgrade for premium real-time collaboration.
          </p>
          <a
            href="https://mnwhile-flowkit.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 px-3 text-[10px] font-bold shadow-sm transition-all cursor-pointer hover:shadow-[0_0_12px_rgba(79,70,229,0.3)] active:scale-[0.98]"
          >
            <span>View plans</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Footer with language/theme toggle */}
      <div className="hidden md:block">
        <SidebarFooter />
      </div>
    </aside>
  );
}
