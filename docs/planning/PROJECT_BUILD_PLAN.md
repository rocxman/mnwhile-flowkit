# MNWHILE FlowKit Self-Hosted Build Plan

## 1. Context & Goals

**Problem:**  
MNWHILE FlowKit upstream is a **local-first SPA** (React 19 + TypeScript 5 + Vite 6) yang menyimpan semua data di browser (IndexedDB). Tidak ada backend, tidak ada autentikasi, tidak ada cloud persistence. Untuk kebutuhan self-hosted production, kita perlu menambahkan:

- User authentication (email + password)
- Cloud persistence (diagram tersimpan di database)
- Cloud storage (export besar seperti MP4/PNG disimpan di object storage)
- Sharing diagram (public link + explicit share)
- Multi-device sync
- Deployment profesional di Vercel

**Target Stack (Free Tier):**

| Layer | Service | Free Tier Limits |
|-------|---------|------------------|
| **Frontend Hosting** | Vercel | 100GB bandwidth/month, 6000 build min/month |
| **Auth + Database** | Supabase | 500MB DB, 1GB storage, 2GB bandwidth, 50K MAU |
| **Object Storage** | Cloudflare R2 | 10GB storage, 10M reads + 1M writes/month, **free egress** |
| **DNS/CDN** | Cloudflare (optional) | Free plan |

**Non-goals (v1):**
- Real-time collaboration (WebRTC sudah ada di codebase tapi off by default)
- Team/organization management
- Billing/payment integration
- Desktop app (Tauri)

---

## 2. Current Architecture Analysis

### 2.1 Repository Structure

```
mnwhile-flowkit/
├── src/                    # Main app (React + TypeScript)
│   ├── app/                # Route state helpers
│   ├── components/         # UI surfaces (FlowEditor, CustomNode, CommandBar, etc.)
│   ├── config/             # Rollout flags, provider config
│   ├── context/            # React context providers
│   ├── diagram-types/      # Diagram family plugins (flowchart, architecture, ER, class, etc.)
│   ├── hooks/              # Feature hooks (useAIGeneration, useFlowExport, useFlowHistory, etc.)
│   ├── i18n/               # Localization (7 languages)
│   ├── lib/                # Shared types, parsers, utilities
│   ├── services/           # Domain services (AI, export, mermaid, storage, collaboration, etc.)
│   ├── store/              # Zustand state management
│   ├── theme/              # Theming
│   ├── App.tsx             # Main app component + routing
│   ├── index.tsx           # Entry point
│   └── store.ts            # Public store export
├── docs-site/              # Public docs (Astro/Starlight)
├── web/                    # Marketing site
├── mcp-server/             # MCP server package (@vrun-design/mnwhile-flowkit-mcp)
├── e2e/                    # Playwright E2E tests
├── scripts/                # Build/utility scripts
├── benchmarks/             # Performance benchmarks
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript config
```

### 2.2 State Management

**Single Zustand store** exported from `src/store.ts`, bootstrapped via:

- `src/store/createFlowStore.ts` — store factory
- `src/store/createFlowStoreState.ts` — state composition
- `src/store/createFlowStorePersistOptions.ts` — persistence config

**Store slices** (defined in `src/store/slices/`):

- `createCanvasEditorSlice.ts` — nodes, edges, canvas state
- `createExperienceSlice.ts` — UI experience state
- `createWorkspaceSlice.ts` — documents, tabs, workspace

**Key state types** (from `src/store/types.ts`):

```typescript
interface FlowState {
  // Canvas
  nodes: FlowNode[];
  edges: FlowEdge[];
  
  // Workspace/Documents
  documents: FlowDocument[];
  activeDocumentId: string;
  tabs: FlowTab[];
  activeTabId: string;
  
  // Design
  designSystems: DesignSystem[];
  globalEdgeOptions: GlobalEdgeOptions;
  
  // View
  viewSettings: ViewSettings;
  
  // AI
  aiSettings: AISettings;
  
  // Layers
  layers: Layer[];
  
  // Selection
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
}
```

### 2.3 Persistence (Current)

