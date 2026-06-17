import React, { useMemo, useState } from 'react';
import { Heart, Copy, Sparkles, Flame, Users, Search } from 'lucide-react';
import { getFlowTemplates } from '@/services/templates';
import { TemplateDiagramPreview } from '@/components/templates/TemplatePresentation';

interface HomeCommunityViewProps {
  onUseTemplate: (templateId: string) => void;
}

interface CommunityCard {
  id: string;
  name: string;
  creator: {
    username: string;
    avatar: string;
    role: string;
  };
  likes: number;
  clones: number;
  featured: boolean;
  category: string;
  templateId: string;
  description: string;
}

export function HomeCommunityView({
  onUseTemplate,
}: HomeCommunityViewProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');


  const templates = useMemo(() => getFlowTemplates(), []);

  // Map local templates to community-style posts for visual richness
  const communityItems = useMemo<CommunityCard[]>(() => {
    const creators = [
      { username: 'dahlia_designs', avatar: 'D', role: 'System Architect' },
      { username: 'flow_master', avatar: 'F', role: 'DevOps Lead' },
      { username: 'diagram_ninja', avatar: 'N', role: 'Product Manager' },
      { username: 'builder_bob', avatar: 'B', role: 'Engineering Manager' },
      { username: 'diagram_queen', avatar: 'Q', role: 'Lead Architect' },
    ];

    return templates.map((template, idx) => {
      const creator = creators[idx % creators.length];
      return {
        id: `comm-${template.id}`,
        name: template.name,
        description: template.description,
        creator,
        likes: Math.floor(15 + (idx * 27) % 150),
        clones: Math.floor(40 + (idx * 64) % 400),
        featured: idx % 3 === 0,
        category: template.category,
        templateId: template.id,
      };
    });
  }, [templates]);

  // Categories
  const categories = useMemo(() => {
    const allCats = new Set(communityItems.map((item) => item.category));
    return ['all', ...Array.from(allCats)];
  }, [communityItems]);

  const filteredItems = useMemo(() => {
    return communityItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.creator.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [communityItems, searchQuery, activeCategory]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10 md:py-8 animate-in fade-in duration-300">
      {/* Banner Cover Header */}
      <div className="relative overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[var(--brand-surface)] p-8 md:p-12 mb-8 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none select-none">
          <Sparkles className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10 max-w-2xl text-left">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>Community Gallery</span>
          </span>
          <h1 className="text-3xl font-extrabold text-[var(--brand-text)] tracking-tight mb-3 font-outfit">
            Explore the Community
          </h1>
          <p className="text-sm leading-relaxed text-[var(--brand-secondary)] mb-6">
            Discover and duplicate production-ready diagrams, layout architectures, and templates built by the MNWHILE builder community.
          </p>

          {/* Inline Community Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-[var(--brand-secondary)] opacity-60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, creators, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] text-xs text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] shadow-inner focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--color-brand-border)] pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-[var(--brand-secondary)] hover:text-[var(--brand-text)]'
            }`}
          >
            {cat === 'all' ? 'All Templates' : cat}
          </button>
        ))}
      </div>

      {/* Grid of Community Cards */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col py-16 items-center justify-center text-center max-w-md mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[var(--brand-secondary)] mb-4">
            <Users className="w-5 h-5 opacity-60" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--brand-text)] mb-1">No templates found</h3>
          <p className="text-xs text-[var(--brand-secondary)] leading-relaxed">
            Try adjusting your search keywords or filter terms to find community templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const flowTemplate = templates.find((t) => t.id === item.templateId);
            return (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_55%)] bg-[var(--brand-surface)] transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1"
              >
                {/* Visual Preview Section */}
                <div className="relative h-[160px] w-full overflow-hidden border-b border-[color-mix(in_srgb,var(--color-brand-border),transparent_55%)] bg-[var(--brand-background)]">
                  {flowTemplate && <TemplateDiagramPreview template={flowTemplate} />}
                  <div className="absolute top-3 left-3 rounded-md bg-slate-900/70 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-indigo-400 capitalize">
                    {item.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Creator Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-[9px] font-bold text-indigo-400 border border-indigo-500/20 shadow-sm">
                      {item.creator.avatar}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[10px] font-semibold text-[var(--brand-text)] leading-none">
                        @{item.creator.username}
                      </p>
                      <p className="truncate text-[8px] text-[var(--brand-secondary)] leading-none mt-0.5">
                        {item.creator.role}
                      </p>
                    </div>
                  </div>

                  <h3 className="mb-1 text-[13.5px] font-bold tracking-tight text-[var(--brand-text)] group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[var(--brand-secondary)] line-clamp-2 leading-normal mb-4 flex-1">
                    {item.description}
                  </p>

                  {/* Actions & Metrics Row */}
                  <div className="flex items-center justify-between border-t border-[var(--color-brand-border)] pt-3 mt-auto">
                    <div className="flex items-center gap-2.5 text-[10px] font-semibold text-[var(--brand-secondary)]">
                      <span className="flex items-center gap-1 hover:text-red-400 transition-colors">
                        <Heart className="w-3.5 h-3.5 text-red-500/70" />
                        <span>{item.likes}</span>
                      </span>
                      <span className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                        <Copy className="w-3.5 h-3.5 text-indigo-500/70" />
                        <span>{item.clones}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUseTemplate(item.templateId)}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 text-[10px] font-bold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-[0_0_12px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
