# Troubleshooting Login Issues

## Problem: Only Admin Can Login

If you're experiencing issues where only the admin account can log in but other accounts (manager, agent, viewer) cannot, follow these steps:

### Quick Fix Steps

#### Step 1: Verify Auth Users Were Created

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Check that all 4 users are listed:
   - admin@atlasdca.com ✅
   - manager@atlasdca.com ❓
   - agent@atlasdca.com ❓
   - viewer@atlasdca.com ❓
3. Make sure all have "Confirmed" status (green checkmark)

#### Step 2: Check Profile Records

1. Go to Supabase Dashboard → **Database** → **Tables** → **profiles**
2. You should see 4 rows, one for each user
3. If rows are missing, the migration didn't run properly

#### Step 3: Run the Profile Migration

If profiles are missing, run this in Supabase SQL Editor:

```sql
-- Check which auth users exist
SELECT id, email FROM auth.users 
WHERE email IN ('admin@atlasdca.com', 'manager@atlasdca.com', 'agent@atlasdca.com', 'viewer@atlasdca.com');
```

Then run the full migration from `backend/supabase/migrations/003_seed_users.sql`

#### Step 4: Manual Profile Creation (If Migration Fails)

If the migration doesn't work, manually create profiles:

```sql
-- For manager
INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
SELECT id, email, 'Manager User', 'MANAGER', 'Operations', true
FROM auth.users WHERE email = 'manager@atlasdca.com'
ON CONFLICT (id) DO UPDATE SET role = 'MANAGER';

-- For agent
INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
SELECT id, email, 'Agent User', 'AGENT', 'Collections', true
FROM auth.users WHERE email = 'agent@atlasdca.com'
ON CONFLICT (id) DO UPDATE SET role = 'AGENT';

-- For viewer
INSERT INTO public.profiles (id, email, full_name, role, department, is_active)
SELECT id, email, 'Viewer User', 'VIEWER', 'Analytics', true
FROM auth.users WHERE email = 'viewer@atlasdca.com'
ON CONFLICT (id) DO UPDATE SET role = 'VIEWER';
```

#### Step 5: Verify Profile Creation

```sql
-- Check all profiles
SELECT id, email, full_name, role FROM public.profiles;
```

You should see all 4 users with their correct roles.

#### Step 6: Test Login Again

1. Clear browser cache and localStorage
2. Try logging in with each account
3. Check browser console for errors (F12 → Console tab)

### Common Issues

#### Issue 1: "Invalid email or password"

**Causes:**
- Auth user doesn't exist in Supabase
- Password is incorrect
- User is not confirmed

**Solution:**
1. Verify the email and password are exactly correct (case-sensitive!)
2. Check "Auto Confirm User" was enabled when creating
3. Try resetting password via forgot password flow

#### Issue 2: Login succeeds but redirects to sign-in

**Causes:**
- Profile record doesn't exist
- Profile exists but role is NULL

**Solution:**
Run Step 4 above to create missing profiles

#### Issue 3: "Session expired" immediately

**Causes:**
- Browser blocking cookies
- localStorage issues

**Solution:**
1. Check browser allows cookies for localhost
2. Clear localStorage: `localStorage.clear()` in browser console
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Debug Commands

Run these in browser console (F12) after attempting login:

```javascript
// Check if user is authenticated
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check profile data
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'manager@atlasdca.com')
  .single();
console.log('Profile:', profile);
```

### Still Having Issues?

1. **Check network tab** (F12 → Network) for failed requests
2. **Check console** (F12 → Console) for error messages
3. **Verify environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` is correct
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
4. **Restart frontend**: `npm run dev`

### Complete Reset (Nuclear Option)

If nothing works, start fresh:

```sql
-- Delete all profiles
DELETE FROM public.profiles;

-- Delete all auth users (Supabase Dashboard)
-- Then recreate everything following SETUP_USERS.md
```

## Quick Test Script

Copy and run this in Supabase SQL Editor to check everything:

```sql
-- Comprehensive check
SELECT 
    u.email,
    u.confirmed_at IS NOT NULL as is_confirmed,
    p.id IS NOT NULL as has_profile,
    p.role,
    p.is_active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN (
    'admin@atlasdca.com',
    'manager@atlasdca.com', 
    'agent@atlasdca.com',
    'viewer@atlasdca.com'
)
ORDER BY u.email;
```

Expected output: All users should have `is_confirmed=true`, `has_profile=true`, and correct roles assigned.
