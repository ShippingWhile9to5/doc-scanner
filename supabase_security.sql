-- 1. Enable RLS on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: Allow users to view ONLY their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING ( auth.uid() = id );

-- 3. Create Policy: Allow users to update ONLY their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 4. Create Policy: Allow users to insert their *own* profile 
-- (This is a fallback, usually the Trigger handles generic creation, but robust apps allow this too)
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- 5. (Optional) Verify that Service Role (admin) bypasses this. 
-- (Supabase Service Role bypasses RLS by default, so no action needed).
