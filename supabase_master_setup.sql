-- ==============================================================================
-- VIVAH BANDHAN - MASTER DATABASE SETUP SCRIPT
-- ==============================================================================
-- This script consolidates all features, fixes, and security improvements into one.
-- It is designed to be IDEMPOTENT (safe to run multiple times).

-- ------------------------------------------------------------------------------
-- 1. SCHEMA UPDATES (Tables & Columns)
-- ------------------------------------------------------------------------------

-- 1.1 Add 'subscription_type' to profiles if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_type') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_type TEXT DEFAULT 'free';
        ALTER TABLE public.profiles ADD CONSTRAINT check_subscription_type CHECK (subscription_type IN ('free', 'premium'));
    END IF;
END $$;

-- 1.2 Create 'app_settings' table for global configs
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Insert default setting for Payment Wall if not exists
INSERT INTO public.app_settings (key, value, description)
VALUES ('enable_payment_wall', 'false', 'If true, blocks non-premium users from requesting matches.')
ON CONFLICT (key) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS (RPCs)
-- ------------------------------------------------------------------------------

-- 2.1 is_admin(): Check if user is admin (Security Critical)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- 2.2 delete_user_full(): Allow Admins to delete users completely
CREATE OR REPLACE FUNCTION public.delete_user_full(user_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;
  DELETE FROM auth.users WHERE id = user_id_input;
END;
$$;


-- ------------------------------------------------------------------------------
-- 3. FEATURE FUNCTIONS (Sharing Profile RPCs)
-- ------------------------------------------------------------------------------

-- 3.1 share_profiles_bulk(): Share ONE profile with MANY users (Direct Share)
-- Uses 'matches' table for compatibility
CREATE OR REPLACE FUNCTION public.share_profiles_bulk(
    target_user_ids UUID[],
    shared_profile_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    uid UUID;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;

    FOREACH uid IN ARRAY target_user_ids
    LOOP
        INSERT INTO public.matches (user_id, profile_id, status, created_at)
        VALUES (uid, shared_profile_id, 'shared', now())
        ON CONFLICT (user_id, profile_id) 
        DO UPDATE SET status = 'shared';
    END LOOP;
END;
$$;

-- 3.2 share_response_bulk(): Share MANY profiles with ONE user (Response to Request)
CREATE OR REPLACE FUNCTION public.share_response_bulk(
    target_user_id UUID,
    shared_profile_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pid UUID;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;

    FOREACH pid IN ARRAY shared_profile_ids
    LOOP
        INSERT INTO public.matches (user_id, profile_id, status, created_at)
        VALUES (target_user_id, pid, 'shared', now())
        ON CONFLICT (user_id, profile_id) 
        DO UPDATE SET status = 'shared';
    END LOOP;
END;
$$;

-- Grant Execution Permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_full(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.share_profiles_bulk(uuid[], uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.share_response_bulk(uuid, uuid[]) TO authenticated;


-- ------------------------------------------------------------------------------
-- 4. DATA INTEGRITY (Constraints & Foreign Keys)
-- ------------------------------------------------------------------------------

-- 4.1 Force ON DELETE CASCADE to prevent deletion errors
-- Profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Matches
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_user_id_fkey;
ALTER TABLE public.matches ADD CONSTRAINT matches_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_profile_id_fkey;
ALTER TABLE public.matches ADD CONSTRAINT matches_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Match Requests
ALTER TABLE public.match_requests DROP CONSTRAINT IF EXISTS match_requests_user_id_fkey;
ALTER TABLE public.match_requests ADD CONSTRAINT match_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4.2 Unique Constraint on Matches (for upsert/ON CONFLICT)
-- Clean duplicates first
DELETE FROM public.matches a USING public.matches b
WHERE a.id < b.id AND a.user_id = b.user_id AND a.profile_id = b.profile_id;

ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS unique_match_pair;
ALTER TABLE public.matches ADD CONSTRAINT unique_match_pair UNIQUE (user_id, profile_id);


-- ------------------------------------------------------------------------------
-- 5. SECURITY (Row Level Security & Policies)
-- ------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 5.1 Users Table
DROP POLICY IF EXISTS "Admin Full Access" ON public.users;
CREATE POLICY "Admin Full Access" ON public.users FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "User View Self" ON public.users;
CREATE POLICY "User View Self" ON public.users FOR SELECT USING (auth.uid() = id);

-- 5.2 Profiles Table
DROP POLICY IF EXISTS "Admin Full Access" ON public.profiles;
CREATE POLICY "Admin Full Access" ON public.profiles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "User View Own" ON public.profiles;
CREATE POLICY "User View Own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User Update Own" ON public.profiles;
CREATE POLICY "User Update Own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 5.3 Matches Table
DROP POLICY IF EXISTS "Admin Full Access" ON public.matches;
CREATE POLICY "Admin Full Access" ON public.matches FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "User View Own" ON public.matches;
CREATE POLICY "User View Own" ON public.matches FOR SELECT USING (auth.uid() = user_id);

-- 5.4 Match Requests Table
DROP POLICY IF EXISTS "Admin Full Access" ON public.match_requests;
CREATE POLICY "Admin Full Access" ON public.match_requests FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "User View Self" ON public.match_requests;
CREATE POLICY "User View Self" ON public.match_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User Create Self" ON public.match_requests;
CREATE POLICY "User Create Self" ON public.match_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5.5 App Settings Table
DROP POLICY IF EXISTS "Admin Full Access" ON public.app_settings;
CREATE POLICY "Admin Full Access" ON public.app_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public Read" ON public.app_settings;
CREATE POLICY "Public Read" ON public.app_settings FOR SELECT USING (true);
