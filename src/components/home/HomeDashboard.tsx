import React, { useState, useMemo } from 'react';
import {
  Copy,
  Layout,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  LogIn,
  Cloud,
  List,
  ChevronDown,
  Check,
  Undo,
  FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip } from '../Tooltip';
import type { WorkspaceDocumentPreview } from '@/store/workspaceDocumentModel';

const AUTOSAVED_LABEL = 'Autosaved';

export interface HomeFlowCard {
  id: string;
  name: string;
  nodeCount: number;
  edgeCount: number;
  updatedAt?: string;
  isActive?: boolean;
  preview: WorkspaceDocumentPreview | null;
}

interface HomeDashboardProps {
  flows: HomeFlowCard[];
  sharedFlows?: HomeFlowCard[];
  onOpenFlow: (flowId: string) => void;
  onRenameFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
  projectFilter: 'all' | 'drafts' | 'trash';
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const INITIAL_TRASH_ITEMS: HomeFlowCard[] = [
  {
    id: 'trash-1',
    name: 'Legacy Microservice Architecture Diagram',
    nodeCount: 14,
    edgeCount: 19,
    updatedAt: '2026-06-10T12:00:00.000Z',
    preview: null,
  },
  {
    id: 'trash-2',
    name: 'Temp Wireframe flowchart',
    nodeCount: 5,
    edgeCount: 4,
    updatedAt: '2026-06-14T08:30:00.000Z',
    preview: null,
  },
];

export function HomeDashboard({
  flows,
  sharedFlows = [],
  onOpenFlow,
  onRenameFlow,
  onDuplicateFlow,
  onDeleteFlow,
  projectFilter,
  viewMode,
  onViewModeChange,
}: HomeDashboardProps): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Navigation Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'recents' | 'shared' | 'projects'>('recents');

  // Interactive Dropdown states
  const [orgOpen, setOrgOpen] = useState(false);
  const [fileTypeOpen, setFileTypeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Dropdown filter selections
  const [orgFilter, setOrgFilter] = useState('All organizations');
  const [fileTypeFilter, setFileTypeFilter] = useState('All files');
  const [sortBy, setSortBy] = useState<'lastViewed' | 'nameAsc' | 'nameDesc'>('lastViewed');

  // Mock Trash Items
  const [trashItems, setTrashItems] = useState<HomeFlowCard[]>(INITIAL_TRASH_ITEMS);

  // Apply sorting and ownership filters
  const processedFlows = useMemo(() => {
    const list = [...flows];

    // Ownership filtering
    if (fileTypeFilter === 'Owned by me') {
      // For local-first, drafts/local belong to user
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
      if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
      const timeA = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const timeB = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return timeB - timeA;
    });

    return list;
  }, [flows, fileTypeFilter, sortBy]);

  const processedSharedFlows = useMemo(() => {
    const list = [...sharedFlows];
    list.sort((a, b) => {
      if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
      if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
      const timeA = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const timeB = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return timeB - timeA;
    });
    return list;
  }, [sharedFlows, sortBy]);

  // Restore trash item trigger
  function handleRestoreTrashItem(item: HomeFlowCard): void {
    setTrashItems(trashItems.filter((t) => t.id !== item.id));
    // Simulate recovery by launching it as a new canvas
    onOpenFlow(item.id);
  }

  // Perm delete trash item trigger
  function handlePermanentlyDeleteTrashItem(itemId: string): void {
    setTrashItems(trashItems.filter((t) => t.id !== itemId));
  }


  // Dropdown options
  const orgOptions = ['All organizations', 'Personal', 'Work Team'];
  const fileTypeOptions = ['All files', 'Owned by me', 'Shared with me'];
  const sortOptions = [
    { key: 'lastViewed', label: 'Last viewed' },
    { key: 'nameAsc', label: 'Alphabetical A-Z' },
    { key: 'nameDesc', label: 'Alphabetical Z-A' },
  ];

  const currentSortLabel = sortOptions.find((o) => o.key === sortBy)?.label ?? 'Last viewed';

  // Renders the file previews
  const hasFlows = processedFlows.length > 0;
  const hasSharedFlows = processedSharedFlows.length > 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10 md:py-8 animate-in fade-in duration-300">
      