**IndexedDB-based** persistence via Zustand middleware:

- **DB Name:** `mnwhile-flowkit-persistence`
- **DB Version:** 3
- **Stores** (from `src/services/storage/indexedDbSchema.ts`):
  - `flowDocuments` — document records
  - `flowMetadata` — metadata/state
  - `schemaMeta` — schema migration markers
  - `documents` — persisted documents (legacy)
  - `documentSessions` — session tracking
  - `chatThreads` — AI chat threads
  - `chatMessages` — AI chat messages
  - `workspaceMeta` — workspace metadata
  - `aiSettingsPersistent` — AI provider settings
  - `preferences` — user preferences
  - `assets` — local assets

**Persistence flow:**
1. Zustand `persist` middleware wraps the store
2. `indexedDbStateStorage.ts` provides `StateStorage` interface
3. On state change → serialize to JSON → write to IndexedDB
4. On app load → read from IndexedDB → hydrate store
5. Migration from localStorage → IndexedDB handled automatically

**Key files:**
- `src/store/persistence.ts` — sanitization, hydration, migration
- `src/services/storage/indexedDbSchema.ts` — DB schema
- `src/services/storage/indexedDbStateStorage.ts` — Zustand storage adapter
- `src/services/storage/flowPersistStorage.ts` — high-level persistence API
- `src/services/storage/storageRuntime.ts` — storage detection/initialization

### 2.4 Data Model

**FlowDocument** (from `src/services/storage/flowDocumentModel.ts`):

```typescript
interface FlowDocument {
  id: string;
  name: string;
  diagramType?: DiagramType;
  tabs: FlowTab[];
  activeTabId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

**FlowTab** (represents a single diagram page):

```typescript
interface FlowTab {
  id: string;
  name: string;
  diagramType: DiagramType;
  nodes: FlowNode[];
  edges: FlowEdge[];
  playback: PlaybackState;
  history: FlowHistory;
  updatedAt: string;
}
```

**FlowNode** (React Flow node with custom data):

```typescript
interface FlowNode {
  id: string;
  type: string; // 'process', 'decision', 'architecture', etc.
  position: { x: number; y: number };
  data: {
    label: string;
    subLabel?: string;
    color?: string;
    icon?: string;
    shape?: string;
    layerId?: string;
    archProvider?: string; // 'aws', 'azure', 'gcp', 'cncf', 'developer'
    archResourceType?: string;
  };
  // ... React Flow fields
}
```

**FlowEdge:**

```typescript
interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
  data?: {
    showParticles?: boolean;
    routingMode?: string;
    styleType?: string;
  };
}
```

### 2.5 Export System

**Export formats** (from `src/services/export/` and `src/hooks/useFlowExport.ts`):

- **JSON** — full document round-trip
- **PNG** — raster image (html-to-image)
- **SVG** — vector export
- **PDF** — print-ready (via SVG → PDF)
- **MP4** — cinematic video (WebCodecs + mp4-muxer)
- **Mermaid** — code export
- **PlantUML** — enterprise format
- **Figma** — editable SVG import

**Export pipeline:**
1. `useFlowExport.ts` — hook orchestrating export
2. `exportService.ts` — format-specific serializers
3. Canvas → SVG/PNG via html-to-image
4. MP4 via WebCodecs VideoEncoder + mp4-muxer

### 2.6 AI Integration

**Providers** (from `src/store/types.ts`):

```typescript
type AIProvider = 
  | 'gemini' | 'openai' | 'claude' | 'groq' | 'nvidia'
  | 'cerebras' | 'mistral' | 'openrouter' | 'ollama' | 'custom';
