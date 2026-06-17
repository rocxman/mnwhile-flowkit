import React, { Suspense, lazy, useState, useEffect } from 'react';
import { FolderOpen, PenTool, Pencil, Palette, Tv, Sparkles, Upload, Megaphone, Globe, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type WorkspaceType } from '@/services/storage/persistenceTypes';
import { useFlowStore } from '../store';
import { useWorkspaceDocumentActions, useWorkspaceDocumentsState } from '@/store/documentHooks';
import { HomeDashboard, type HomeFlowCard } from './home/HomeDashboard';
import { HomeFlowDeleteDialog, HomeFlowRenameDialog } from './home/HomeFlowDialogs';
import { HomeSettingsView } from './home/HomeSettingsView';
import { HomeSidebar, type HomeSidebarTab } from './home/HomeSidebar';
import { HomeTemplatesView } from './home/HomeTemplatesView';
import { HomeCommunityView } from './home/HomeCommunityView';
import { shouldShowWelcomeModal } from './home/welcomeModalState';
import { useAuth } from '@/contexts/AuthContext';
import { cloudStorage } from '@/lib/cloud-storage';

type HomeSettingsTab = 'general' | 'canvas' | 'shortcuts' | 'ai' | 'mcp' | 'documentation';

const LazyWelcomeModal = lazy(async () => {
  const module = await import('./WelcomeModal');
  return { default: module.WelcomeModal };
});

interface HomePageProps {
  onLaunch: (name?: string, workspaceType?: WorkspaceType) => void;
  onLaunchWithTemplates: () => void;
  onLaunchWithTemplate: (templateId: string) => void;
  onLaunchWithAI: () => void;
  onImportJSON: () => void;
  onOpenFlow: (flowId: string) => void;
  activeTab?: HomeSidebarTab;
  onSwitchTab?: (tab: HomeSidebarTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLaunch,
  onLaunchWithTemplates,
  onLaunchWithTemplate,
  onLaunchWithAI,
  onImportJSON,
  onOpenFlow,
  activeTab: propActiveTab,
  onSwitchTab,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { documents } = useWorkspaceDocumentsState();
  const { renameDocument, deleteDocument, duplicateDocument } = useWorkspaceDocumentActions();
  const hasWorkspaceDocuments = useFlowStore((state) => state.documents.length > 0);
  
  // Lifted Dashboard state variables
  const [internalActiveTab, setInternalActiveTab] = useState<HomeSidebarTab>('home');
  const [activeSettingsTab, setActiveSettingsTab] = useState<HomeSettingsTab>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projectFilter, setProjectFilter] = useState<'all' | 'drafts' | 'trash'>('all');
  const [notifOpen, setNotifOpen] = useState(false);

