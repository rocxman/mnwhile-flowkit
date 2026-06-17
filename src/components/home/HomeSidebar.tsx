import React from 'react';
import { Clock, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OpenFlowLogo } from '../icons/OpenFlowLogo';
import { SidebarFooter } from './SidebarFooter';
import { SidebarItem } from '../ui/SidebarItem';
import { APP_NAME } from '@/lib/brand';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type HomeSidebarTab = 'home' | 'templates' | 'settings' | 'mcp';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  tab?: HomeSidebarTab;
  testId: string;
  to?: string;
}

interface HomeSidebarProps {
  activeTab: HomeSidebarTab;
  onTabChange: (tab: HomeSidebarTab) => void;
}

export function HomeSidebar({
  activeTab,
  onTabChange,
}: HomeSidebarProps): React.ReactElement {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const localizedAppName = t('home.appName', APP_NAME);
  
  const navigationItems: NavigationItem[] = [
    {
      icon: <Clock className="w-4 h-4" />,
      label: t('nav.recents', 'Recents'),
      tab: 'home',
      testId: 'sidebar-home',
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: t('nav.settings', 'Settings'),
      tab: 'settings',
      testId: 'sidebar-settings',
    },
  ];

  return (
    <aside className="sticky top-0 z-20 flex w-full flex-col border-b border-[var(--color-brand-border)] bg-[var(--brand-surface)] md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--color-brand-border)] px-4">
        <div className="transition-transform duration-300 hover:scale-105">
          <OpenFlowLogo className="h-6 w-6 shrink-0 text-[var(--brand-primary)]" />
        </div>

        <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-[var(--brand-text)] font-outfit">
          {localizedAppName}
        </span>

        <div className="flex shrink-0 items-center justify-center rounded-full border border-lime-500/20 bg-lime-500/5 px-2 py-0.5 select-none transition-transform hover:scale-105 duration-200">
          <span className="text-[9px] font-mono font-bold uppercase leading-none tracking-[0.02em] text-lime-500">
            v1.0
          </span>
        </div>
      </div>

      {/* Workspace Switcher / Profile Box at Top */}
      {user ? (
        <div className="mx-3.5 my-3 flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-brand-border),transparent_40%)] bg-gradient-to-b from-white/[0.02] to-white/[0.005] dark:from-white/[0.03] dark:to-white/[0.01] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[color-mix(in_srgb,var(--color-brand-border),transparent_20%)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-500/20 to-lime-500/5 text-lime-400 font-semibold text-xs border border-lime-500/30 shadow-inner">
            {user.email?.[0].toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-xs font-semibold text-[var(--brand-text)] leading-none mb-1">
              {user.email?.split('@')[0]}
            </p>
            <p className="truncate text-[9px] text-[var(--brand-secondary)] leading-none">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--brand-text-muted)] hover:bg-white/5 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="mx-3.5 my-3 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-brand-border),transparent_40%)] bg-gradient-to-b from-white/[0.02] to-white/[0.005] dark:from-white/[0.03] dark:to-white/[0.01] text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <p className="text-[11px] font-medium text-[var(--brand-secondary)] mb-2.5 leading-relaxed">
            Sign in to sync your diagrams online.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="w-full py-2 px-3 rounded-lg bg-lime-500 text-slate-950 text-xs font-semibold hover:bg-lime-400 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(132,204,22,0.25)] active:scale-[0.98]"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Navigation items */}
      <div className="flex gap-2 overflow-x-auto p-3.5 md:block md:flex-1 md:space-y-5 md:overflow-y-auto">
        <div className="flex gap-2 md:block md:space-y-1">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.testId}
              icon={item.icon}
              isActive={item.tab ? activeTab === item.tab : false}
              onClick={item.tab ? () => onTabChange(item.tab) : undefined}
              to={item.to}
              testId={item.testId}
              className="min-w-fit md:min-w-0"
            >
              {item.label}
            </SidebarItem>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <SidebarFooter />
      </div>
    </aside>
  );
}
