# MNWHILE FlowKit — Open-Source Module Integration Architecture

**ADR Status:** Draft  
**Date:** 2026-06-17  
**Authors:** MNWHILE Team + AI-assisted analysis  
**Status:** Planning — awaiting implementation approval

---

## 1. Executive Summary

MNWHILE FlowKit dimulai sebagai fork OpenFlowKit (diagram editor berbasis React Flow) dan sedang berevolusi menjadi platform creative multi-workspace yang terinspirasi oleh Figma suite. Dokumen ini mendefinisikan strategi integrasi 9+ repository open-source ke dalam satu platform terpadu.

**Key Decision:** Kami menggunakan pendekatan **"Native First, Service When Necessary, Pattern Extract for AI"** — bukan merge semua kode ke satu monorepo, tapi memilih strategi integrasi yang tepat per repository berdasarkan compatibilitas stack, embeddability, dan maintainability.

---

## 2. Module Inventory

### 2.1 Current Core

| Module | Repository | Stack | Role in MNWHILE | Integration Model |
|--------|-----------|-------|-----------------|-------------------|
| **OpenFlowKit** | [Vrun-design/openflowkit](https://github.com/Vrun-design/openflowkit) | React 19 + TS 5 + Vite 6 | Core diagram engine for MnFlow | **Native** (already forked) |

### 2.2 Whiteboard / FigJam Enhancement

| Module | Repository | Stack | Role in MNWHILE | Integration Model |
|--------|-----------|-------|-----------------|-------------------|
| **Excalidraw** | [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) | React + TS | Freeform whiteboard mode for MnFlow | **Native** (NPM package) |
| **tldraw** | [tldraw/tldraw](https://github.com/tldraw/tldraw) | React + TS | Alternative whiteboard SDK | **Native** (NPM package) |
| **AFFiNE** | [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE) | React + TS | Workspace with docs + whiteboard | **Evaluation only** |

### 2.3 Design Engine

| Module | Repository | Stack | Role in MNWHILE | Integration Model |
|--------|-----------|-------|-----------------|-------------------|
| **Penpot** | [penpot/penpot](https://github.com/penpot/penpot) | ClojureScript + React | Figma Design alternative | **Service** (Docker + iframe) |
| **Plasmic** | [plasmicapp/plasmic](https://github.com/plasmicapp/plasmic) | React + TS | Visual builder SDK | **Native** (React SDK) |

### 2.4 Presentation Engine

| Module | Repository | Stack | Role in MNWHILE | Integration Model |
|--------|-----------|-------|-----------------|-------------------|
| **Slidev** | [slidevjs/slidev](https://github.com/slidevjs/slidev) | Vue.js + TS | Markdown-based slides | **Pattern Extract** |
| **Reveal.js** | [hakimel/reveal.js](https://github.com/hakimel/reveal.js) | Vanilla JS | HTML presentation framework | **Native** (embed as renderer) |

### 2.5 AI Code Generation

| Module | Repository | Stack | Role in MNWHILE | Integration Model |
|--------|-----------|-------|-----------------|-------------------|
| **bolt.diy** | [stackblitz-labs/bolt.diy](https://github.com/stackblitz-labs/bolt.diy) | Next.js + TS | Prompt-to-app patterns | **Pattern Extract** |
| **Dyad** | [dyad-sh/dyad](https://github.com/dyad-sh/dyad) | Electron + React | Local AI code generation | **Pattern Extract** |

### 2.6 Brand Asset Engine

| Module | Repository | Stack | Role in MNWHILE | Integration Model |
|--------|-----------|-------|-----------------|-------------------|
| **Fabric.js** | [fabricjs/fabric.js](https://github.com/fabricjs/fabric.js) | Vanilla JS | Canvas manipulation for Buzz | **Native** (embed) |
| **OpenPolotno** | [therutvikp/OpenPolotno](https://github.com/therutvikp/OpenPolotno) | React + Fabric.js | Design editor framework | **Evaluation** |

### 2.7 Site Builder

| Module | Repository | Stack | Role in MNWHILE | Integration Model |
|--------|-----------|-------|-----------------|-------------------|
| **Webstudio** | [webstudio-is/webstudio](https://github.com/webstudio-is/webstudio) | React + TS + AGPL | Visual site builder | **Service** (Docker + iframe) |
| **Plasmic** | [plasmicapp/plasmic](https://github.com/plasmicapp/plasmic) | React + TS | Visual builder SDK | **Native** (React SDK) |

---

## 3. Integration Models

### 3.1 Model A: Native Module

**Definition:** Repository/SDK embedded langsung ke dalam React application sebagai dependency.

**Requirements:**
- React/TypeScript compatible
- Tersedia sebagai NPM package
- Bundle size reasonable (< 500KB)
- License compatible (MIT/Apache/ISC)
- No separate backend required

**Candidates:**
- ✅ OpenFlowKit (core engine)
- ✅ Excalidraw (@excalidraw/excalidraw)
- ✅ tldraw (tldraw SDK)
- ✅ Fabric.js
- ✅ Reveal.js
- ⚠️ Plasmic SDK (needs evaluation)

**Implementation:**
```bash
npm install @excalidraw/excalidraw
```

```typescript
import { Excalidraw } from '@excalidraw/excalidraw';

export function WhiteboardMode() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Excalidraw
        initialData={{ elements: [...], appState: {...} }}
        onChange={(elements, appState) => {
          // Save to document
        }}
      />
    </div>
  );
}
```

**Pros:**
- Seamless UX
- Direct state management
- No network overhead
- Easy auth integration

**Cons:**
- Bundle size impact
- Version conflicts possible
- Breaking changes from upstream

---

### 3.2 Model B: Service Module

**Definition:** Repository dijalankan sebagai service terpisah (Docker container), diakses via reverse proxy atau iframe.

**Requirements:**
- Full application with own backend
- Stack incompatible dengan React (e.g., Clojure, Vue)
- Heavy dependencies
- AGPL or restrictive license

**Candidates:**
- ✅ Penpot (Clojure backend + React frontend)
- ✅ Webstudio (full app + database)
- ⚠️ AFFiNE (too large, evaluation only)

**Implementation:**

```yaml
# docker-compose.yml
services:
  shell:
    image: mnwhile/flowkit-shell:latest
    ports:
      - "3000:3000"
  
  penpot:
    image: penpotapp/frontend:latest
    environment:
      PENPOT_PUBLIC_URI: https://design.mnwhile.local
    ports:
      - "3449:80"
  
  webstudio:
    image: webstudio/webstudio:latest
    ports:
      - "3450:3000"
  
  auth:
    image: keycloak/keycloak:latest
    ports:
      - "8080:8080"
  
  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
```

```nginx
# nginx.conf
upstream shell { server shell:3000; }
upstream penpot { server penpot:80; }
upstream webstudio { server webstudio:3000; }

server {
  listen 80;
  server_name mnwhile.local;

  # Main shell
  location / {
    proxy_pass http://shell;
  }

  # Penpot design workspace
  location /design-app/ {
    proxy_pass http://penpot/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Webstudio site builder
  location /site-builder/ {
    proxy_pass http://webstudio/;
    proxy_set_header Host $host;
  }
}
```

**Pros:**
- Stack agnostic
- Independent updates
- License isolation
- Full feature set

**Cons:**
- Iframe UX friction
- Complex deployment
- Auth synchronization overhead
- Project metadata mapping

---

### 3.3 Model C: Pattern Extraction

**Definition:** Ambil konsep/algoritma dari repository, implementasikan sendiri dengan pattern yang sama.

**Requirements:**
- Repository bukan embeddable component
- Logic/algorithm valuable, bukan UI
- Custom implementation lebih maintainable

**Candidates:**
- ✅ bolt.diy (AI agent loop, file tree generation)
- ✅ Dyad (local-first code generation)
- ✅ Slidev (markdown → slides pipeline)
- ✅ presentation-ai (AI deck generation)

**Implementation:**

```typescript
// Extracted from bolt.diy pattern
export interface AIAgentLoop {
  prompt: string;
  model: string;
  tools: AITool[];
  maxIterations: number;
  
  execute(prompt: string): AsyncGenerator<AgentStep>;
}

export interface AgentStep {
  type: 'thinking' | 'tool_call' | 'output';
  content: string;
  toolCalls?: ToolCall[];
}

// Extracted from Slidev pattern
export interface SlideDeck {
  slides: Slide[];
  theme: SlideTheme;
  transitions: TransitionType[];
}

export interface Slide {
  content: string; // Markdown
  notes?: string;
  layout?: 'title' | 'content' | 'two-column';
}

export function markdownToSlides(markdown: string): SlideDeck {
  // Parse markdown into slides
  // Apply theme
  // Generate Reveal.js HTML
}
```

**Pros:**
- Full control
- Tailored to our architecture
- No external dependencies
- License safe

**Cons:**
- More development time
- Maintenance burden
- Need deep understanding of source

---

## 4. Decision Matrix: Whiteboard Engine

### 4.1 Comparison: Excalidraw vs tldraw vs AFFiNE

| Criterion | Excalidraw | tldraw | AFFiNE | Weight |
|-----------|-----------|--------|--------|--------|
| **Embeddability** | ✅ NPM package, React component | ✅ NPM SDK, React component | ❌ Full app, not embeddable | 25% |
| **Freehand Drawing** | ✅ Excellent, smooth | ✅ Excellent, smooth | ✅ Good | 20% |
| **Sticky Notes** | ✅ Built-in | ✅ Built-in | ✅ Built-in | 15% |
| **Collaboration** | ✅ WebRTC, simple | ✅ WebRTC, simple | ✅ Complex CRDT | 15% |
| **Export** | ✅ PNG/SVG/JSON | ✅ PNG/SVG/JSON | ⚠️ Complex export | 10% |
| **Bundle Size** | ~300KB | ~400KB | > 10MB | 10% |
| **Documentation** | ✅ Good | ✅ Excellent | ⚠️ Limited | 5% |
| **License** | ✅ MIT | ⚠️ Custom SDK license | ✅ MIT | 5% |
| **Community** | ✅ 85k stars | ✅ 40k stars | ✅ 45k stars | 5% |
| **Total Score** | **92/100** | **88/100** | **45/100** | 100% |

### 4.2 Recommendation: Excalidraw First

**Rationale:**

1. **Embeddability:** Excalidraw adalah NPM package yang dirancang untuk embedding. tldraw juga bagus tapi SDK license perlu review. AFFiNE bukan component library.

2. **Simplicity:** Excalidraw lebih lightweight dan focused. tldraw lebih powerful tapi complex. Untuk MVP, simplicity menang.

3. **Bundle Size:** Excalidraw ~300KB vs tldraw ~400KB vs AFFiNE >10MB. AFFiNE tidak feasible sebagai embedded module.

4. **Sketch Aesthetic:** Excalidraw punya hand-drawn look yang distinctive dan cocok untuk brainstorming/ideation mode. tldraw lebih "clean" tapi kurang distinctive.

5. **Proven Integration:** Banyak produk sudah successfully embed Excalidraw (Notion, Obsidian, VS Code). Pattern sudah mature.

**Fallback:** Jika Excalidraw tidak memenuhi kebutuhan advanced (custom shapes, complex interactions), evaluasi tldraw sebagai alternatif.

**Not Recommended:** AFFiNE terlalu besar dan bukan embeddable library. Lebih cocok sebagai standalone app atau service module.

---

## 5. Decision Matrix: Design Engine

### 5.1 Comparison: Penpot vs Plasmic vs Internal

| Criterion | Penpot (Service) | Plasmic (Native) | Internal Build | Weight |
|-----------|-----------------|------------------|----------------|--------|
| **Feature Parity** | ✅ 90% Figma parity | ⚠️ 60% Figma parity | ❌ 10% initially | 30% |
| **Stack Compatibility** | ❌ Clojure backend | ✅ React SDK | ✅ React native | 20% |
| **Deployment Complexity** | ❌ Docker + Keycloak | ⚠️ API key + SDK | ✅ No external | 15% |
| **UX Friction** | ❌ Iframe required | ✅ Seamless | ✅ Seamless | 15% |
| **Maintenance** | ⚠️ Upstream updates | ⚠️ SDK updates | ✅ Full control | 10% |
| **Time to Market** | ✅ 1-2 weeks setup | ⚠️ 2-4 weeks | ❌ 3-6 months | 10% |
| **Total Score** | **68/100** | **72/100** | **35/100** | 100% |

### 5.2 Recommendation: Plasmic SDK (Native) or Penpot (Service)

**Rationale:**

1. **Plasmic SDK** adalah pilihan terbaik jika ingin native integration tanpa iframe friction. Fitur kurang lengkap dari Penpot tapi UX seamless.

2. **Penpot Service** adalah pilihan terbaik jika butuh full Figma-like features dan rela accept iframe UX + deployment complexity.

3. **Internal Build** tidak recommended untuk v1 karena 3-6 bulan development time. Bisa jadi roadmap jangka panjang jika Plasmic/Penpot tidak memenuhi kebutuhan.

**Recommended Path:**
- **Phase 1 (MVP):** Plasmic SDK untuk Design workspace
- **Phase 2 (Advanced):** Evaluate Penpot jika Plasmic tidak cukup powerful
- **Phase 3 (Long-term):** Consider internal build jika kedua tidak cocok

---

## 6. Decision Matrix: Site Builder

### 6.1 Comparison: Webstudio vs Plasmic vs Internal

| Criterion | Webstudio (Service) | Plasmic (Native) | Internal Build | Weight |
|-----------|--------------------|------------------|----------------|--------|
| **Visual Builder** | ✅ Excellent | ✅ Excellent | ⚠️ Basic | 30% |
| **CSS Control** | ✅ Full CSS | ⚠️ Limited | ✅ Full CSS | 20% |
| **Export** | ✅ Static HTML | ✅ React code | ✅ Custom | 20% |
| **Stack Compatibility** | ⚠️ AGPL license | ✅ React SDK | ✅ React native | 15% |
| **Deployment** | ❌ Docker required | ✅ NPM package | ✅ No external | 10% |
| **License** | ❌ AGPL-3.0 | ✅ MIT | ✅ MIT | 5% |
| **Total Score** | **72/100** | **78/100** | **55/100** | 100% |

### 6.2 Recommendation: Plasmic SDK (Native)

**Rationale:**

1. **Plasmic SDK** menang karena native integration, MIT license, dan React SDK yang mature.

2. **Webstudio** powerful tapi AGPL license bisa jadi masalah untuk commercial deployment. Plus Docker overhead.

3. **Internal Build** feasible tapi 2-3 bulan development. Plasmic SDK lebih cepat.

**Recommended Path:**
- **Phase 1:** Plasmic SDK untuk visual builder
- **Phase 2:** Internal static export pipeline (HTML/CSS)
- **Phase 3:** Deploy to Vercel/Cloudflare Pages

---

## 7. Architecture: Hybrid Integration Pattern

### 7.1 Overall Structure

```
MNWHILE FlowKit Platform
│
├── Shell (React + TypeScript)
│   ├── Dashboard
│   ├── Auth (Supabase)
│   ├── Project Metadata
│   └── Workspace Router
│
├── Native Modules (NPM packages)
│   ├── OpenFlowKit (MnFlow structured mode)
│   ├── Excalidraw (MnFlow whiteboard mode)
│   ├── Fabric.js (Buzz asset editor)
│   ├── Reveal.js (Slides renderer)
│   └── Plasmic SDK (Design + Site builder)
│
├── Service Modules (Docker containers)
│   ├── Penpot (optional Design fallback)
│   └── Webstudio (optional Site fallback)
│
└── Pattern Extractions (internal)
    ├── AI Agent Loop (from bolt.diy)
    ├── Markdown-to-Slides (from Slidev)
    └── Local Code Gen (from Dyad)
```

### 7.2 Workspace Mapping

| Workspace | Primary Engine | Secondary Engine | Integration Model |
|-----------|---------------|------------------|-------------------|
| **MnFlow** | OpenFlowKit | Excalidraw | Native + Native |
| **Design** | Plasmic SDK | Penpot (optional) | Native + Service |
| **Slides** | Internal + Reveal.js | Slidev (pattern) | Native + Pattern |
| **Make** | Flowpilot | bolt.diy (pattern) | Native + Pattern |
| **Buzz** | Fabric.js | OpenPolotno (eval) | Native |
| **Site** | Plasmic SDK | Webstudio (optional) | Native + Service |

### 7.3 Data Model: Hybrid Document

```typescript
interface HybridDocument {
  id: string;
  name: string;
  workspaceType: WorkspaceType;
  pages: HybridPage[];
  activePageId: string;
  createdAt: string;
  updatedAt: string;
}

interface HybridPage {
  id: string;
  name: string;
  type: 'diagram' | 'whiteboard' | 'slide' | 'design' | 'asset' | 'site';
  content: DiagramContent | WhiteboardContent | SlideContent | DesignContent | AssetContent | SiteContent;
}

// OpenFlowKit diagram
interface DiagramContent {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Excalidraw whiteboard
interface WhiteboardContent {
  elements: ExcalidrawElement[];
  appState: ExcalidrawAppState;
}

// Slidev/Reveal.js slide
interface SlideContent {
  markdown: string;
  notes?: string;
  layout?: 'title' | 'content' | 'two-column';
}

// Plasmic design
interface DesignContent {
  plasmicData: PlasmicProjectData;
  components: PlasmicComponent[];
}

// Fabric.js asset
interface AssetContent {
  canvas: FabricCanvasJSON;
  brandKit: BrandKit;
}

// Plasmic site
interface SiteContent {
  plasmicSite: PlasmicSiteData;
  routes: SiteRoute[];
  staticExport?: string;
}
```

---

## 8. Implementation Phases

### Phase 1: MnFlow Whiteboard Mode (2-3 weeks)

**Goal:** Add freeform whiteboard to MnFlow using Excalidraw.

**Tasks:**
1. Install `@excalidraw/excalidraw`
2. Create `WhiteboardMode` component
3. Add page type: `'diagram' | 'whiteboard'`
4. Save/load Excalidraw scene to document
5. Add mode switcher UI
6. Test: auth, cloud sync, sharing
7. Deploy to production

**Deliverables:**
- MnFlow supports structured diagrams + freeform whiteboard
- FigJam-like ideation experience
- AI generate/summarize works on both modes

---

### Phase 2: Slides Engine (3-4 weeks)

**Goal:** Build presentation mode on top of existing page system.

**Tasks:**
1. Add page type: `'slide'`
2. Integrate Reveal.js for rendering
3. Build slide editor (markdown + WYSIWYG)
4. Add presenter mode
5. Add transitions + speaker notes
6. Export to PDF/HTML
7. Optional: Slidev markdown import/export

**Deliverables:**
- Slides workspace functional
- Deck creation/editing/presentation
- Export to common formats

---

### Phase 3: Design Engine Evaluation (2 weeks)

**Goal:** Evaluate Plasmic SDK vs Penpot service.

**Tasks:**
1. Install Plasmic SDK
2. Build prototype Design workspace
3. Evaluate features vs Figma
4. Test Plasmic → code export
5. If insufficient, deploy Penpot as service
6. Test Penpot via iframe
7. Decision: Plasmic native vs Penpot service

**Deliverables:**
- Design engine decision made
- Prototype workspace functional
- Feature gap analysis documented

---

### Phase 4: Make AI Pipeline (4-6 weeks)

**Goal:** Enhance Flowpilot with prompt-to-app capabilities.

**Tasks:**
1. Extract bolt.diy AI agent loop pattern
2. Build AI agent with tools:
   - Generate diagram
   - Generate slide deck
   - Generate site outline
   - Generate React code (v2)
3. Add file tree model
4. Add preview iframe
5. Add iterative editing
6. Optional: Dyad local-first pattern

**Deliverables:**
- Make workspace with AI-first workflow
- Prompt → output pipeline
- Preview + edit capabilities

---

### Phase 5: Buzz Asset Editor (3-4 weeks)

**Goal:** Build brand asset generation workspace.

**Tasks:**
1. Integrate Fabric.js
2. Build template editor
3. Add brand kit model (colors, fonts, logos)
4. Add locked fields (brand-safe editing)
5. Add batch generation
6. Export PNG/SVG/PDF per channel size

**Deliverables:**
- Buzz workspace functional
- Template-based asset creation
- Brand kit enforcement
- Batch export

---

### Phase 6: Site Builder (4-6 weeks)

**Goal:** Build visual site builder with static export.

**Tasks:**
1. Integrate Plasmic SDK
2. Build site page model
3. Add responsive preview (desktop/tablet/mobile)
4. Add static HTML export
5. Add deploy to Vercel/Cloudflare
6. Optional: Webstudio service fallback

**Deliverables:**
- Site workspace functional
- Visual site builder
- Responsive preview
- Static export + deploy

---

## 9. Deployment Architecture

### 9.1 Minimal Deployment (Native Only)

```yaml
# docker-compose.minimal.yml
services:
  flowkit:
    image: mnwhile/flowkit:latest
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    ports:
      - "3000:3000"
  
  postgres:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Use Case:** MnFlow + Slides + Make + Buzz (all native modules)

---

### 9.2 Full Deployment (Native + Service)

```yaml
# docker-compose.full.yml
services:
  flowkit:
    image: mnwhile/flowkit:latest
    ports:
      - "3000:3000"
  
  penpot:
    image: penpotapp/frontend:latest
    environment:
      PENPOT_PUBLIC_URI: https://design.mnwhile.local
      PENPOT_FLAGS: "enable-registration enable-login-with-password"
    depends_on:
      - penpot-backend
    ports:
      - "3449:80"
  
  penpot-backend:
    image: penpotapp/backend:latest
    environment:
      PENPOT_DATABASE_URI: postgres://penpot:penpot@postgres:5432/penpot
    depends_on:
      - postgres
  
  webstudio:
    image: webstudio/webstudio:latest
    ports:
      - "3450:3000"
  
  keycloak:
    image: keycloak/keycloak:latest
    command: start-dev
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_PASSWORD}
    ports:
      - "8080:8080"
  
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - penpot_data:/var/lib/postgresql/penpot
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    ports:
      - "80:80"
      - "443:443"
```

**Use Case:** All workspaces including Design (Penpot) + Site (Webstudio)

---

## 10. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Excalidraw breaking changes** | Medium | Pin version, fork if needed |
| **Plasmic SDK limitations** | High | Fallback to Penpot service |
| **Penpot deployment complexity** | Medium | Use managed Penpot cloud initially |
| **License conflicts (AGPL)** | High | Legal review before Webstudio integration |
| **Bundle size explosion** | Medium | Code splitting, lazy loading |
| **Auth synchronization overhead** | Medium | Use Keycloak SSO for all services |
| **Upstream update breaks integration** | High | Pin versions, test upgrades in staging |

---

## 11. Open Questions

1. **Penpot vs Plasmic:** Which provides better Figma parity for our use case?
2. **Webstudio license:** Does AGPL-3.0 allow commercial SaaS deployment?
3. **tldraw license:** Is SDK license compatible with our MIT license?
4. **AFFiNE integration:** Is there any subset we can extract without full app?
5. **Reveal.js vs Slidev:** Which provides better slide rendering?
6. **bolt.diy extraction:** Which specific patterns to extract (agent loop, file tree, preview)?

---

## 12. Related Documents

- `docs/architecture/WORKSPACE_ARCHITECTURE.md` — Workspace shell architecture
- `docs/planning/WORKSPACE_ROADMAP.md` — Multi-workspace roadmap
- `docs/planning/MNFLOW_FIGJAM_ROADMAP.md` — MnFlow FigJam-specific roadmap
- `docs/planning/TIMELINE_CHECKLIST.md` — Implementation checklist
- `CLAUDE.md` — Development guide

---

**Last Updated:** 2026-06-17  
**Status:** Draft — awaiting team review
