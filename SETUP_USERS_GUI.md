# Option 1: Create Users via Supabase Dashboard (Visual Guide)

This guide walks you through creating users directly in the Supabase Dashboard GUI.

## Step-by-Step Visual Guide

### Step 1: Access Supabase Dashboard

1. **Navigate to Supabase**
   - Go to: https://app.supabase.com
   - Sign in with your Supabase account

2. **Select Your Project**
   - Click on your Atlas DCA project from the project list
   - You should see your project dashboard

### Step 2: Navigate to Authentication

1. **Open Authentication Section**
   - In the left sidebar, find **"Authentication"**
   - Click on **"Users"** under the Authentication menu
   - You'll see a list of existing users (if any)

### Step 3: Create Admin User

1. **Click "Add user" button** (top right)

2. **Fill in the form:**
   ```
   Email: admin@atlasdca.com
   Password: Atlas2025Admin!
   ```

3. **Important Settings:**
   - ✅ Check **"Auto Confirm User"** (skips email verification)
   - Leave other fields as default

4. **Click "Create user"**

5. **Update Role in Profiles Table:**
   - Go to **Database** → **Tables** → **profiles**
   - Find the newly created user (search by email)
   - Click on the row to edit
   - Change **role** column from `AGENT` to `ADMIN`
   - Click **Save**

### Step 4: Create Manager User

Repeat Step 3 with these credentials:

```
Email: manager@atlasdca.com
Password: Atlas2025Manager!
Auto Confirm: ✅ Yes

After creation:
→ Go to profiles table
→ Change role to: MANAGER
```

### Step 5: Create Agent User

Repeat Step 3 with these credentials:

```
Email: agent@atlasdca.com
Password: Atlas2025Agent!
Auto Confirm: ✅ Yes

After creation:
→ Go to profiles table
→ Change role to: AGENT (default, no change needed)
```

### Step 6: Create Viewer User

Repeat Step 3 with these credentials:

```
Email: viewer@atlasdca.com
Password: Atlas2025Viewer!
Auto Confirm: ✅ Yes

After creation:
→ Go to profiles table
→ Change role to: VIEWER
```

## Visual Reference

### Where to Find "Add User" Button
```
Authentication > Users
┌─────────────────────────────────────────────────┐
│ Users                              [+ Add user] │ ← Click here
├─────────────────────────────────────────────────┤
│ Email                 │ Created    │ Actions   │
│ ─────────────────────────────────────────────── │
│ (your users appear here)                       │
└─────────────────────────────────────────────────┘
```

### Add User Form
```
┌─────────────────────────────────────┐
│ Add user                        [×] │
├─────────────────────────────────────┤
│ Email *                             │
│ [admin@atlasdca.com            ]    │
│                                     │
│ Password *                          │
│ [Atlas2025Admin!               ]    │
│                                     │
│ ☑ Auto Confirm User                │
│   (Skip email verification)         │
│                                     │
│ Metadata (optional)                 │
│ {...}                               │
│                                     │
│           [Cancel] [Create user]    │
└─────────────────────────────────────┘
```

### Updating Role in Profiles Table
```
Database > Tables > profiles
┌──────────────────────────────────────────────────┐
│ id (UUID)  │ email              │ role   │ ...   │
├──────────────────────────────────────────────────┤
│ abc123...  │ admin@atlasdca.com │ AGENT  │← Edit │
└──────────────────────────────────────────────────┘

Click the row → Edit mode
Change: role = 'ADMIN'
Click: Save
```

## All User Accounts Summary

After completing all steps, you should have:

| # | Email | Password | Role | Auto-Confirm |
|---|-------|----------|------|--------------|
| 1 | admin@atlasdca.com | Atlas2025Admin! | ADMIN | ✅ |
| 2 | manager@atlasdca.com | Atlas2025Manager! | MANAGER | ✅ |
| 3 | agent@atlasdca.com | Atlas2025Agent! | AGENT | ✅ |
| 4 | viewer@atlasdca.com | Atlas2025Viewer! | VIEWER | ✅ |

## Verification Checklist

After creating all users:

- [ ] 4 users visible in **Authentication > Users**
- [ ] All users show "Confirmed" status (green checkmark)
- [ ] 4 profile records in **Database > Tables > profiles**
- [ ] Each profile has the correct role assigned
- [ ] Can login at `http://localhost:3000/sign-in` with each account
- [ ] Navbar shows correct role badge for each user

## Troubleshooting

### Issue: "Email already exists"
**Solution**: A user with that email already exists. Either delete the existing user or use a different email.

### Issue: Can't see "Add user" button
**Solution**: Check that you have the correct permissions in your Supabase project. You need to be a project owner or admin.

### Issue: User created but no profile record
**Solution**: The profile should auto-create via database trigger. If not:
1. Go to **SQL Editor**
2. Run this manually:
```sql
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Admin User', 'ADMIN', true
FROM auth.users
WHERE email = 'admin@atlasdca.com';
```

### Issue: Profile exists but role won't update
**Solution**: Check RLS policies. You may need to temporarily disable RLS or update via SQL:
```sql
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'admin@atlasdca.com';
```

## Alternative: Bulk Create via SQL

If you prefer to create all users at once via SQL:

```sql
-- Note: This only works if Supabase allows auth user creation via SQL
-- Otherwise, use the dashboard method above

-- For profiles (after creating auth users):
UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'admin@atlasdca.com';
UPDATE public.profiles SET role = 'MANAGER' WHERE email = 'manager@atlasdca.com';
UPDATE public.profiles SET role = 'AGENT' WHERE email = 'agent@atlasdca.com';
UPDATE public.profiles SET role = 'VIEWER' WHERE email = 'viewer@atlasdca.com';
```

## Pros & Cons vs Other Options

### ✅ Pros
- Visual, easy to follow
- No SQL knowledge required
- Immediate feedback
- Good for creating one-off users

### ⚠️ Cons
- Manual process, time-consuming for multiple users
- Need to update roles separately in profiles table
- Not repeatable (can't version control)
- Harder to replicate across environments

**Recommendation**: Use this method for learning or creating individual users. For team development, use the SQL script approach (Option 3) for reproducibility.

---

**Next**: After creating users, test the authentication flow at http://localhost:3000/sign-in