  const [flowPendingRename, setFlowPendingRename] = useState<HomeFlowCard | null>(null);
  const [flowPendingDelete, setFlowPendingDelete] = useState<HomeFlowCard | null>(null);
  const [sharedFlows, setSharedFlows] = useState<HomeFlowCard[]>([]);
  const showWelcomeModal = shouldShowWelcomeModal();

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSharedFlows([]);
      return;
    }
    void (async () => {
      try {
        const shared = await cloudStorage.getSharedWithMe();
        setSharedFlows(
          shared.map((doc) => {
            const activePage = doc.pages?.find((p) => p.id === doc.active_page_id) ?? doc.pages?.[0];
            const nodes = (activePage?.content as { nodes?: unknown[] })?.nodes ?? [];
            const edges = (activePage?.content as { edges?: unknown[] })?.edges ?? [];
            return {
              id: doc.id,
              name: doc.name,
              nodeCount: nodes.length,
              edgeCount: edges.length,
              updatedAt: doc.updated_at,
              isActive: false,
              preview: null,
            } as HomeFlowCard;
          })
        );
      } catch (err) {
        console.error('Failed to load shared documents:', err);
      }
    })();
  }, [user]);

  const activeTab = propActiveTab ?? internalActiveTab;
  const flows: HomeFlowCard[] = hasWorkspaceDocuments ? documents : [];

  function handleTabChange(tab: HomeSidebarTab): void {
    if (onSwitchTab) {
      onSwitchTab(tab);
    } else {
      setInternalActiveTab(tab);
    }
  }

  function handleRenameFlow(flowId: string): void {
    const flow = flows.find((entry) => entry.id === flowId);
    if (!flow) return;
    setFlowPendingRename(flow);
  }

  function handleDeleteFlow(flowId: string): void {
    const flow = flows.find((entry) => entry.id === flowId);
    if (!flow) return;
    setFlowPendingDelete(flow);
  }

  function submitFlowRename(nextName: string): void {
    if (!flowPendingRename) return;

    const trimmedName = nextName.trim();
    if (!trimmedName || trimmedName === flowPendingRename.name) {
      setFlowPendingRename(null);
      return;
    }

    renameDocument(flowPendingRename.id, trimmedName);
    setFlowPendingRename(null);
  }

  function confirmFlowDelete(): void {
    if (!flowPendingDelete) return;

    deleteDocument(flowPendingDelete.id);
    setFlowPendingDelete(null);
  }

  function handleDuplicateFlow(flowId: string): void {
    const newFlowId = duplicateDocument(flowId);
    if (newFlowId) {
      onOpenFlow(newFlowId);
    }
  }

  function handleBuzzClick(): void {
    onLaunch('Untitled Buzz', 'buzz');
  }

  function handleSiteClick(): void {
    onLaunch('Untitled Site', 'site');
  }

  // Filter flows based on search query
  const filteredFlows = flows.filter((flow) =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSharedFlows = sharedFlows.filter((flow) =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex flex-col text-[var(--brand-text)] md:flex-row">
      <HomeSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onTemplatesClick={onLaunchWithTemplates}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 flex min-w-0 flex-col bg-[var(--brand-surface)] md:ml-72"
      >
        {/* Unified Figma-style Topbar Navbar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-brand-border)] bg-[var(--brand-surface)]/80 px-6 backdrop-blur-md">
          {/* Left side: Page Title */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <FolderOpen className="w-4 h-4 text-[var(--brand-secondary)] opacity-60 shrink-0" />
            <span className="text-[var(--brand-text)] font-semibold capitalize font-outfit">
              {activeTab === 'home'
                ? projectFilter === 'all'
                  ? t('nav.recents', 'Recents')
                  : projectFilter
                : activeTab === 'settings'
                ? 'Settings'
                : activeTab === 'templates'
                ? 'Templates'
                : activeTab}
            </span>
            {activeTab === 'settings' && (
              <>
                <span className="text-[var(--brand-text-muted)]">/</span>
                <span className="text-[var(--brand-text-muted)] capitalize">
                  {activeSettingsTab}
                </span>
              </>
            )}
          </div>

          {/* Right side: Figma-style Action Pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onLaunch('Untitled MnFlow', 'mnflow')}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Create a MnFlow Flowchart"
            >
              <Palette className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>MnFlow</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunch('Untitled Whiteboard', 'whiteboard')}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Create a Whiteboard for freeform drawing"
            >
              <Pencil className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>Whiteboard</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunch('Untitled Design', 'design')}
              data-testid="home-create-new-main"
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Design a New Canvas"
            >
              <PenTool className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Design</span>
            </button>
 
            <button
              type="button"
              onClick={() => onLaunch('Untitled Slides', 'slides')}
              data-testid="home-create-slides"
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Create a Slides Presentation"
            >
              <Tv className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>Slides</span>
            </button>
 
            <button
              type="button"
              onClick={onLaunchWithAI}
              data-testid="home-generate-with-ai"
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Generate Diagram with Flowpilot AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span>Make</span>
            </button>
 
            <button
              type="button"
              onClick={handleBuzzClick}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Create a Buzz space"
            >
              <Megaphone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Buzz</span>
            </button>
 
            <button
              type="button"
              onClick={handleSiteClick}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Publish Live Website"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Site</span>
            </button>

            <button
              type="button"
              onClick={onImportJSON}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Import JSON Schema"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>Import</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-[#1e1e1e] animate-pulse" />
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
                  <div className="absolute top-full right-0 z-40 mt-1.5 w-64 rounded-xl border border-slate-200 dark:border-[#2c2c2c] bg-white dark:bg-[#1e1e1e] p-3 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#8e8e8e] mb-2.5">Notifications</h4>
                    <div className="space-y-2.5">
                      <div className="rounded-lg bg-slate-50 dark:bg-[#2c2c2c] p-2 border border-slate-100 dark:border-transparent">
                        <p className="text-[10px] font-bold text-slate-800 dark:text-white mb-0.5">Welcome to MNWHILE FlowKit!</p>
                        <p className="text-[9px] text-slate-500 dark:text-[#8e8e8e] leading-relaxed">Start designing premium local-first diagrams now.</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-[#2c2c2c] p-2 border border-slate-100 dark:border-transparent opacity-80">
                        <p className="text-[10px] font-bold text-slate-800 dark:text-white mb-0.5">Vercel Deploy Successful</p>
                        <p className="text-[9px] text-slate-500 dark:text-[#8e8e8e] leading-relaxed">Your release is fully compiled and running.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'home' && (
          <HomeDashboard
            flows={filteredFlows}
            sharedFlows={filteredSharedFlows}
            onOpenFlow={onOpenFlow}
            onRenameFlow={handleRenameFlow}
            onDuplicateFlow={handleDuplicateFlow}
            onDeleteFlow={handleDeleteFlow}
            projectFilter={projectFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {activeTab === 'community' && (
          <HomeCommunityView onUseTemplate={onLaunchWithTemplate} />
        )}

        {activeTab === 'templates' && (
          <HomeTemplatesView onUseTemplate={onLaunchWithTemplate} />
        )}

        {activeTab === 'settings' && (
          <HomeSettingsView
            activeSettingsTab={activeSettingsTab}
            onSettingsTabChange={setActiveSettingsTab}
          />
        )}
      </main>

      <HomeFlowRenameDialog
        key={flowPendingRename?.id ?? 'rename-closed'}
        flowName={flowPendingRename?.name ?? ''}
        isOpen={flowPendingRename !== null}
        onClose={() => setFlowPendingRename(null)}
        onSubmit={submitFlowRename}
      />
      <HomeFlowDeleteDialog
        key={flowPendingDelete?.id ?? 'delete-closed'}
        flowName={flowPendingDelete?.name ?? ''}
        isOpen={flowPendingDelete !== null}
        onClose={() => setFlowPendingDelete(null)}
        onConfirm={confirmFlowDelete}
      />

      {showWelcomeModal ? (
        <Suspense fallback={null}>
          <LazyWelcomeModal
            onOpenTemplates={onLaunchWithTemplates}
            onPromptWithAI={onLaunchWithAI}
            onImport={onImportJSON}
            onBlankCanvas={onLaunch}
          />
        </Suspense>
      ) : null}
    </div>
  );
};