```

**AI Settings storage:**
- `aiSettings.ts` — settings types
- `aiSettingsPersistence.ts` — localStorage + IndexedDB persistence
- `aiService.ts` — provider API calls
- `useAIGeneration.ts` — generation hook

**Current behavior:** API keys stored in browser (localStorage/IndexedDB), requests go directly from browser to provider. No server-side proxy.

### 2.7 Collaboration (Existing but Disabled)

**Files:**
- `src/hooks/useFlowEditorCollaboration.ts`
- `src/services/collaboration/`
- `y-webrtc`, `y-indexeddb`, `yjs` dependencies

**Status:** Opt-in beta, disabled by default (`VITE_COLLABORATION_ENABLED=false`). Uses WebRTC P2P with signaling. Not production-ready.

---

## 3. Target Architecture

### 3.1 High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Frontend)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              MNWHILE FlowKit SPA (React + Vite)            │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Auth Context│  │ Cloud Sync   │  │ Local Cache  │  │  │
│  │  │ (Supabase)  │  │ Hook         │  │ (IndexedDB)  │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Vercel API Routes (Serverless)            │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ /api/auth/* │  │ /api/upload  │  │ /api/share/* │  │  │
│  │  │ (proxy)     │  │ (R2 proxy)   │  │ (share mgmt) │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Supabase     │  │  Cloudflare R2  │  │  Cloudflare CDN │
│  ┌───────────┐  │  │                 │  │   (optional)    │
│  │   Auth    │  │  │  Object Storage │  │                 │
│  │ (JWT/Email│  │  │  (MP4, PNG,     │  │  Static assets  │
│  │  + Pass)  │  │  │   PDF, backups) │  │  + caching      │
│  └───────────┘  │  │                 │  │                 │
│  ┌───────────┐  │  └─────────────────┘  └─────────────────┘
│  │ Postgres  │  │
│  │ (docs,    │  │
│  │  shares,  │  │
│  │  snapshots│  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │   RLS     │  │
│  │ (security)│  │
│  └───────────┘  │
└─────────────────┘
```

### 3.2 Data Flow

**Document Save (Online):**
1. User edits diagram → Zustand store updates
2. `useCloudSync` hook detects change → debounced save
3. Save to IndexedDB (local cache, optimistic)
4. Save to Supabase `documents` table (cloud source of truth)
5. If export (MP4/PNG) → upload to R2 via `/api/upload`

**Document Load:**
1. App loads → check auth status
2. If authenticated → fetch documents from Supabase
3. Merge with IndexedDB cache (conflict resolution: cloud wins + timestamp)
4. Hydrate Zustand store

**Sharing:**
1. Owner clicks "Share" → generate UUID share token
2. Update `documents` table: `is_public=true`, `share_token=<uuid>`
3. Public URL: `https://app.mnwhile-flowkit.com/share/<token>`
4. Viewer accesses URL → fetch document by `share_token` (no auth required)

**Explicit Share (to specific user):**
1. Owner enters email → lookup user in `profiles`
2. Insert into `document_shares` table
3. Shared user sees document in their dashboard

---

## 4. Implementation Plan

### Phase 1: Infrastructure Setup

**Goal:** Clone repo, setup services, deploy static app.

**Steps:**

1. **Clone & Install:**
   ```bash
   git clone https://github.com/Vrun-design/mnwhile-flowkit.git
   cd mnwhile-flowkit
   npm install
   ```

2. **Supabase Project:**
   - Create project at https://supabase.com
   - Note: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - Enable Email auth (no OAuth for v1)
   - Run SQL migrations (see Section 5)

3. **Cloudflare R2:**
   - Create bucket: `mnwhile-flowkit-exports`
   - Create API token with R2 read/write permissions
   - Note: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`

4. **Vercel Project:**
   - Import repo from GitHub
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variables (see Section 6)

5. **Deploy Static App:**
   ```bash
   npx vercel --prod
   ```
   - Verify app loads at Vercel URL
   - Local-first mode still works (no backend yet)

**Deliverables:**
- ✅ Static app deployed on Vercel
- ✅ Supabase project ready
- ✅ R2 bucket ready

---

### Phase 2: Authentication

**Goal:** Add email/password login, protected routes, user profiles.

**Database Schema:**

```sql
-- profiles table (auto-created on auth.users insert via trigger)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Frontend Implementation:**

1. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase client** (`src/lib/supabase.ts`):
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

