-- Fix document_shares.shared_with_user_id FK to reference profiles instead of auth.users
-- This allows PostgREST to JOIN profiles for share user details (email, display_name)

ALTER TABLE public.document_shares
  DROP CONSTRAINT IF EXISTS document_shares_shared_with_user_id_fkey;

ALTER TABLE public.document_shares
  ADD CONSTRAINT document_shares_shared_with_user_id_fkey
  FOREIGN KEY (shared_with_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
