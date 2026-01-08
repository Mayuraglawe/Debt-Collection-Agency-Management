-- Atlas DCA - Seed Default Users
-- Migration: 003_seed_users
-- Description: Creates default user profiles for development and testing
-- NOTE: In production, these should be created manually via Supabase Auth Dashboard

-- =====================================================
-- DEFAULT USER PROFILES
-- =====================================================
-- These are profile records that will be linked to auth users
-- You need to create the actual auth users in Supabase Auth first, then run this script

-- IMPORTANT: This script assumes you've already created auth users in Supabase with these emails.
-- To create auth users:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" for each email below
-- 3. Set the passwords as specified
-- 4. Then run this migration to set up their profiles with roles

-- After creating auth users in Supabase Dashboard, update the UUIDs below with the actual user IDs

-- Example: If you want to insert profile data after auth users are created via Dashboard:
-- You can modify this script to use the auth.users table to get the IDs automatically

-- =====================================================
-- HELPER FUNCTION TO CREATE PROFILE IF AUTH USER EXISTS
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
    manager_id UUID;
    agent_id UUID;
    viewer_id UUID;
BEGIN
    -- Check if auth users exist and get their IDs
    -- Note: These emails must be created in Supabase Auth Dashboard first
    
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@atlasdca.com';
    SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@atlasdca.com';
    SELECT id INTO agent_id FROM auth.users WHERE email = 'agent@atlasdca.com';
    SELECT id INTO viewer_id FROM auth.users WHERE email = 'viewer@atlasdca.com';

    -- Create ADMIN profile if auth user exists
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
            department = 'Administration';
        
        RAISE NOTICE 'Created/Updated ADMIN profile for admin@atlasdca.com';
    ELSE
        RAISE NOTICE 'Auth user not found for admin@atlasdca.com - Please create via Supabase Dashboard first';
    END IF;

    -- Create MANAGER profile if auth user exists
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
            department = 'Operations';
        
        RAISE NOTICE 'Created/Updated MANAGER profile for manager@atlasdca.com';
    ELSE
        RAISE NOTICE 'Auth user not found for manager@atlasdca.com - Please create via Supabase Dashboard first';
    END IF;

    -- Create AGENT profile if auth user exists
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
            department = 'Collections';
        
        RAISE NOTICE 'Created/Updated AGENT profile for agent@atlasdca.com';
    ELSE
        RAISE NOTICE 'Auth user not found for agent@atlasdca.com - Please create via Supabase Dashboard first';
    END IF;

    -- Create VIEWER profile if auth user exists
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
            department = 'Analytics';
        
        RAISE NOTICE 'Created/Updated VIEWER profile for viewer@atlasdca.com';
    ELSE
        RAISE NOTICE 'Auth user not found for viewer@atlasdca.com - Please create via Supabase Dashboard first';
    END IF;

END $$;

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- DEFAULT USER CREDENTIALS (Create these in Supabase Dashboard):
-- 
-- 1. ADMIN Account:
--    Email: admin@atlasdca.com
--    Password: password123
--    
-- 2. MANAGER Account:
--    Email: manager@atlasdca.com
--    Password: password123
--    
-- 3. AGENT Account:
--    Email: agent@atlasdca.com
--    Password: password123
--    
-- 4. VIEWER Account:
--    Email: viewer@atlasdca.com
--    Password: password123
--
-- =====================================================
-- HOW TO USE THIS MIGRATION
-- =====================================================
--
-- Step 1: Create Auth Users via Supabase Dashboard
--   - Go to: Supabase Dashboard > Authentication > Users
--   - Click "Add user" button
--   - For each role, create a user with the email and password above
--   - Make sure to use the exact emails listed above
--
-- Step 2: Run this migration
--   - This script will automatically create profile records for each auth user
--   - It will assign the appropriate role to each profile
--
-- Step 3: Verify
--   - Check the profiles table to see the created users
--   - Try logging in with each account to test role-based access
--
-- =====================================================
