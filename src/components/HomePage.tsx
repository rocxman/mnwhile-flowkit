import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Plus, Sparkles, LayoutTemplate, Upload, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFlowStore } from '../store';
import { useWorkspaceDocumentActions, useWorkspaceDocumentsState } from '@/store/documentHooks';
import { HomeDashboard, type HomeFlowCard } from './home/HomeDashboard';
import { HomeFlowDeleteDialog, HomeFlowRenameDialog } from './home/HomeFlowDialogs';
import { HomeMCPView } from './home/HomeMCPView';
import { HomeSettingsView } from './home/HomeSettingsView';
import { HomeSidebar } from './home/HomeSidebar';
import { HomeTemplatesView } from './home/HomeTemplatesView';
import { shouldShowWelcomeModal } from './home/welcomeModalState';
import { useAuth } from '@/contexts/AuthContext';
import { cloudStorage } from '@/lib/cloud-storage';

type HomePageTab = 'home' | 'templates' | 'settings' | 'mcp';
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
  activeTab?: HomePageTab;
  onSwitchTab?: (tab: HomePageTab) => void;
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
  const [internalActiveTab, setInternalActiveTab] = useState<HomePageTab>('home');
  const [activeSettingsTab, setActiveSettingsTab] = useState<HomeSettingsTab>('general');
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

  // Redirect legacy /mcp tab or handle internal redirect to Settings -> MCP
  useEffect(() => {
    if (activeTab === 'mcp') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSettingsTab('mcp');
      if (onSwitchTab) {
        onSwitchTab('settings');
      } else {
        setInternalActiveTab('settings');
      }
    }
  }, [activeTab, onSwitchTab]);

  function handleTabChange(tab: HomePageTab): void {
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
    if (!flow) {
      return;
    }

    setFlowPendingRename(flow);
  }

  function handleDeleteFlow(flowId: string): void {
    const flow = flows.find((entry) => entry.id === flowId);
    if (!flow) {
      return;
    }

    setFlowPendingDelete(flow);
  }

  function submitFlowRename(nextName: string): void {
    if (!flowPendingRename) {
      return;
    }

    const trimmedName = nextName.trim();
    if (!trimmedName || trimmedName === flowPendingRename.name) {
      setFlowPendingRename(null);
      return;
    }

    renameDocument(flowPendingRename.id, trimmedName);
    setFlowPendingRename(null);
  }

  function confirmFlowDelete(): void {
    if (!flowPendingDelete) {
      return;
    }

    deleteDocument(flowPendingDelete.id);
    setFlowPendingDelete(null);
  }

  function handleDuplicateFlow(flowId: string): void {
    const newFlowId = duplicateDocument(flowId);
    if (newFlowId) {
      onOpenFlow(newFlowId);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex flex-col text-[var(--brand-text)] md:flex-row">
      <HomeSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 flex min-w-0 flex-col bg-[var(--brand-surface)] md:ml-64"
      >
        {/* Unified Topbar Navbar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-brand-border)] bg-[var(--brand-surface)]/80 px-6 backdrop-blur-md">
          {/* Left side: Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <FolderOpen className="w-4 h-4 text-[var(--brand-secondary)] opacity-60 shrink-0" />
            <span className="text-[var(--brand-text)] font-semibold capitalize">
              {activeTab === 'home' ? t('nav.recents', 'Recents') : activeTab}
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

          {/* Right side: Quick Start Pills */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onLaunch}
              className="flex items-center gap-1.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-slate-950 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-[0_0_15px_rgba(132,204,22,0.25)] hover:scale-[1.02] active:scale-[0.98]"
              data-testid="home-create-new-main"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Canvas</span>
            </button>
            <button
              type="button"
              onClick={onLaunchWithAI}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              data-testid="home-generate-with-ai"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flowpilot AI</span>
            </button>
            <button
              type="button"
              onClick={handleTopbarTemplatesClick}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer border hover:scale-[1.02] active:scale-[0.98] ${
                activeTab === 'templates'
                  ? 'bg-white/10 text-white border-white/20 shadow-inner'
                  : 'bg-white/5 hover:bg-white/10 text-[var(--brand-text)] border-white/10'
              }`}
              data-testid="home-open-templates"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>
            <button
              type="button"
              onClick={onImportJSON}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--brand-text)] border border-white/10 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              data-testid="home-import-json"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          </div>
        </header>

        {activeTab === 'home' && (
          <HomeDashboard
            flows={flows}
            sharedFlows={sharedFlows}
            onOpenFlow={onOpenFlow}
            onRenameFlow={handleRenameFlow}
            onDuplicateFlow={handleDuplicateFlow}
            onDeleteFlow={handleDeleteFlow}
          />
        )}

        {activeTab === 'templates' && (
          <HomeTemplatesView onUseTemplate={onLaunchWithTemplate} />
        )}

        {activeTab === 'mcp' && <HomeMCPView />}

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
