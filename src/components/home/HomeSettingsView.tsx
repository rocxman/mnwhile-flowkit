import React from 'react';
import { FLOWPILOT_NAME } from '@/lib/brand';
import { useTranslation } from 'react-i18next';
import { BookOpen, Code, Sparkles, Plug } from 'lucide-react';
import { AISettings } from '../SettingsModal/AISettings';
import { CanvasSettings } from '../SettingsModal/CanvasSettings';
import { GeneralSettings } from '../SettingsModal/GeneralSettings';
import { MCPSettings } from '../SettingsModal/MCPSettings';
import { ShortcutsSettings } from '../SettingsModal/ShortcutsSettings';
import { SidebarItem } from '../ui/SidebarItem';
import { MCPFlowVisual } from './MCPFlowVisual';

type HomeSettingsTab = 'general' | 'canvas' | 'shortcuts' | 'ai' | 'mcp' | 'documentation';

interface HomeSettingsViewProps {
    activeSettingsTab: HomeSettingsTab;
    onSettingsTabChange: (tab: HomeSettingsTab) => void;
}

export function HomeSettingsView({
    activeSettingsTab,
    onSettingsTabChange,
}: HomeSettingsViewProps): React.ReactElement {
    const { t } = useTranslation();
    const settingsTabs: Array<{ key: HomeSettingsTab; label: string }> = [
        { key: 'general', label: t('settings.general', 'General') },
        { key: 'canvas', label: t('settings.canvas', 'Canvas') },
        { key: 'ai', label: t('settings.ai', FLOWPILOT_NAME) },
        { key: 'mcp', label: t('settings.mcp', 'MCP') },
        { key: 'documentation', label: t('settings.documentation', 'Documentation') },
        { key: 'shortcuts', label: t('settings.shortcuts', 'Shortcuts') },
    ];

    function renderSettingsPanel(): React.ReactElement {
        switch (activeSettingsTab) {
            case 'general':
                return <GeneralSettings />;
            case 'canvas':
                return <CanvasSettings />;
            case 'ai':
                return <AISettings />;
            case 'mcp':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-1">
                                {t('mcp.pageTitle', 'Connect AI tools')}
                            </h2>
                            <p className="text-sm text-[var(--brand-secondary)]">
                                {t(
                                    'mcp.pageSubtitle',
                                    'Give Claude, Cursor, Windsurf, or any MCP client first-class diagramming tools. Local-first, no API key, no cloud round-trip.'
                                )}
                            </p>
                        </div>
                        <div className="border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] rounded-2xl p-5 bg-white/[0.01]">
                            <MCPFlowVisual />
                        </div>
                        <MCPSettings variant="page" />
                    </div>
                );
            case 'documentation':
                return <DocumentationSettings />;
            case 'shortcuts':
                return <ShortcutsSettings />;
        }
    }

    return (
        <div className="flex flex-1 flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="flex min-h-0 flex-1 flex-col bg-[var(--brand-surface)] md:flex-row">
                <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-brand-border)] p-2 md:w-48 md:block md:space-y-1 md:overflow-y-auto md:border-b-0 md:border-r">
                    {settingsTabs.map((tab) => (
                        <SidebarItem
                            key={tab.key}
                            isActive={activeSettingsTab === tab.key}
                            onClick={() => onSettingsTabChange(tab.key)}
                            className="min-w-fit md:min-w-0"
                        >
                            {tab.label}
                        </SidebarItem>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className={activeSettingsTab === 'mcp' || activeSettingsTab === 'documentation' ? "max-w-4xl" : "max-w-2xl"}>
                        {renderSettingsPanel()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocumentationSettings(): React.ReactElement {
    const resources = [
        {
            title: 'Getting Started',
            desc: 'Learn the core concepts, user interface panels, and local-first architecture of FlowKit.',
            url: 'https://docs.mnwhile-flowkit.com/introduction',
            icon: <BookOpen className="w-5 h-5 text-lime-400" />,
        },
        {
            title: 'OpenFlow DSL',
            desc: "Design architecture layouts programmatically with FlowKit's human-readable DSL syntax.",
            url: 'https://docs.mnwhile-flowkit.com/openflow-dsl',
            icon: <Code className="w-5 h-5 text-blue-400" />,
        },
        {
            title: 'Flowpilot AI',
            desc: 'Harness the built-in AI agent to draft, extend, and rewrite visual layouts using text prompts.',
            url: 'https://docs.mnwhile-flowkit.com/ai-generation',
            icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        },
        {
            title: 'MCP Server Setup',
            desc: 'Connect Cursor, Claude Desktop, or Windsurf directly to your flow diagram workspaces.',
            url: 'https://docs.mnwhile-flowkit.com/mcp-setup',
            icon: <Plug className="w-5 h-5 text-amber-400" />,
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-1">
                    Documentation
                </h2>
                <p className="text-sm text-[var(--brand-secondary)]">
                    Explore manuals, integrations, and program languages for MNWHILE FlowKit.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.map((res) => (
                    <a
                        key={res.title}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between p-5 rounded-2xl border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-surface)] hover:bg-white/[0.02] hover:border-[var(--brand-primary-400)]/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                        <div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-4 group-hover:scale-105 transition-transform duration-200">
                                {res.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-1 group-hover:text-[var(--brand-primary)] transition-colors">
                                {res.title}
                            </h3>
                            <p className="text-xs text-[var(--brand-secondary)] leading-relaxed">
                                {res.desc}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span>Read guide</span>
                            <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