3. **Auth Context** (`src/contexts/AuthContext.tsx`):
   - Wrap app with `AuthProvider`
   - Expose `user`, `signIn`, `signUp`, `signOut`
   - Handle auth state changes via `supabase.auth.onAuthStateChange`

4. **Auth Pages:**
   - `src/pages/LoginPage.tsx` — email/password form
   - `src/pages/RegisterPage.tsx` — signup form
   - `src/pages/ForgotPasswordPage.tsx` — password reset

5. **Protected Routes:**
   - Add route guard in `src/App.tsx`
   - Redirect to `/login` if not authenticated
   - Public routes: `/login`, `/register`, `/share/:token`

6. **UI Components:**
   - User menu (avatar, logout)
   - Auth status indicator

**Files to Create/Modify:**
- ✅ `src/lib/supabase.ts` (new)
- ✅ `src/contexts/AuthContext.tsx` (new)
- ✅ `src/pages/LoginPage.tsx` (new)
- ✅ `src/pages/RegisterPage.tsx` (new)
- ✅ `src/App.tsx` (modify routing)
- ✅ `src/components/UserMenu.tsx` (new)

**Deliverables:**
- ✅ Users can register with email/password
- ✅ Users can login/logout
- ✅ Protected routes redirect to login
- ✅ User profile created on signup

---

### Phase 3: Cloud Persistence

**Goal:** Save/load documents from Supabase, multi-device sync.

**Database Schema:**

```sql
-- documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  diagram_type TEXT,
  content JSONB, -- Full FlowDocument JSON
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_share_token ON documents(share_token);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public documents are viewable"
  ON documents FOR SELECT USING (is_public = TRUE);

-- document_shares table (explicit sharing)
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  permission TEXT DEFAULT 'view', -- 'view' or 'edit'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, shared_with_user_id)
);

ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners can view shares"
  ON document_shares FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_shares.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can create shares"
  ON document_shares FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_shares.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Shared users can view shared documents"
  ON documents FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_shares
      WHERE document_shares.document_id = documents.id
      AND document_shares.shared_with_user_id = auth.uid()
    )
  );

-- document_snapshots table (version history)
CREATE TABLE document_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshots_document_id ON document_snapshots(document_id);

ALTER TABLE document_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view snapshots"
  ON document_snapshots FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_snapshots.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create snapshots"
  ON document_snapshots FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_snapshots.document_id
      AND documents.user_id = auth.uid()
    )
  );
```

**Cloud Storage Adapter:**

Create `src/lib/cloud-storage.ts`:

```typescript
import { supabase } from './supabase';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';

export const cloudStorage = {
  async getAllDocuments(): Promise<FlowDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(row => JSON.parse(row.content) as FlowDocument) || [];
  },

  async getDocument(id: string): Promise<FlowDocument | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? JSON.parse(data.content) : null;
  },

  async saveDocument(doc: FlowDocument): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .upsert({
        id: doc.id,
        name: doc.name,
        diagram_type: doc.diagramType,
        content: JSON.stringify(doc),
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async shareDocument(id: string): Promise<string> {
    const shareToken = crypto.randomUUID();
    
    const { error } = await supabase
      .from('documents')
      .update({ is_public: true, share_token: shareToken })
      .eq('id', id);
    
    if (error) throw error;
    return shareToken;
  },

  async getDocumentByShareToken(token: string): Promise<FlowDocument | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single();
    
    if (error) throw error;
    return data ? JSON.parse(data.content) : null;
  },
};
```

**Cloud Sync Hook:**

Create `src/hooks/useCloudSync.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { cloudStorage } from '@/lib/cloud-storage';
import { supabase } from '@/lib/supabase';

export const useCloudSync = () => {
  const documents = useStore(state => state.documents);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounced sync on document change
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      for (const doc of documents) {
        try {
          await cloudStorage.saveDocument(doc);
        } catch (error) {
          console.error('Failed to sync document:', error);
        }
      }
    }, 2000); // 2s debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [documents]);

  const loadCloudDocuments = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return [];

    const docs = await cloudStorage.getAllDocuments();
    return docs;
  };

  return { loadCloudDocuments };
};
```

**Integration Points:**

