# TIMELINE_CHECKLIST.md - Project Timeline & Checklist

## Overview

Complete phase-by-phase implementation checklist for MNWHILE FLOWKIT self-hosted fork. Each phase has clear deliverables, acceptance criteria, and estimated hours.

**Total Estimated Time:** 80-120 hours (4-6 weeks part-time)

---

## Phase 0: Project Foundation & Baseline

**Duration:** 8-12 hours  
**Goal:** Clone repo, understand codebase, establish development environment, deploy static baseline.

### 0.1 Repository Setup

- [ ] Clone repository to local machine
  ```bash
  git clone https://github.com/Vrun-design/mnwhile-flowkit.git mnwhile-flowkit
  cd mnwhile-flowkit
  ```

- [ ] Create GitHub repository `mnwhile-flowkit`
  ```bash
  git remote set-url origin https://github.com/YOUR_USERNAME/mnwhile-flowkit.git
  git push -u origin main
  ```

- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Verify dev server runs
  ```bash
  npm run dev
  # Expected: http://localhost:3000
  ```

- [ ] Verify production build
  ```bash
  npm run build
  npm run preview
  ```

- [ ] Run existing tests
  ```bash
  npm test -- --run
  ```

- [ ] Run linting
  ```bash
  npm run lint
  ```

### 0.2 Codebase Understanding

- [ ] Read `docs/architecture/ARCHITECTURE.md`
- [ ] Read `src/store/types.ts` (understand FlowState)
- [ ] Read `src/store/persistence.ts` (understand IndexedDB persistence)
- [ ] Read `src/services/storage/indexedDbSchema.ts` (understand DB schema)
- [ ] Read `src/App.tsx` (understand routing)
- [ ] Explore `src/components/` directory structure
- [ ] Explore `src/services/` directory structure
- [ ] Explore `src/hooks/` directory structure

### 0.3 Documentation Setup

- [ ] Create `docs/planning/PROJECT_BUILD_PLAN.md` ✅
- [ ] Create `CLAUDE.md` ✅
- [ ] Create `docs/agents/AGENTS.md` ✅
- [ ] Create `docs/agents/MCP_SETUP.md` ✅
- [ ] Create `docs/planning/SKILLS_REQUIRED.md` ✅
- [ ] Create `docs/planning/TIMELINE_CHECKLIST.md` ✅
- [ ] Update `README.md` with project-specific info

### 0.4 Environment Setup

- [ ] Install Supabase CLI
  ```bash
  npm install -g supabase
  ```

- [ ] Install Vercel CLI
  ```bash
  npm install -g vercel
  ```

- [ ] Setup local environment variables
  ```bash
  cp .env.example .env.local
  # Edit .env.local with Supabase/R2 credentials
  ```

- [ ] Configure `.gitignore`
  ```
  .env.local
  .env*.local
  node_modules/
  dist/
  .vercel/
  ```

### 0.5 Architecture Diagram

- [ ] Use MNWHILE FlowKit MCP to analyze codebase
  ```
  Prompt: Analyze this codebase and create an architecture diagram showing the current local-first architecture.
  ```

- [ ] Generate architecture diagram
- [ ] Save diagram in `docs/architecture/`
- [ ] Validate DSL
- [ ] Create viewer URL for documentation

### Phase 0 Deliverables

✅ Repository forked and pushed to GitHub  
✅ Dev server running locally  
✅ Production build working  
✅ All tests passing  
✅ All documentation created  
✅ Architecture diagram generated  
✅ Environment setup complete  

**Acceptance Criteria:**
- `npm run dev` starts on localhost:3000
- `npm run build` produces `dist/` folder
- All existing tests pass
- No lint errors

---

## Phase 1: Infrastructure Setup

**Duration:** 8-12 hours  
**Goal:** Setup Supabase, Cloudflare R2, Vercel project. Deploy static baseline.

### 1.1 Supabase Project

- [ ] Create Supabase project at https://supabase.com
  - [ ] Project name: `mnwhile-flowkit`
  - [ ] Region: closest to users
  - [ ] Database password: save securely

