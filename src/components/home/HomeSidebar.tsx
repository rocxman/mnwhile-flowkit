import React, { useState } from 'react';
import {
  Clock,
  Globe,
  Search,
  ChevronDown,
  FileText,
  Grid,
  Trash2,
  Folder,
  LogOut,
  LayoutTemplate,
  Layout,
  Sliders,
  Download,
  Compass,
  Bookmark,
  Plus,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export type HomeSidebarTab = 'home' | 'templates' | 'settings' | 'community';

interface HomeSidebarProps {
  activeTab: HomeSidebarTab;
  onTabChange: (tab: HomeSidebarTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  projectFilter: 'all' | 'drafts' | 'trash';
  onProjectFilterChange: (filter: 'all' | 'drafts' | 'trash') => void;
  onTemplatesClick?: () => void;
}

export function HomeSidebar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  onTemplatesClick,
}: HomeSidebarProps): React.ReactElement {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Collapsible states
  const [starredOpen, setStarredOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [themeSubmenuOpen, setThemeSubmenuOpen] = useState(false);

  // Username display
  const username = user?.email ? user.email.split('@')[0] : 'rocxman';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

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
    <aside className="sticky top-0 z-20 flex w-full flex-col border-b border-slate-200 dark:border-[#2c2c2c] bg-white dark:bg-[#1e1e1e] md:fixed md:inset-y-0 md:left-0 md:w-72 md:border-b-0 md:border-r md:border-slate-200 md:dark:border-[#2c2c2c]">
      
      {/* Top Header: MNWHILE FlowKit Logo & Brand */}
      <div className="relative flex h-14 items-center border-b border-slate-200 dark:border-[#2c2c2c] px-4">
        <div className="flex items-center gap-2">
          {/* MNWHILE FlowKit logo from assets */}
          <img src="/Logo_mnwhile-flowkit.svg" alt="MNWHILE FlowKit" className="h-6 w-6 shrink-0 select-none" />
          <span className="font-bold text-slate-800 dark:text-white text-[15px] tracking-tight font-outfit select-none">MNWHILE FlowKit</span>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="px-3.5 pt-3.5 pb-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 w-4.5 h-4.5 -translate-y-1/2 text-slate-400 dark:text-[#8e8e8e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 dark:border-transparent bg-slate-100 dark:bg-[#2c2c2c] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#8e8e8e] focus:outline-none focus:border-slate-300 dark:focus:border-[#3e3e3e] transition-all font-outfit"
          />
        </div>
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        
        {/* Section 1: Core Navigation */}
        <div className="px-3 py-3 space-y-1">
          <button
            type="button"
            onClick={() => selectTab('home')}
            className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'home' && projectFilter === 'all'
                ? 'bg-[#e8f2ff] dark:bg-[#3c496a] text-[#0c8ce9] dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="flex-1">{t('nav.recents', 'Recents')}</span>
          </button>

          <button
            type="button"
            onClick={() => selectTab('community')}
            className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'community'
                ? 'bg-[#e8f2ff] dark:bg-[#3c496a] text-[#0c8ce9] dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="flex-1">Community</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-[#2c2c2c] mx-3" />

        {/* Section 2: Team Section */}
        <div className="relative px-3 py-3 space-y-2.5">
          <button
            type="button"
            onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-[#2c2c2c] rounded-lg transition-colors text-left select-none cursor-pointer focus:outline-none animate-none"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0c8ce9] text-[11px] font-bold text-white uppercase select-none">
              {username[0]}
            </div>
            <span className="truncate font-semibold text-slate-800 dark:text-white text-sm">{username}{"'s team"}</span>
            <ChevronDown className={`ml-auto w-3.5 h-3.5 text-slate-400 dark:text-[#8e8e8e] shrink-0 transition-transform duration-200 ${teamDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Team Switcher Dropdown */}
          {teamDropdownOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30"
                onClick={() => setTeamDropdownOpen(false)}
                aria-label="Close team menu"
              />
              <div className="absolute top-12 left-3 z-40 mt-1 w-60 rounded-xl border border-slate-200 dark:border-[#2c2c2c] bg-white dark:bg-[#1e1e1e] p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                {/* Active Team Switcher Item */}
                <button
                  type="button"
                  onClick={() => setTeamDropdownOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-850 dark:text-white"
                >
                  <span className="text-[#0c8ce9] dark:text-[#33a3ff] shrink-0 font-bold w-3">✓</span>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0c8ce9] text-[11px] font-bold text-white uppercase select-none">
                    {username[0]}
                  </div>
                  <span className="truncate flex-1 font-semibold">{username}{"'s team"}</span>
                </button>

                {/* Divider */}
                <div className="my-1 border-t border-slate-200 dark:border-[#2c2c2c]" />

                {/* Create New Team Action */}
                <button
                  type="button"
                  onClick={() => setTeamDropdownOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-650 dark:text-[#e3e3e3]"
                >
                  <span className="text-slate-400 dark:text-[#8e8e8e] font-bold text-sm shrink-0 w-3 text-center">+</span>
                  <span>Create new</span>
                </button>
              </div>
            </>
          )}

          {/* Sub-items (always expanded under team switching header) - LEFT ALIGNED WITHOUT INDENTATION */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { onTabChange('home'); onProjectFilterChange('drafts'); }}
              className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'home' && projectFilter === 'drafts'
                  ? 'bg-slate-100 dark:bg-[#2c2c2c] text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e] group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              <span>Drafts</span>
            </button>

            <button
              type="button"
              onClick={() => { onTabChange('home'); onProjectFilterChange('all'); }}
              className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'home' && projectFilter === 'all' && activeTab === 'home'
                  ? 'bg-slate-100 dark:bg-[#2c2c2c] text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e] group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              <span>All projects</span>
            </button>

            <button
              type="button"
              data-testid="home-open-templates"
              onClick={() => { selectTab('templates'); onTemplatesClick?.(); }}
              className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'templates'
                  ? 'bg-slate-100 dark:bg-[#2c2c2c] text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutTemplate className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e] group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              <span>{t('nav.templates', 'Templates')}</span>
            </button>

            <button
              type="button"
              onClick={() => { onTabChange('home'); onProjectFilterChange('trash'); }}
              className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'home' && projectFilter === 'trash'
                  ? 'bg-slate-100 dark:bg-[#2c2c2c] text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trash2 className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e] group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              <span>Trash</span>
            </button>
          </div>


        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-[#2c2c2c] mx-3" />

        {/* Section 3: Collapsible Starred Section */}
        <div className="px-3 py-3 space-y-1.5">
          <button
            type="button"
            onClick={() => setStarredOpen(!starredOpen)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8e8e8e] hover:text-slate-600 dark:hover:text-white transition-colors text-left select-none cursor-pointer focus:outline-none"
          >
            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-[#8e8e8e] shrink-0 transition-transform ${starredOpen ? '' : '-rotate-90'}`} />
            <span>Starred</span>
          </button>

          {starredOpen && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="group flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-650 dark:text-[#e3e3e3] select-none">
                <Folder className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e]" />
                <span>Team project</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Profile — Bottom Left */}

      <div className="relative border-t border-slate-200 dark:border-[#2c2c2c] px-3 py-2.5 hidden md:block">
        <button
          type="button"
          data-testid="user-profile-button"
          onClick={() => {
            const nextState = !userDropdownOpen;
            setUserDropdownOpen(nextState);
            if (!nextState) {
              setThemeSubmenuOpen(false);
            }
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left select-none cursor-pointer focus:outline-none"
        >
          {/* Avatar */}
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="h-8 w-8 rounded-full object-cover shrink-0 shadow-sm" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-xs font-bold text-white uppercase select-none shadow-sm">
              {username[0]}
            </div>
          )}
          {/* Name + chevron */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white leading-tight">{username}</p>
            <p className="truncate text-[10px] text-slate-400 dark:text-[#8e8e8e] leading-tight mt-0.5">{user?.email ?? 'user@email.com'}</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-[#8e8e8e] shrink-0 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Upward-opening dropdown menu */}
        {userDropdownOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30"
              onClick={() => {
                setUserDropdownOpen(false);
                setThemeSubmenuOpen(false);
              }}
              aria-label="Close profile menu"
            />
            <div className="absolute bottom-full left-3 z-40 mb-2 w-64 rounded-2xl border border-slate-200 dark:border-[#2c2c2c] bg-white dark:bg-[#1e1e1e] p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 text-left">
              {/* Center-aligned user header */}
              <div className="flex flex-col items-center justify-center pt-5 pb-4 px-4 text-center">
                {/* Large avatar circle */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="h-14 w-14 rounded-full object-cover shadow-sm mb-2.5 border border-slate-200 dark:border-white/10"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-xl font-bold text-white uppercase select-none shadow-md mb-2.5">
                    {username[0]}
                  </div>
                )}
                {/* Username */}
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-full leading-tight">{username}</p>
                {/* Email */}
                <p className="text-[11px] text-slate-400 dark:text-[#8e8e8e] truncate max-w-full mt-1 leading-none">{user?.email ?? 'user@email.com'}</p>
              </div>

              <div className="border-t border-slate-200 dark:border-[#2c2c2c] my-1" />

              {/* Theme, Settings, Get Desktop App */}
              <div className="space-y-0.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeSubmenuOpen(!themeSubmenuOpen);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors text-left cursor-pointer ${
                      themeSubmenuOpen
                        ? 'bg-[#0c8ce9] text-white'
                        : 'text-slate-700 dark:text-[#e3e3e3] hover:bg-slate-100 dark:hover:bg-[#2c2c2c]'
                    }`}
                  >
                    <Layout className={`w-4 h-4 shrink-0 ${themeSubmenuOpen ? 'text-white' : 'text-slate-400 dark:text-[#8e8e8e]'}`} />
                    <span className="flex-1">Change theme</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${themeSubmenuOpen ? 'text-white' : 'text-slate-400 dark:text-[#8e8e8e]'}`} />
                  </button>

                  {themeSubmenuOpen && (
                    <div className="absolute left-full top-0 z-50 ml-2 w-48 rounded-xl border border-slate-200 dark:border-[#2c2c2c] bg-white dark:bg-[#1e1e1e] p-1.5 shadow-2xl animate-in fade-in slide-in-from-left-2 duration-150 text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme('light');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-700 dark:text-[#e3e3e3] cursor-pointer"
                      >
                        <span className="w-4 shrink-0 flex items-center justify-center">
                          {theme === 'light' && <Check className="w-3.5 h-3.5 text-slate-800 dark:text-white" />}
                        </span>
                        <span>Light</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme('dark');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-700 dark:text-[#e3e3e3] cursor-pointer"
                      >
                        <span className="w-4 shrink-0 flex items-center justify-center">
                          {theme === 'dark' && <Check className="w-3.5 h-3.5 text-slate-800 dark:text-white" />}
                        </span>
                        <span>Dark</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme('system');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-700 dark:text-[#e3e3e3] cursor-pointer"
                      >
                        <span className="w-4 shrink-0 flex items-center justify-center">
                          {theme === 'system' && <Check className="w-3.5 h-3.5 text-slate-800 dark:text-white" />}
                        </span>
                        <span>System theme</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  data-testid="sidebar-settings"
                  onClick={() => { setUserDropdownOpen(false); selectTab('settings'); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-700 dark:text-[#e3e3e3] cursor-pointer"
                >
                  <Sliders className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e]" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setUserDropdownOpen(false); window.open('https://mnwhile-flowkit.vercel.app', '_blank'); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-700 dark:text-[#e3e3e3] cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e]" />
                  <span>Get desktop app</span>
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-[#2c2c2c] my-1" />

              {/* Community section */}
              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8e8e8e]">Community</div>
                
                <button
                  type="button"
                  onClick={() => { setUserDropdownOpen(false); selectTab('community'); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-700 dark:text-[#e3e3e3] cursor-pointer"
                >
                  <Compass className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e]" />
                  <span>View Community profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setUserDropdownOpen(false); selectTab('community'); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold bg-[#0c8ce9] text-white transition-colors text-left cursor-pointer shadow-sm hover:bg-blue-500"
                >
                  <Bookmark className="w-4 h-4 shrink-0 text-white" />
                  <span>Saved from Community</span>
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-[#2c2c2c] my-1" />

              {/* Add Account & Log Out */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => { setUserDropdownOpen(false); navigate('/auth'); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-[#2c2c2c] transition-colors text-left text-slate-700 dark:text-[#e3e3e3] cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#8e8e8e]" />
                  <span>Add account</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-650 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
