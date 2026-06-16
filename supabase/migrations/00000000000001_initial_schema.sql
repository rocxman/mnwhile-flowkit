-- Initial schema for MNWHILE FlowKit
-- Tables: profiles, documents, document_shares, document_snapshots
-- Includes RLS policies, triggers, and helper functions

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table (main diagram storage)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  local_id TEXT,
  name TEXT NOT NULL,
  diagram_type TEXT,
  content JSONB,
  pages JSONB,
  active_page_id TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, local_id)
);

-- Document shares table (explicit user sharing)
CREATE TABLE public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  permission TEXT DEFAULT 'view',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, shared_with_user_id)
);

-- Document snapshots table (version history)
CREATE TABLE public.document_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Documents
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_updated_at ON public.documents(updated_at DESC);
CREATE INDEX idx_documents_share_token ON public.documents(share_token);
CREATE INDEX idx_documents_deleted_at ON public.documents(deleted_at);

-- Document shares
-- (UNIQUE constraint already creates index)

-- Document snapshots
CREATE INDEX idx_snapshots_document_id ON public.document_snapshots(document_id);
CREATE INDEX idx_snapshots_created_at ON public.document_snapshots(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Trigger function: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$;

-- Helper function: check if current user owns a document (for RLS)
-- SECURITY DEFINER bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_document_owner(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.documents
    WHERE id = doc_id AND user_id = auth.uid()
  );
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_snapshots ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- DOCUMENTS policies
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public documents are viewable"
  ON public.documents FOR SELECT
  USING (is_public = TRUE AND deleted_at IS NULL);

CREATE POLICY "Shared users can view shared documents"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_shares
      WHERE document_shares.document_id = documents.id
        AND document_shares.shared_with_user_id = auth.uid()
    )
  );

-- DOCUMENT_SHARES policies
CREATE POLICY "Document owners can view shares"
  ON public.document_shares FOR SELECT
  USING (is_document_owner(document_id));

CREATE POLICY "Document owners can create shares"
  ON public.document_shares FOR INSERT
  WITH CHECK (is_document_owner(document_id));

CREATE POLICY "Document owners can delete shares"
  ON public.document_shares FOR DELETE
  USING (is_document_owner(document_id));

-- DOCUMENT_SNAPSHOTS policies
CREATE POLICY "Users can view snapshots"
  ON public.document_snapshots FOR SELECT
  USING (is_document_owner(document_id));

CREATE POLICY "Users can create snapshots"
  ON public.document_snapshots FOR INSERT
  WITH CHECK (is_document_owner(document_id));