- [ ] Note project credentials
  ```
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_ANON_KEY=eyJxxx...
  ```

- [ ] Verify Supabase project is active
  ```bash
  npx supabase projects list
  ```

- [ ] Setup local Supabase config
  ```bash
  npx supabase init
  npx supabase link --project-ref YOUR_PROJECT_ID
  ```

### 1.2 Supabase Auth Setup

- [ ] Enable Email provider
  - Go to Authentication → Providers
  - Enable Email/Password
  - Disable email confirmation (for development)

- [ ] Enable optional OAuth providers
  - [ ] Google (requires OAuth credentials)
  - [ ] GitHub (requires OAuth app)

- [ ] Verify auth settings
  ```bash
  npx supabase inspect auth
  ```

### 1.3 Cloudflare R2 Bucket

- [ ] Create Cloudflare account (if needed)
- [ ] Navigate to R2 Object Storage
- [ ] Create bucket
  - Bucket name: `mnwhile-flowkit-exports`
  - Region: Automatic

- [ ] Create R2 API token
  - Go to My Profile → API Tokens
  - Create token with R2 read/write permissions
  - Note credentials:
    ```
    R2_ACCESS_KEY_ID=xxx
    R2_SECRET_ACCESS_KEY=xxx
    R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
    R2_BUCKET_NAME=mnwhile-flowkit-exports
    ```

- [ ] Verify R2 bucket via MCP
  ```
  Tool: cloudflare:r2_list_buckets
  ```

### 1.4 Vercel Project

- [ ] Install Vercel CLI
  ```bash
  npm install -g vercel
  ```

- [ ] Login to Vercel
  ```bash
  vercel login
  ```

- [ ] Initialize Vercel project
  ```bash
  vercel
  # Follow prompts:
  # - Set up and deploy? Y
  # - Which scope? (select your account)
  # - Link to existing project? N
  # - Project name: mnwhile-flowkit
  # - Directory: ./
  # - Build command: npm run build
  # - Output directory: dist
  ```

- [ ] Verify Vercel project settings
  ```bash
  vercel env ls
  ```

### 1.5 Environment Variables

- [ ] Add Vercel environment variables
  ```bash
  vercel env add VITE_SUPABASE_URL
  vercel env add VITE_SUPABASE_ANON_KEY
  vercel env add R2_ACCESS_KEY_ID
  vercel env add R2_SECRET_ACCESS_KEY
  vercel env add R2_BUCKET_NAME
  vercel env add R2_ENDPOINT
  ```

- [ ] Verify environment variables
  ```bash
  vercel env ls
  ```

- [ ] Create local `.env.local` file
  ```bash
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJxxx...
  R2_ACCESS_KEY_ID=xxx
  R2_SECRET_ACCESS_KEY=xxx
  R2_BUCKET_NAME=mnwhile-flowkit-exports
  R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
  ```

### 1.6 vercel.json Configuration

- [ ] Create `vercel.json`
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

### 1.7 Deploy Static Baseline

- [ ] Commit changes
  ```bash
  git add .
  git commit -m "chore: setup vercel.json"
  ```

- [ ] Deploy to preview
  ```bash
  vercel
  ```

- [ ] Verify preview deployment
  - Open preview URL
  - Check app loads correctly
  - Test local-first features

- [ ] Deploy to production
  ```bash
  vercel --prod
  ```

- [ ] Verify production deployment
  - Open production URL
  - Test all features
  - Check console for errors

### 1.8 Supabase MCP Setup

- [ ] Configure Supabase MCP in Claude
  ```json
  {
    "mcpServers": {
      "supabase": {
        "command": "npx",
        "args": ["-y", "@supabase/mcp-server-supabase@latest"],
        "env": {
          "SUPABASE_ACCESS_TOKEN": "your-token"
        }
      }
    }
  }
  ```

- [ ] Get Supabase access token
  - Go to Supabase dashboard → Account → Access Tokens
  - Create token with full access

- [ ] Test Supabase MCP
  ```
  Tool: supabase:list_projects
  ```