1. **On App Load:**
   - Check auth status
   - If authenticated → fetch documents from cloud
   - Merge with IndexedDB (conflict resolution: cloud wins if newer)
   - Hydrate Zustand store

2. **On Document Save:**
   - Save to IndexedDB (optimistic, instant)
   - Debounced sync to cloud (2s delay)
   - Show sync status indicator

3. **On Document Delete:**
   - Delete from IndexedDB
   - Delete from cloud (soft delete: set `deleted_at`)

**Files to Create/Modify:**
- ✅ `src/lib/cloud-storage.ts` (new)
- ✅ `src/hooks/useCloudSync.ts` (new)
- ✅ `src/App.tsx` (add cloud sync on load)
- ✅ `src/store/createFlowStorePersistOptions.ts` (add cloud sync hook)
- ✅ `src/components/SyncStatusIndicator.tsx` (new)

**Deliverables:**
- ✅ Documents sync to Supabase on save
- ✅ Documents load from Supabase on app start
- ✅ Multi-device sync works
- ✅ Sync status indicator shows save state

---

### Phase 4: Cloud Storage (R2)

**Goal:** Upload large exports (MP4, PNG, PDF) to R2, generate signed URLs.

**Vercel API Route:**

Create `api/upload-export.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Upload file to R2
    const { filename, contentType, data } = req.body;
    const key = `exports/${Date.now()}-${filename}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(data, 'base64'),
        ContentType: contentType,
      })
    );

    res.status(200).json({ key });
  } else if (req.method === 'GET') {
    // Generate signed URL for download
    const { key } = req.query;

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key as string,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ url });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

**Install AWS SDK:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Export Hook Modification:**

Modify `src/hooks/useFlowExport.ts` to upload to R2 after export:

```typescript
const exportAndUpload = async (format: 'mp4' | 'png' | 'pdf') => {
  // Existing export logic
  const blob = await exportDocument(format);
  
  // Upload to R2
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = async () => {
    const base64 = reader.result?.toString().split(',')[1];
    
    const response = await fetch('/api/upload-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: `${document.name}.${format}`,
        contentType: blob.type,
        data: base64,
      }),
    });
    
    const { key } = await response.json();
    
    // Store key in document metadata
    await cloudStorage.updateDocumentMetadata(document.id, {
      exportKey: key,
    });
  };
};
```

**Files to Create/Modify:**
- ✅ `api/upload-export.ts` (new)
- ✅ `src/hooks/useFlowExport.ts` (modify to upload to R2)
- ✅ `package.json` (add AWS SDK)

**Deliverables:**
- ✅ MP4/PNG/PDF exports upload to R2
- ✅ Signed URLs generated for download
- ✅ R2 storage usage tracked

---

### Phase 5: Sharing

**Goal:** Public share links, explicit user sharing.

**Public Share:**

1. **Share Dialog** (`src/components/ShareDialog.tsx`):
   - Toggle "Make public"
   - Generate share link: `https://app.mnwhile-flowkit.com/share/<token>`
   - Copy to clipboard

2. **Share Page** (`src/pages/SharePage.tsx`):
   - Route: `/share/:token`
   - Fetch document by `share_token`
   - Render read-only diagram viewer
   - Option to duplicate to own account

**Explicit Share:**

1. **Share with User:**
   - Enter email in share dialog
   - Lookup user in `profiles` table
   - Insert into `document_shares` table
   - Send email notification (optional, via Supabase Edge Functions)

2. **Shared Documents View:**
   - Query `document_shares` for current user
   - Show in dashboard alongside owned documents

**Files to Create:**
- ✅ `src/components/ShareDialog.tsx` (new)
- ✅ `src/pages/SharePage.tsx` (new)
- ✅ `src/components/Dashboard.tsx` (show shared docs)

**Deliverables:**
- ✅ Public share links work
- ✅ Explicit user sharing works
- ✅ Shared documents appear in dashboard

---

### Phase 6: Polish & Deploy

**Goal:** Production hardening, monitoring, deploy.

**Tasks:**

