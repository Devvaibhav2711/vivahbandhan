-- Enable Read Access for All Authenticated Users
-- This allows any logged-in user to view the 'profiles' table,
-- which is necessary for the "All Profiles" page to work.

-- 1. Drop existing restrictive policies if necessary (Safety first, though usually multiple policies are OR'ed)
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

-- 2. Create the new permissive policy
-- This policy allows any user with the 'authenticated' role (logged in) to SELECT (read) any row in 'profiles'.
create policy "Allow all authenticated users to view profiles"
on profiles for select
to authenticated
using ( true );

-- 3. (Optional) If you want truly public (unauthenticated) access, use 'anon' as well:
-- create policy "Allow public to view profiles"
-- on profiles for select
-- to anon
-- using ( true );