### Phase 1 Deliverables

✅ Supabase project created and configured  
✅ R2 bucket created with API token  
✅ Vercel project deployed  
✅ Environment variables configured  
✅ vercel.json created  
✅ Static app deployed to production  
✅ MCP servers configured  

**Acceptance Criteria:**
- Supabase project accessible via dashboard
- R2 bucket listed in Cloudflare
- Vercel deployment at production URL
- Environment variables visible in Vercel dashboard
- App loads at production URL

---

## Phase 2: Authentication

**Duration:** 12-16 hours  
**Goal:** Add email/password authentication, protected routes, user profiles.

### 2.1 Database Schema (Profiles)

- [ ] Create `profiles` table via Supabase MCP
  ```sql
  CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- [ ] Enable RLS
  ```sql
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ```

- [ ] Create RLS policies
  ```sql
  CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);
  
  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
  ```

- [ ] Create auto-create trigger
  ```sql
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

- [ ] Verify schema in Supabase dashboard
- [ ] Run security advisors
  ```
  Tool: supabase:get_advisors(type: security)
  ```

### 2.2 Supabase Client Setup

- [ ] Install Supabase client
  ```bash
  npm install @supabase/supabase-js
  ```

- [ ] Create Supabase client file
  ```typescript
  // src/lib/supabase.ts
  import { createClient } from '@supabase/supabase-js';
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```

- [ ] Test client connection
  ```typescript
  const { data, error } = await supabase.auth.getSession();
  console.log('Session:', data, error);
  ```

### 2.3 Auth Context

- [ ] Create `src/contexts/AuthContext.tsx`
  ```typescript
  import { createContext, useContext, useEffect, useState } from 'react';
  import { supabase } from '@/lib/supabase';
  import type { User } from '@supabase/supabase-js';
  
  interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
  }
  
  export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      });
  
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null);
        }
      );
  
      return () => subscription.unsubscribe();
    }, []);
  
    const signIn = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    };
  
    const signUp = async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    };
  
    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    };
  
    return (
      <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
  };
  ```

- [ ] Wrap app with AuthProvider in `src/App.tsx`
  ```typescript
  import { AuthProvider } from './contexts/AuthContext';
  
  // Wrap <App />
  <AuthProvider>
    <App />
  </AuthProvider>
  ```

### 2.4 Auth Pages

- [ ] Create `src/pages/LoginPage.tsx`
  - Email input
  - Password input
  - Login button
  - Link to register
  - Error display

- [ ] Create `src/pages/RegisterPage.tsx`
  - Email input
  - Password input
  - Confirm password input
  - Register button
  - Link to login
  - Error display

- [ ] Create `src/pages/ForgotPasswordPage.tsx` (optional)
  - Email input
  - Send reset link button

### 2.5 Protected Routes

- [ ] Add route guards in `src/App.tsx`
  ```typescript
  import { useAuth } from './contexts/AuthContext';
  import { Navigate } from 'react-router-dom';
  
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    
    return <>{children}</>;
  };
  ```

- [ ] Wrap protected routes
  ```typescript
  <Route path="/" element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  } />
  ```

- [ ] Add public routes
  ```typescript
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  ```

### 2.6 User Menu

- [ ] Create `src/components/UserMenu.tsx`
  - User avatar/name display
  - Logout button
  - Settings link

- [ ] Add UserMenu to FlowEditor header
- [ ] Test logout flow

### 2.7 Testing Auth

- [ ] Test registration flow
  - Enter email/password
  - Submit form
  - Verify redirect to login

- [ ] Test login flow
  - Enter email/password
  - Submit form
  - Verify redirect to home

- [ ] Test protected routes
  - Access `/` without auth
  - Verify redirect to `/login`

- [ ] Test logout flow
  - Click logout
  - Verify redirect to `/login`

- [ ] Test error handling
  - Invalid email format
  - Wrong password
  - Network errors

### Phase 2 Deliverables

✅ `profiles` table with RLS  
✅ Supabase client configured  
✅ Auth context created  
✅ Login page working  
✅ Register page working  
✅ Protected routes working  
✅ User menu with logout  

