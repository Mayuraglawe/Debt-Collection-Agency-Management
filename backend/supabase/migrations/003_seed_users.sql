-- Atlas DCA - Seed Default User Profiles
-- Migration: 003_seed_users
-- Description: Creates profile records for users created via Supabase Auth Dashboard

-- =====================================================
-- IMPORTANT: CREATE AUTH USERS FIRST VIA SUPABASE DASHBOARD!
-- =====================================================
-- 
-- This script ONLY creates PROFILE records in the public.profiles table.
-- You MUST create the actual auth users in Supabase Dashboard FIRST:
-- 
-- 1. Go to: Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter email, password, and CHECK "Auto Confirm User"
-- 
-- Create these 4 users:
--   Email: admin@atlasdca.com     Password: password123
--   Email: manager@atlasdca.com   Password: password123
--   Email: agent@atlasdca.com     Password: password123
--   Email: viewer@atlasdca.com    Password: password123
--
-- AFTER creating auth users, run this script to create their profiles.
-- =====================================================

-- Create profiles for any existing auth users
DO $$
DECLARE
    admin_id UUID;
    manager_id UUID;
    agent_id UUID;
    viewer_id UUID;
    users_found INTEGER := 0;
BEGIN
    -- Get auth user IDs (these must exist in auth.users first)
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@atlasdca.com';
    SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@atlasdca.com';
    SELECT id INTO agent_id FROM auth.users WHERE email = 'agent@atlasdca.com';
    SELECT id INTO viewer_id FROM auth.users WHERE email = 'viewer@atlasdca.com';

    -- Create ADMIN profile
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (admin_id, 'admin@atlasdca.com', 'Admin User', 'ADMIN', 'Administration', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'ADMIN',
            full_name = 'Admin User',
            department = 'Administration',
            email = 'admin@atlasdca.com';
        users_found := users_found + 1;
        RAISE NOTICE '✓ Created/Updated ADMIN profile for admin@atlasdca.com';
    ELSE
        RAISE NOTICE '✗ Auth user NOT FOUND: admin@atlasdca.com - Create via Dashboard first';
    END IF;

    -- Create MANAGER profile
    IF manager_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (manager_id, 'manager@atlasdca.com', 'Manager User', 'MANAGER', 'Operations', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'MANAGER',
            full_name = 'Manager User',
            department = 'Operations',
            email = 'manager@atlasdca.com';
        users_found := users_found + 1;
        RAISE NOTICE '✓ Created/Updated MANAGER profile for manager@atlasdca.com';
    ELSE
        RAISE NOTICE '✗ Auth user NOT FOUND: manager@atlasdca.com - Create via Dashboard first';
    END IF;

    -- Create AGENT profile
    IF agent_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (agent_id, 'agent@atlasdca.com', 'Agent User', 'AGENT', 'Collections', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'AGENT',
            full_name = 'Agent User',
            department = 'Collections',
            email = 'agent@atlasdca.com';
        users_found := users_found + 1;
        RAISE NOTICE '✓ Created/Updated AGENT profile for agent@atlasdca.com';
    ELSE
        RAISE NOTICE '✗ Auth user NOT FOUND: agent@atlasdca.com - Create via Dashboard first';
    END IF;

    -- Create VIEWER profile
    IF viewer_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
        VALUES (viewer_id, 'viewer@atlasdca.com', 'Viewer User', 'VIEWER', 'Analytics', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'VIEWER',
            full_name = 'Viewer User',
            department = 'Analytics',
            email = 'viewer@atlasdca.com';
        users_found := users_found + 1;
        RAISE NOTICE '✓ Created/Updated VIEWER profile for viewer@atlasdca.com';
    ELSE
        RAISE NOTICE '✗ Auth user NOT FOUND: viewer@atlasdca.com - Create via Dashboard first';
    END IF;

    -- Summary
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUMMARY: % of 4 user profiles created/updated', users_found;
    IF users_found < 4 THEN
        RAISE NOTICE 'Missing users must be created via Supabase Dashboard first!';
    ELSE
        RAISE NOTICE 'All profiles are ready. You can now log in.';
    END IF;
    RAISE NOTICE '========================================';
END $$;

-- Verify the profiles that were created
SELECT 
    p.email,
    p.full_name,
    p.role,
    p.department,
    p.is_active,
    CASE WHEN au.id IS NOT NULL THEN 'Yes' ELSE 'No' END as auth_user_exists,
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN 'Confirmed' ELSE 'Not Confirmed' END as email_status
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email LIKE '%@atlasdca.com'
ORDER BY p.role;
