-- ==============================================================================
-- SECURITY FIX: Enable RLS on Missing Tables
-- ==============================================================================

-- 1. Success Stories Table
CREATE TABLE IF NOT EXISTS public.success_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    names TEXT NOT NULL,
    year TEXT NOT NULL,
    story TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read (Everyone can view stories)
DROP POLICY IF EXISTS "Public Read Stories" ON public.success_stories;
CREATE POLICY "Public Read Stories" ON public.success_stories FOR SELECT USING (true);

-- Policy: Admin Manage (Admins can insert, update, delete)
DROP POLICY IF EXISTS "Admin Manage Stories" ON public.success_stories;
CREATE POLICY "Admin Manage Stories" ON public.success_stories FOR ALL USING (public.is_admin());


-- 2. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated Users can Insert (Send messages)
DROP POLICY IF EXISTS "Users Create Messages" ON public.contact_messages;
CREATE POLICY "Users Create Messages" ON public.contact_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admin Read (Admins can view messages)
DROP POLICY IF EXISTS "Admin Read Messages" ON public.contact_messages;
CREATE POLICY "Admin Read Messages" ON public.contact_messages FOR SELECT USING (public.is_admin());