**Acceptance Criteria:**
- Can register with email/password
- Can login with email/password
- Protected routes redirect to login
- Logout clears session
- Profile auto-created on signup

---

## Phase 3: Cloud Persistence

**Duration:** 16-20 hours  
**Goal:** Save/load documents from Supabase, multi-device sync.

### 3.1 Database Schema (Documents)

- [ ] Create `documents` table
  ```sql
  CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    diagram_type TEXT,
    content JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
  );
  ```

- [ ] Create indexes
  ```sql
  CREATE INDEX idx_documents_user_id ON documents(user_id);
  CREATE INDEX idx_documents_share_token ON documents(share_token);
  CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);
  ```

- [ ] Enable RLS
  ```sql
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
  ```

- [ ] Create RLS policies
  ```sql
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
  ```

- [ ] Run security advisors
  ```
  Tool: supabase:get_advisors(type: security)
  ```

### 3.2 Cloud Storage Adapter

- [ ] Create `src/lib/cloud-storage.ts`
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
      return data?.map(row => row.content as FlowDocument) || [];
    },
  
    async getDocument(id: string): Promise<FlowDocument | null> {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data ? data.content as FlowDocument : null;
    },
  
    async saveDocument(doc: FlowDocument): Promise<void> {
      const { error } = await supabase
        .from('documents')
        .upsert({
          id: doc.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          name: doc.name,
          diagram_type: doc.diagramType,
          content: doc,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
  
    async deleteDocument(id: string): Promise<void> {
      const { error } = await supabase
        .from('documents')
        .update({ deleted_at: new Date().toISOString() })
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
      return data ? data.content as FlowDocument : null;
    },
  };
  ```

### 3.3 Cloud Sync Hook

- [ ] Create `src/hooks/useCloudSync.ts`
  ```typescript
  import { useEffect, useRef } from 'react';
  import { useStore } from '@/store';
  import { cloudStorage } from '@/lib/cloud-storage';
  import { supabase } from '@/lib/supabase';
  
  export const useCloudSync = () => {
    const documents = useStore(state => state.documents);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
    useEffect(() => {
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

### 3.4 Integration with App

- [ ] Add `useCloudSync` to `src/App.tsx`
  ```typescript
  import { useCloudSync } from './hooks/useCloudSync';
  
  function App() {
    useCloudSync();
    // ... rest of app
  }
  ```

- [ ] Load cloud documents on auth
  ```typescript
  useEffect(() => {
    if (user) {
      loadCloudDocuments().then(docs => {
        // Merge with local documents
      });
    }
  }, [user]);
  ```

- [ ] Merge cloud documents with local
  - Compare timestamps
  - Cloud wins if newer
  - Local wins if newer
  - Handle conflicts (future)

### 3.5 Sync Status Indicator

- [ ] Create `src/components/SyncStatusIndicator.tsx`
  - Show sync status (syncing/synced/error)
  - Show last sync time
  - Show sync errors

- [ ] Add to FlowEditor header
- [ ] Test sync status display

### 3.6 Testing Cloud Sync

- [ ] Test save to cloud
  - Create diagram
  - Verify in Supabase dashboard

- [ ] Test load from cloud
  - Logout
  - Login
  - Verify documents loaded

- [ ] Test multi-device sync
  - Open in browser 1
  - Open in browser 2
  - Edit in browser 1
  - Verify appears in browser 2

- [ ] Test conflict resolution
  - Edit same document in two browsers
  - Verify cloud wins (or shows conflict)

### Phase 3 Deliverables

✅ `documents` table with RLS  
✅ Cloud storage adapter  
✅ Cloud sync hook  
✅ Multi-device sync working  
✅ Sync status indicator  

**Acceptance Criteria:**
- Documents save to Supabase
- Documents load on app start
- Multi-device sync works
- Sync status visible to user

---

## Phase 4: Cloud Storage (R2)

**Duration:** 10-14 hours  
**Goal:** Upload large exports to R2, generate signed URLs.

### 4.1 R2 Upload API Route

- [ ] Install AWS SDK
  ```bash
  npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  ```

- [ ] Create `api/upload-export.ts`
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

### 4.2 Export Upload Logic

- [ ] Modify `src/hooks/useFlowExport.ts`
  ```typescript
  const exportAndUpload = async (format: 'mp4' | 'png' | 'pdf') => {
    const blob = await exportDocument(format);
    
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

### 4.3 Download Export

- [ ] Add download functionality
  ```typescript
  const downloadExport = async (key: string) => {
    const response = await fetch(`/api/upload-export?key=${key}`);
    const { url } = await response.json();
    
    window.open(url, '_blank');
  };
  ```

### 4.4 Testing R2 Integration

- [ ] Test MP4 export
  - Create diagram
  - Export as MP4
  - Verify upload to R2

- [ ] Test PNG export
  - Create diagram
  - Export as PNG
  - Verify upload to R2

- [ ] Test download
  - Click download button
  - Verify file downloads

- [ ] Verify R2 bucket
  ```
  Tool: cloudflare:r2_list_objects(bucket: mnwhile-flowkit-exports)
  ```

### Phase 4 Deliverables

✅ R2 upload API route  
✅ Export upload logic  
✅ Download functionality  
✅ R2 bucket populated  

**Acceptance Criteria:**
- MP4 exports upload to R2
- PNG exports upload to R2
- Signed URLs work for download
- No secrets in frontend code

---

## Phase 5: Sharing

**Duration:** 12-16 hours  
**Goal:** Public share links, explicit user sharing.

### 5.1 Public Share Link

- [ ] Add share button to UI
- [ ] Generate share token
  ```typescript
  const shareToken = await cloudStorage.shareDocument(documentId);
  ```

- [ ] Create share URL
  ```typescript
  const shareUrl = `${window.location.origin}/share/${shareToken}`;
  ```

- [ ] Copy to clipboard
  ```typescript
  await navigator.clipboard.writeText(shareUrl);
  ```

### 5.2 Share Page

- [ ] Create `src/pages/SharePage.tsx`
  - Fetch document by share token
  - Render read-only diagram
  - Option to duplicate to own account

- [ ] Add route `/share/:token`
  ```typescript
  <Route path="/share/:token" element={<SharePage />} />
  ```

### 5.3 Explicit User Sharing

- [ ] Create `document_shares` table
  ```sql
  CREATE TABLE document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents ON DELETE CASCADE NOT NULL,
    shared_with_user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    permission TEXT DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, shared_with_user_id)
  );
  ```

- [ ] Create share dialog
  - Enter email
  - Lookup user
  - Add to document_shares

- [ ] Add shared documents to dashboard
  - Query document_shares
  - Show alongside owned documents

### 5.4 Testing Sharing

- [ ] Test public share
  - Generate share link
  - Open in incognito
  - Verify diagram loads

- [ ] Test explicit share
  - Share with email
  - Login as shared user
  - Verify document in dashboard

- [ ] Test duplicate
  - Open share link
  - Click "Duplicate to my account"
  - Verify copy created

### Phase 5 Deliverables

✅ Public share links  
✅ Share page  
✅ Explicit user sharing  
✅ Shared documents in dashboard  

**Acceptance Criteria:**
- Public share links work
- Share page renders diagram
- Explicit sharing works
- Shared documents appear in dashboard

---

## Phase 6: Polish & Deployment

**Duration:** 12-16 hours  
**Goal:** Production hardening, monitoring, final deployment.

### 6.1 Error Handling

- [ ] Add error boundaries
- [ ] Handle offline mode
- [ ] Show sync errors to user
- [ ] Add retry logic

### 6.2 Performance Optimization

- [ ] Analyze bundle size
  ```bash
  npm run build:analyze
  ```

- [ ] Optimize manual chunks (if needed)
- [ ] Lazy load heavy components
- [ ] Enable gzip/brotli on Vercel

### 6.3 Monitoring Setup

- [ ] Install Sentry
  ```bash
  npm install @sentry/react
  ```

- [ ] Configure Sentry
  ```typescript
  // src/lib/sentry.ts
  import * as Sentry from '@sentry/react';
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
  ```

- [ ] Add Sentry to app
  ```typescript
  // src/main.tsx
  import './lib/sentry';
  ```

- [ ] Test error reporting
  - Throw test error
  - Verify in Sentry dashboard

### 6.4 Security Review

- [ ] Test RLS policies
  - Access other user's data
  - Verify 403 forbidden

- [ ] Verify no secrets in client bundle
  ```bash
  npm run build
  grep -r "R2_SECRET" dist/
  ```

- [ ] Test auth flows
  - Registration
  - Login
  - Logout
  - Password reset

- [ ] Run security advisors
  ```
  Tool: supabase:get_advisors(type: security)
  ```

### 6.5 Final Deployment

- [ ] Run all tests
  ```bash
  npm test -- --run
  npm run test:e2e
  ```

- [ ] Run linting
  ```bash
  npm run lint
  ```

- [ ] Build for production
  ```bash
  npm run build
  ```

- [ ] Deploy to production
  ```bash
  vercel --prod
  ```

- [ ] Verify production deployment
  - Test all features
  - Check console for errors
  - Test on mobile devices

### 6.6 Documentation

- [ ] Update `README.md` with setup instructions
- [ ] Update `PROJECT_BUILD_PLAN.md` with final architecture
- [ ] Create `DEPLOYMENT.md` with deployment steps
- [ ] Create `TROUBLESHOOTING.md` with common issues

### Phase 6 Deliverables

✅ Error boundaries  
✅ Performance optimized  
✅ Sentry monitoring  
✅ Security review passed  
✅ Production deployed  
✅ Documentation complete  

**Acceptance Criteria:**
- No errors in Sentry dashboard
- Security advisors pass
- All tests pass
- Production deployment stable

---

## Phase 7: Post-Launch (Future)

**Duration:** Ongoing  
**Goal:** Monitor, iterate, scale.

### 7.1 Monitoring

- [ ] Monitor Sentry errors
- [ ] Monitor Supabase usage
- [ ] Monitor R2 usage
- [ ] Monitor Vercel analytics

### 7.2 User Feedback

- [ ] Collect user feedback
- [ ] Prioritize bug fixes
- [ ] Plan feature requests

### 7.3 Scaling

- [ ] Monitor database size
- [ ] Monitor bandwidth usage
- [ ] Plan upgrades if needed

### 7.4 Future Features

- [ ] Real-time collaboration (WebRTC + Supabase Realtime)
- [ ] Team/organization support
- [ ] Billing integration
- [ ] Document versioning UI
- [ ] Mobile app

---

## Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0 | 8-12 hours | Not Started |
| Phase 1 | 8-12 hours | Not Started |
| Phase 2 | 12-16 hours | Not Started |
| Phase 3 | 16-20 hours | Not Started |
| Phase 4 | 10-14 hours | Not Started |
| Phase 5 | 12-16 hours | Not Started |
| Phase 6 | 12-16 hours | Not Started |
| **Total** | **78-106 hours** | - |

---

## Quick Reference

### Commands

```bash
# Development
npm run dev
npm run build
npm test

# Deployment
vercel --prod

# Database
npx supabase db push

# Monitoring
vercel logs
supabase logs
```

### Key Files

- `src/contexts/AuthContext.tsx` - Auth context
- `src/lib/supabase.ts` - Supabase client
- `src/lib/cloud-storage.ts` - Cloud storage adapter
- `src/hooks/useCloudSync.ts` - Cloud sync hook
- `api/upload-export.ts` - R2 upload route
- `src/pages/SharePage.tsx` - Share page

### MCP Tools

- `supabase:list_tables` - Inspect schema
- `supabase:apply_migration` - Run migrations
- `supabase:get_advisors` - Security check
- `cloudflare:r2_list_buckets` - Check R2

---

**Last Updated:** 2026-06-16  
**Total Estimated Time:** 80-120 hours (4-6 weeks part-time)