      {/* Sub-navigation Menu & Grid Filters Toolbar */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-brand-border)] pb-3 mb-6 md:flex-row md:items-center md:justify-between">
        
        {/* Left Side: Sub Tabs */}
        {projectFilter === 'all' ? (
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => setActiveSubTab('recents')}
              className={`relative pb-3 text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === 'recents'
                  ? 'text-[var(--brand-text)]'
                  : 'text-[var(--brand-secondary)] hover:text-[var(--brand-text)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Recently viewed</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold leading-none ${
                  activeSubTab === 'recents'
                    ? 'bg-lime-500/10 text-lime-500 border border-lime-500/20'
                    : 'bg-white/5 text-[var(--brand-secondary)] border border-white/5'
                }`}>
                  {flows.length}
                </span>
              </div>
              {activeSubTab === 'recents' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lime-500 rounded-full animate-in fade-in" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('shared')}
              className={`relative pb-3 text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === 'shared'
                  ? 'text-[var(--brand-text)]'
                  : 'text-[var(--brand-secondary)] hover:text-[var(--brand-text)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Shared files</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold leading-none ${
                  activeSubTab === 'shared'
                    ? 'bg-lime-500/10 text-lime-500 border border-lime-500/20'
                    : 'bg-white/5 text-[var(--brand-secondary)] border border-white/5'
                }`}>
                  {sharedFlows.length}
                </span>
              </div>
              {activeSubTab === 'shared' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lime-500 rounded-full animate-in fade-in" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('projects')}
              className={`relative pb-3 text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                activeSubTab === 'projects'
                  ? 'text-[var(--brand-text)]'
                  : 'text-[var(--brand-secondary)] hover:text-[var(--brand-text)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Shared projects</span>
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold leading-none bg-white/5 text-[var(--brand-secondary)] border border-white/5">
                  0
                </span>
              </div>
              {activeSubTab === 'projects' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lime-500 rounded-full animate-in fade-in" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pb-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-lime-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] capitalize">
              Viewing folder: <span className="text-lime-400">{projectFilter}</span>
            </h2>
          </div>
        )}

        {/* Right Side: Figma Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Org Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setOrgOpen(!orgOpen); setFileTypeOpen(false); setSortOpen(false); }}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] bg-black/10 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--brand-secondary)] hover:text-white transition-all cursor-pointer"
            >
              <span>{orgFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {orgOpen && (
              <>
                <button type="button" className="fixed inset-0 z-30" onClick={() => setOrgOpen(false)} />
                <div className="absolute right-0 z-40 mt-1 w-44 rounded-lg border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                  {orgOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setOrgFilter(opt); setOrgOpen(false); }}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white text-left cursor-pointer"
                    >
                      <span>{opt}</span>
                      {orgFilter === opt && <Check className="w-3 h-3 text-lime-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* File Type Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setFileTypeOpen(!fileTypeOpen); setOrgOpen(false); setSortOpen(false); }}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] bg-black/10 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--brand-secondary)] hover:text-white transition-all cursor-pointer"
            >
              <span>{fileTypeFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {fileTypeOpen && (
              <>
                <button type="button" className="fixed inset-0 z-30" onClick={() => setFileTypeOpen(false)} />
                <div className="absolute right-0 z-40 mt-1 w-44 rounded-lg border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                  {fileTypeOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFileTypeFilter(opt); setFileTypeOpen(false); }}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white text-left cursor-pointer"
                    >
                      <span>{opt}</span>
                      {fileTypeFilter === opt && <Check className="w-3 h-3 text-lime-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sorting Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setSortOpen(!sortOpen); setOrgOpen(false); setFileTypeOpen(false); }}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] bg-black/10 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--brand-secondary)] hover:text-white transition-all cursor-pointer"
            >
              <span>{currentSortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {sortOpen && (
              <>
                <button type="button" className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 z-40 mt-1 w-44 rounded-lg border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key as typeof sortBy); setSortOpen(false); }}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] text-[var(--brand-secondary)] hover:bg-white/5 hover:text-white text-left cursor-pointer"
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.key && <Check className="w-3 h-3 text-lime-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-[var(--color-brand-border)] mx-1" />

          {/* Grid/List View Mode Toggles */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-brand-border)] bg-black/10 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex h-6 w-6 items-center justify-center rounded transition-all cursor-pointer focus:outline-none ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-[var(--brand-secondary)] hover:text-white'
              }`}
              title="Grid View"
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`flex h-6 w-6 items-center justify-center rounded transition-all cursor-pointer focus:outline-none ${
                viewMode === 'list'
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-[var(--brand-secondary)] hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Areas based on Sidebar filter selection */}
      {projectFilter === 'trash' ? (
        <section className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[11px] font-bold text-[var(--brand-secondary)] uppercase tracking-wider">
              Trash Bin (Deleted Files)
            </h2>
            <span className="text-xs text-[var(--brand-secondary)]">
              {trashItems.length} items
            </span>
          </div>

          {trashItems.length === 0 ? (
            <div className="flex flex-col py-16 items-center justify-center text-center border border-dashed border-white/5 rounded-2xl max-w-xl mx-auto my-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[var(--brand-secondary)] mb-4">
                <Trash2 className="w-5 h-5 opacity-40" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-1">Trash is empty</h3>
              <p className="text-xs text-[var(--brand-secondary)] max-w-xs leading-relaxed">
                Files you delete will appear here and can be recovered within 30 days.
              </p>
            </div>
          ) : (
            <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden bg-[var(--brand-surface)] shadow-md">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] bg-black/15 text-[var(--brand-secondary)] font-bold">
                    <th className="p-3 pl-4">Name</th>
                    <th className="p-3">Deleted Date</th>
                    <th className="p-3">Canvas Elements</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trashItems.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--color-brand-border)]/40 hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 pl-4 font-semibold text-[var(--brand-text)] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500 opacity-70" />
                        <span>{item.name}</span>
                      </td>
                      <td className="p-3 text-[var(--brand-secondary)]">
                        {formatUpdatedAt(item.updatedAt)}
                      </td>
                      <td className="p-3 text-[var(--brand-secondary)]">
                        {item.nodeCount} nodes, {item.edgeCount} edges
                      </td>
                      <td className="p-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestoreTrashItem(item)}
                            className="inline-flex items-center gap-1 py-1 px-2.5 rounded bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 text-[10px] font-bold border border-lime-500/20 transition-all cursor-pointer"
                          >
                            <Undo className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentlyDeleteTrashItem(item.id)}
                            className="inline-flex items-center gap-1 py-1 px-2.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : activeSubTab === 'recents' ? (
        <section className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-bold text-[var(--brand-secondary)] uppercase tracking-wider">
                {projectFilter === 'drafts' ? 'Draft files' : t('home.recentFiles', 'Recent Files')}
              </h2>
              <Tooltip
                text={t(
                  'home.localStorageHint',
                  'Autosaved on this device. We do not upload your diagram data to our servers.'
                )}
                side="right"
              >
                <div className="flex cursor-default items-center justify-center text-[var(--brand-primary)] hover:brightness-110 transition-all duration-200">
                  <ShieldCheck
                    className="w-[13px] h-[13px]"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth={1.5}
                  />
                </div>
              </Tooltip>
            </div>
            {hasFlows && (
              <span className="text-xs text-[var(--brand-secondary)]">
                {processedFlows.length} {t('home.files', 'files')}
              </span>
            )}
          </div>

          {!hasFlows ? (
            <div
              className="flex w-full flex-col py-12 items-center justify-center rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-white/[0.01] text-center max-w-xl mx-auto my-6 animate-in fade-in duration-500"
              data-testid="home-empty-state"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-surface)] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_60%)] text-[var(--brand-secondary)] mb-4">
                <Layout className="w-5 h-5 opacity-60" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-1">
                No recent files yet
              </h3>
              <p className="text-xs text-[var(--brand-secondary)] max-w-xs leading-relaxed">
                Create a new blank canvas, generate with AI, or import an existing file. Your work will automatically save here.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {processedFlows.map((flow) => (
                <div
                  key={flow.id}
                  onClick={() => onOpenFlow(flow.id)}
                  className="group relative cursor-pointer flex flex-col overflow-hidden rounded-[16px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-surface)] transition-all duration-300 hover:border-[var(--brand-primary-400)]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                >
                  <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden border-b border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-background)]">
                    <FlowPreview preview={flow.preview} />

                    {/* Floating Actions Menu */}
                    <div className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-full border border-[color-mix(in_srgb,var(--color-brand-border),white_10%)] bg-[var(--brand-surface)]/80 backdrop-blur-md p-1 opacity-0 transform translate-y-[-4px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 shadow-lg">
                      <FlowCardActionButton
                        label={t('common.rename', 'Rename')}
                        onClick={() => onRenameFlow(flow.id)}
                        hoverClassName="hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
                      >
                        <Pencil className="h-3 w-3" />
                      </FlowCardActionButton>
                      <FlowCardActionButton
                        label={t('common.duplicate', 'Duplicate')}
                        onClick={() => onDuplicateFlow(flow.id)}
                        hoverClassName="hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
                      >
                        <Copy className="h-3 w-3" />
                      </FlowCardActionButton>
                      <div className="h-3 w-[1px] bg-[var(--color-brand-border)] mx-0.5"></div>
                      <FlowCardActionButton
                        label={t('common.delete', 'Delete')}
                        onClick={() => onDeleteFlow(flow.id)}
                        hoverClassName="hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </FlowCardActionButton>
                    </div>
                  </div>
                  <div className="flex flex-col p-4 bg-[var(--brand-surface)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--brand-surface),white_2%)]">
                    <h3 className="font-semibold text-[13.5px] text-[var(--brand-text)] tracking-tight truncate mb-1.5 group-hover:text-[var(--brand-primary)] transition-colors text-left">
                      {flow.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--brand-secondary)]">
                      <span>{formatUpdatedAt(flow.updatedAt)}</span>
                      <div className="h-[3px] w-[3px] rounded-full bg-[color-mix(in_srgb,var(--brand-secondary),transparent_50%)]"></div>
                      <span>
                        {flow.nodeCount} node{flow.nodeCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden bg-[var(--brand-surface)] shadow-md animate-in fade-in duration-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] bg-black/15 text-[var(--brand-secondary)] font-bold">
                    <th className="p-3 pl-4">Name</th>
                    <th className="p-3">Last Edited</th>
                    <th className="p-3">Elements</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedFlows.map((flow) => (
                    <tr
                      key={flow.id}
                      onClick={() => onOpenFlow(flow.id)}
                      className="group border-b border-[var(--color-brand-border)]/40 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="p-3 pl-4 font-semibold text-[var(--brand-text)] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400 opacity-70 shrink-0" />
                        <span className="truncate max-w-sm block">{flow.name}</span>
                      </td>
                      <td className="p-3 text-[var(--brand-secondary)]">
                        {formatUpdatedAt(flow.updatedAt)}
                      </td>
                      <td className="p-3 text-[var(--brand-secondary)]">
                        {flow.nodeCount} nodes, {flow.edgeCount} edges
                      </td>
                      <td className="p-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onRenameFlow(flow.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--brand-secondary)] hover:text-white transition-all cursor-pointer"
                            title="Rename"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateFlow(flow.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--brand-secondary)] hover:text-white transition-all cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteFlow(flow.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : activeSubTab === 'shared' ? (
        <section className="animate-in fade-in duration-300">
          {!user ? (
            <div className="flex w-full max-w-lg mx-auto flex-col py-12 px-6 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-gradient-to-b from-white/[0.01] to-transparent text-center shadow-lg my-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-500/10 border border-lime-500/25 text-lime-400 mb-5">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[var(--brand-text)] mb-2">
                Cloud Sync & Sharing
              </h3>
              <p className="text-xs text-[var(--brand-secondary)] max-w-sm leading-relaxed mb-6">
                Sign in with your account to access files shared by your team and collaborate in real-time.
              </p>
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 py-2 px-5 rounded-lg bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(132,204,22,0.25)] active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Continue</span>
              </button>
            </div>
          ) : !hasSharedFlows ? (
            <div className="flex w-full flex-col py-12 items-center justify-center rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-white/[0.01] text-center max-w-xl mx-auto my-6 animate-in fade-in duration-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-surface)] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_60%)] text-[var(--brand-secondary)] mb-4">
                <Users className="w-5 h-5 opacity-60" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-1">
                No shared files yet
              </h3>
              <p className="text-xs text-[var(--brand-secondary)] max-w-xs leading-relaxed">
                Files that other team members share with you will automatically show up here.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {processedSharedFlows.map((flow) => (
                <div
                  key={flow.id}
                  onClick={() => onOpenFlow(flow.id)}
                  className="group relative cursor-pointer flex flex-col overflow-hidden rounded-[16px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-surface)] transition-all duration-300 hover:border-[var(--brand-primary-400)]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                >
                  <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden border-b border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-background)]">
                    <FlowPreview preview={flow.preview} />
                    <div className="absolute right-3 top-3 z-20 rounded-full bg-[var(--brand-surface)]/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                      Read-only
                    </div>
                  </div>
                  <div className="flex flex-col p-4 bg-[var(--brand-surface)]">
                    <h3 className="font-semibold text-[13.5px] text-[var(--brand-text)] tracking-tight truncate mb-1.5 group-hover:text-[var(--brand-primary)] transition-colors text-left">
                      {flow.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--brand-secondary)]">
                      <span>{formatUpdatedAt(flow.updatedAt)}</span>
                      <div className="h-[3px] w-[3px] rounded-full bg-[color-mix(in_srgb,var(--brand-secondary),transparent_50%)]"></div>
                      <span>{flow.nodeCount} node{flow.nodeCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden bg-[var(--brand-surface)] shadow-md animate-in fade-in duration-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] bg-black/15 text-[var(--brand-secondary)] font-bold">
                    <th className="p-3 pl-4">Name</th>
                    <th className="p-3">Last Edited</th>
                    <th className="p-3">Elements</th>
                    <th className="p-3 text-right pr-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {processedSharedFlows.map((flow) => (
                    <tr
                      key={flow.id}
                      onClick={() => onOpenFlow(flow.id)}
                      className="group border-b border-[var(--color-brand-border)]/40 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="p-3 pl-4 font-semibold text-[var(--brand-text)] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400 opacity-70 shrink-0" />
                        <span className="truncate max-w-sm block">{flow.name}</span>
                      </td>
                      <td className="p-3 text-[var(--brand-secondary)]">
                        {formatUpdatedAt(flow.updatedAt)}
                      </td>
                      <td className="p-3 text-[var(--brand-secondary)]">
                        {flow.nodeCount} nodes, {flow.edgeCount} edges
                      </td>
                      <td className="p-3 text-right pr-4 font-semibold text-[var(--brand-primary)]">
                        Read-only
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        /* PROJECTS TAB CONTENT */
        <section className="animate-in fade-in duration-300">
          <div className="flex w-full flex-col py-16 items-center justify-center rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-white/[0.01] text-center max-w-xl mx-auto my-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-surface)] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_60%)] text-[var(--brand-secondary)] mb-4">
              <Users className="w-5 h-5 opacity-60" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-1">
              No shared projects yet
            </h3>
            <p className="text-xs text-[var(--brand-secondary)] max-w-xs leading-relaxed">
              Create a shared project folder inside Settings or contact your administrator to establish a shared canvas workspace.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function formatUpdatedAt(updatedAt?: string): string {
  if (!updatedAt) {
    return AUTOSAVED_LABEL;
  }

  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) {
    return AUTOSAVED_LABEL;
  }

  return new Date(parsed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getPreviewNodeRadius(node: WorkspaceDocumentPreview['nodes'][number]): number {
  if (node.shape === 'capsule') {
    return node.height / 2;
  }

  if (node.shape === 'rectangle') {
    return 12;
  }

  return 20;
}

interface FlowPreviewProps {
  preview: WorkspaceDocumentPreview | null;
}

function FlowPreview({ preview }: FlowPreviewProps): React.ReactElement {
  if (!preview || preview.nodes.length === 0) {
    return <EmptyFlowPreview />;
  }

  const padding = 24;
  const minX = Math.min(...preview.nodes.map((node) => node.x));
  const minY = Math.min(...preview.nodes.map((node) => node.y));
  const maxX = Math.max(...preview.nodes.map((node) => node.x + node.width));
  const maxY = Math.max(...preview.nodes.map((node) => node.y + node.height));
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="absolute inset-0 text-[var(--brand-secondary)] overflow-hidden w-full h-full">
      <div
        className="absolute inset-0 dark:hidden opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--brand-secondary) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block opacity-[0.35] transition-opacity duration-500 group-hover:opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-brand-border) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--brand-primary)_4%,transparent),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <svg
        viewBox={viewBox}
        className="absolute inset-[10%] h-[80%] w-[80%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {preview.nodes.map((node) => (
          <rect
            key={node.id}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={getPreviewNodeRadius(node)}
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_20px_var(--brand-background)] opacity-[0.85]" />
    </div>
  );
}

interface FlowCardActionButtonProps {
  children: React.ReactNode;
  hoverClassName: string;
  label: string;
  onClick: () => void;
}

function FlowCardActionButton({
  children,
  hoverClassName,
  label,
  onClick,
}: FlowCardActionButtonProps): React.ReactElement {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onClick();
  }

  return (
    <Tooltip text={label} side="bottom">
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[var(--brand-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 ${hoverClassName}`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function EmptyFlowPreview(): React.ReactElement {
  return (
    <>
      <div
        className="absolute inset-0 dark:hidden opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--brand-secondary) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block opacity-[0.3] transition-opacity duration-300 group-hover:opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-brand-border) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--brand-background)_120%)]" />
      <div className="z-10 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-surface)] text-[var(--brand-secondary)] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--brand-primary-400)]/40 group-hover:text-[var(--brand-primary)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <Layout className="w-4 h-4" />
      </div>
    </>
  );
}