1. **Environment Variables:**
   ```bash
   # .env.local (local dev)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Vercel dashboard (production)
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   R2_ACCESS_KEY_ID
   R2_SECRET_ACCESS_KEY
   R2_BUCKET_NAME
   R2_ENDPOINT
   ```

2. **vercel.json:**
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "functions": {
       "api/*.ts": {
         "runtime": "@vercel/node@3.0.0"
       }
     }
   }
   ```

3. **Error Handling:**
   - Add error boundaries
   - Handle offline mode gracefully
   - Show sync errors to user

4. **Performance:**
   - Optimize bundle size (analyze with `npm run build:analyze`)
   - Lazy load heavy components
   - Enable gzip/brotli on Vercel

5. **Monitoring:**
   - Add Sentry for error tracking
   - Add analytics (PostHog already in deps)
   - Monitor Supabase usage

6. **Security Review:**
   - Test RLS policies
   - Verify no secrets in client bundle
   - Test auth flows
   - Penetration testing

7. **Deploy:**
   ```bash
   npx vercel --prod
   ```

**Deliverables:**
- ✅ Production deployment complete
- ✅ Error monitoring active
- ✅ Security review passed
- ✅ Documentation updated

---

## 5. Database Migrations

Run these SQL scripts in Supabase SQL Editor:

1. `profiles` table + trigger
2. `documents` table + RLS
3. `document_shares` table + RLS
4. `document_snapshots` table + RLS

(See Phase 2 & 3 for full SQL)

---

## 6. Environment Variables

### Local Development (`.env.local`)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Production

Add in Vercel dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ENDPOINT
```

**Important:** R2 variables are server-only (used in API routes), not exposed to client.

---

## 7. Free Tier Limits & Scaling

### Supabase Free Tier

- **Database:** 500MB
- **Storage:** 1GB
- **Bandwidth:** 2GB/month
- **Auth:** 50,000 MAU
- **Edge Functions:** 500K invocations/month

**Estimation:**
- Average document: ~50KB JSON
- 500MB / 50KB = ~10,000 documents
- 2GB bandwidth / 50KB = ~40,000 document loads/month

**Scaling triggers:**
- >5,000 active users
- >50,000 documents
- >1GB/month bandwidth

### Cloudflare R2 Free Tier

- **Storage:** 10GB
- **Operations:** 10M reads + 1M writes/month
- **Egress:** Free (no egress fees)

**Estimation:**
- Average MP4: ~5MB
- 10GB / 5MB = ~2,000 videos
- 1M writes / month = plenty for exports

**Scaling triggers:**
- >2,000 stored videos
- >10GB storage used

### Vercel Free Tier

- **Bandwidth:** 100GB/month
- **Build minutes:** 6,000 minutes/month
- **Serverless Functions:** 100GB-hours

**Scaling triggers:**
- >100GB bandwidth (unlikely for SPA)
- Heavy API route usage

---

## 8. Security Considerations

### Row Level Security (RLS)

All Supabase tables use RLS:
- Users can only access their own data
- Public documents viewable by anyone with token
- Shared documents accessible to explicit users

### Secrets Management

- **Client-side:** Only `SUPABASE_URL` and `SUPABASE_ANON_KEY` (safe to expose)
- **Server-side:** R2 credentials in Vercel env vars (not exposed to client)
- **API keys:** AI provider keys stored in browser (existing behavior)

### Auth Security

- Supabase handles JWT tokens automatically
- Tokens stored in browser (httpOnly cookies optional)
- Password hashing by Supabase (bcrypt)

### Data Validation

- Validate document JSON schema before save
- Sanitize user inputs in share dialog
- Rate limit API routes (Vercel default)

---

## 9. Testing Strategy

### Unit Tests

```bash
npm run test
```

Test cloud storage adapter, sync logic, auth flows.

### Integration Tests

```bash
npm run test:e2e
```

