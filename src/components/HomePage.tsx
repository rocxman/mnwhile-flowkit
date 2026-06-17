import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Plus, FolderOpen, PenTool, Palette, Tv, Sparkles, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  onLaunch: () => void;
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

  function handleTopbarTemplatesClick(): void {
    onLaunchWithTemplates();
    handleTabChange('templates');
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 flex min-w-0 flex-col bg-[var(--brand-surface)] md:ml-64"
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLaunch}
              className="flex items-center gap-1.5 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Design a New Canvas"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Design</span>
            </button>

            <button
              type="button"
              onClick={onLaunch}
              className="flex items-center gap-1.5 rounded-full bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Create a FigJam Flowchart"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>FigJam</span>
            </button>

            <button
              type="button"
              onClick={handleTopbarTemplatesClick}
              className="flex items-center gap-1.5 rounded-full bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/20 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Open Presentation Slides Templates"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Slides</span>
            </button>

            <button
              type="button"
              onClick={onLaunchWithAI}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/30 hover:to-purple-600/30 text-pink-400 border border-pink-500/30 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Generate Diagram with Flowpilot AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Flow</span>
            </button>

            <button
              type="button"
              onClick={onImportJSON}
              className="flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--brand-text)] border border-white/10 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Import JSON Schema"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            <div className="h-4 w-px bg-[var(--color-brand-border)] mx-1" />

            {/* Quick Plus Button */}
            <button
              type="button"
              onClick={onLaunch}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 shadow-md transition-all cursor-pointer hover:scale-[1.05] active:scale-[0.95]"
              title="Create New File"
              data-testid="home-create-new-main"
            >
              <Plus className="w-4 h-4" />
            </button>
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
