-- =====================================================
-- Atlas DCA - Complete Authentication Setup
-- =====================================================
-- This migration sets up everything needed for authentication:
-- 1. Ensures profiles table exists
-- 2. Creates trigger to auto-create profiles for new auth users
-- 3. Seeds default test user profiles
-- 
-- Run this AFTER creating auth users in Supabase Dashboard
-- =====================================================

-- =====================================================
-- PART 1: Ensure Profiles Table Exists
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'AGENT',
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: Create Trigger for Auto Profile Creation
-- =====================================================

-- Function to create profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'AGENT',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 3: Create Default Test User Profiles
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
    manager_id UUID;
    agent_id UUID;
    viewer_id UUID;
    profile_count INT;
BEGIN
    -- Get auth user IDs
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@atlasdca.com';
    SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@atlasdca.com';
    SELECT id INTO agent_id FROM auth.users WHERE email = 'agent@atlasdca.com';
    SELECT id INTO viewer_id FROM auth.users WHERE email = 'viewer@atlasdca.com';

    -- Create/Update ADMIN profile
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (
            admin_id,
            'admin@atlasdca.com',
            'Admin User',
            'ADMIN',
            'Administration',
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'ADMIN',
            full_name = 'Admin User',
            department = 'Administration',
            is_active = true;
        
        RAISE NOTICE '✓ Created/Updated ADMIN profile for admin@atlasdca.com';
    ELSE
        RAISE WARNING '✗ Auth user NOT FOUND for admin@atlasdca.com';
    END IF;

    -- Create/Update MANAGER profile
    IF manager_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (
            manager_id,
            'manager@atlasdca.com',
            'Manager User',
            'MANAGER',
            'Operations',
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'MANAGER',
            full_name = 'Manager User',
            department = 'Operations',
            is_active = true;
        
        RAISE NOTICE '✓ Created/Updated MANAGER profile for manager@atlasdca.com';
    ELSE
        RAISE WARNING '✗ Auth user NOT FOUND for manager@atlasdca.com';
    END IF;

    -- Create/Update AGENT profile
    IF agent_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (
            agent_id,
            'agent@atlasdca.com',
            'Agent User',
            'AGENT',
            'Collections',
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'AGENT',
            full_name = 'Agent User',
            department = 'Collections',
            is_active = true;
        
        RAISE NOTICE '✓ Created/Updated AGENT profile for agent@atlasdca.com';
    ELSE
        RAISE WARNING '✗ Auth user NOT FOUND for agent@atlasdca.com';
    END IF;

    -- Create/Update VIEWER profile
    IF viewer_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (
            viewer_id,
            'viewer@atlasdca.com',
            'Viewer User',
            'VIEWER',
            'Analytics',
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'VIEWER',
            full_name = 'Viewer User',
            department = 'Analytics',
            is_active = true;
        
        RAISE NOTICE '✓ Created/Updated VIEWER profile for viewer@atlasdca.com';
    ELSE
        RAISE WARNING '✗ Auth user NOT FOUND for viewer@atlasdca.com';
    END IF;

    -- Count total profiles created
    SELECT COUNT(*) INTO profile_count FROM public.profiles 
    WHERE email IN ('admin@atlasdca.com', 'manager@atlasdca.com', 'agent@atlasdca.com', 'viewer@atlasdca.com');
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Total profiles created: % / 4', profile_count;
    RAISE NOTICE '====================================';
    
    IF profile_count < 4 THEN
        RAISE WARNING 'Some auth users are missing! Please create them in Supabase Dashboard first.';
        RAISE NOTICE 'Go to: Authentication > Users > Add user';
        RAISE NOTICE 'Create users with these emails and password: password123';
        RAISE NOTICE '  - admin@atlasdca.com';
        RAISE NOTICE '  - manager@atlasdca.com';
        RAISE NOTICE '  - agent@atlasdca.com';
        RAISE NOTICE '  - viewer@atlasdca.com';
        RAISE NOTICE 'Then run this migration again.';
    ELSE
        RAISE NOTICE 'All 4 test users are ready! ✓';
        RAISE NOTICE 'You can now login at: http://localhost:3000/sign-in';
    END IF;

END $$;

-- =====================================================
-- PART 4: Verification Query
-- =====================================================

-- Check setup status
DO $$
DECLARE
    result RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'VERIFICATION RESULTS';
    RAISE NOTICE '====================================';
    
    FOR result IN 
        SELECT 
            u.email,
            CASE WHEN u.confirmed_at IS NOT NULL THEN '✓' ELSE '✗' END as confirmed,
            CASE WHEN p.id IS NOT NULL THEN '✓' ELSE '✗' END as has_profile,
            COALESCE(p.role::TEXT, 'NONE') as role,
            CASE WHEN p.is_active THEN '✓' ELSE '✗' END as active
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE u.email IN (
            'admin@atlasdca.com',
            'manager@atlasdca.com', 
            'agent@atlasdca.com',
            'viewer@atlasdca.com'
        )
        ORDER BY u.email
    LOOP
        RAISE NOTICE '% | Confirmed: % | Profile: % | Role: % | Active: %',
            LPAD(result.email, 25),
            result.confirmed,
            result.has_profile,
            RPAD(result.role, 8),
            result.active;
    END LOOP;
    
    RAISE NOTICE '====================================';
END $$;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
--
-- STEP 1: Create Auth Users in Supabase Dashboard
--   → Go to: Authentication > Users > "Add user"
--   → Create these 4 accounts (check "Auto Confirm User"):
--
--   Email: admin@atlasdca.com     | Password: password123
--   Email: manager@atlasdca.com   | Password: password123
--   Email: agent@atlasdca.com     | Password: password123
--   Email: viewer@atlasdca.com    | Password: password123
--
-- STEP 2: Run This Migration
--   → Copy this entire file
--   → Paste in Supabase SQL Editor
--   → Click "Run"
--   → Check the output messages
--
-- STEP 3: Test Login
--   → Visit: http://localhost:3000/sign-in
--   → Login with any account above
--   → Check navbar for correct role badge
--
-- =====================================================