Test full user flows:
- Register → Login → Create doc → Save → Logout → Login → Verify doc loaded
- Share doc → Access share link → View doc

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with email/password
- [ ] Create diagram
- [ ] Save diagram (verify in Supabase)
- [ ] Logout → Login → Verify diagram loaded
- [ ] Edit diagram → Verify sync
- [ ] Delete diagram → Verify soft delete
- [ ] Share diagram (public link)
- [ ] Access share link (no auth)
- [ ] Share diagram (explicit user)
- [ ] View shared diagram
- [ ] Export MP4 → Verify upload to R2
- [ ] Download export → Verify signed URL
- [ ] Test on multiple devices (sync)
- [ ] Test offline mode (local cache)

---

## 10. Future Enhancements

### v1.1

- Real-time collaboration (enable WebRTC + Supabase Realtime)
- Offline-first with optimistic updates
- Conflict resolution UI

### v1.2

- Team/organization support
- Role-based permissions (admin, editor, viewer)
- Billing integration (Stripe)

### v1.3

- Document versioning UI (snapshot timeline)
- Comments/annotations
- Audit log

### v2.0

- Desktop app (Tauri shell)
- Mobile app (React Native)
- Self-hosted Docker deployment

---

## 11. Critical Files to Modify

### New Files

- `src/lib/supabase.ts` — Supabase client
- `src/lib/cloud-storage.ts` — Cloud storage adapter
- `src/contexts/AuthContext.tsx` — Auth context
- `src/hooks/useCloudSync.ts` — Cloud sync hook
- `src/pages/LoginPage.tsx` — Login UI
- `src/pages/RegisterPage.tsx` — Register UI
- `src/pages/SharePage.tsx` — Public share view
- `src/components/ShareDialog.tsx` — Share UI
- `src/components/UserMenu.tsx` — User menu
- `src/components/SyncStatusIndicator.tsx` — Sync status
- `api/upload-export.ts` — R2 upload proxy

### Modified Files

- `src/App.tsx` — Add auth routing, cloud sync
- `src/store/createFlowStorePersistOptions.ts` — Add cloud sync hook
- `src/hooks/useFlowExport.ts` — Upload to R2
- `package.json` — Add dependencies
- `vite.config.ts` — Add env var handling (if needed)
- `vercel.json` — Add rewrite rules

---

## 12. Commands Reference

### Development

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Lint + type-check
```

### Deployment

```bash
npx vercel           # Deploy to preview
npx vercel --prod    # Deploy to production
```

### Database

```bash
# Run migrations in Supabase SQL Editor
# Or use Supabase CLI:
npx supabase db push
```

---

## 13. Troubleshooting

### Issue: Documents not syncing

**Check:**
- User is authenticated (`supabase.auth.getUser()`)
- RLS policies allow access
- Network tab shows API calls to Supabase
- Console for errors

### Issue: R2 upload fails

**Check:**
- R2 credentials in Vercel env vars
- Bucket name matches
- CORS config on R2 (if direct upload)
- API route logs in Vercel dashboard

### Issue: Share link not working

**Check:**
- `is_public=true` in database
- `share_token` exists
- RLS allows public access
- Route `/share/:token` exists in app

---

## 14. Success Criteria

**v1.0 Complete When:**

- ✅ Static app deployed on Vercel
- ✅ Email/password auth working
- ✅ Documents sync to Supabase
- ✅ Multi-device sync verified
- ✅ MP4/PNG exports upload to R2
- ✅ Public share links work
- ✅ Explicit user sharing works
- ✅ All tests passing
- ✅ Security review passed
- ✅ Documentation complete

---

## 15. Timeline Estimate

**Phase 1 (Setup):** 2-4 hours  
**Phase 2 (Auth):** 4-6 hours  
**Phase 3 (Cloud Sync):** 6-8 hours  
**Phase 4 (R2 Storage):** 3-4 hours  
**Phase 5 (Sharing):** 4-6 hours  
**Phase 6 (Polish):** 4-6 hours  

**Total:** ~23-34 hours (1-2 weeks part-time)

---

## 16. Resources

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [MNWHILE FlowKit Docs](https://docs.mnwhile-flowkit.com)
- [Zustand Docs](https://docs.pmnd.rs/zustand)

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-16  
**Author:** Claude (Anthropic)
