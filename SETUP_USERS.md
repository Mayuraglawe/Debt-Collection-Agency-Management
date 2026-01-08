# Setting Up Default Test Users

This guide will help you create test users with different roles for the Atlas DCA application.

## Default User Accounts

We have 4 test accounts, one for each role:

| Role | Email | Password | Department |
|------|-------|----------|------------|
| ADMIN | admin@atlasdca.com | password123 | Administration |
| MANAGER | manager@atlasdca.com | password123 | Operations |
| AGENT | agent@atlasdca.com | password123 | Collections |
| VIEWER | viewer@atlasdca.com | password123 | Analytics |

## Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to your Supabase project: https://app.supabase.com
2. Select your Atlas DCA project
3. Navigate to **Authentication** > **Users** in the left sidebar

### Step 2: Create Auth Users

For each role listed above:

1. Click the **"Add user"** button
2. Fill in the form:
   - **Email**: Use the email from the table above
   - **Password**: Use the password from the table above
   - **Auto Confirm User**: ✅ Check this box (skip email verification for testing)
3. Click **"Create user"**
4. Repeat for all 4 accounts

### Step 3: Run the Profile Migration

The profiles with roles will be automatically created! You have two options:

#### Option A: Via Supabase SQL Editor

1. In Supabase Dashboard, go to **SQL Editor**
2. Open the file: `backend/supabase/migrations/003_seed_users.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **"Run"**
6. Check the output - you should see success messages for each profile

#### Option B: Via Supabase CLI (if using local development)

```bash
cd backend
supabase db push
```

### Step 4: Verify Setup

1. Go to **Database** > **Tables** > **profiles** in Supabase Dashboard
2. You should see 4 profile records with different roles
3. Each profile should be linked to the corresponding auth user

### Step 5: Test Login

1. Start your frontend application:
   ```bash
   cd frontend
   npm run dev
   ```

2. Visit http://localhost:3000/sign-in

3. Test each account:
   - Login with `admin@atlasdca.com` → Should see **ADMIN** badge in navbar
   - Login with `manager@atlasdca.com` → Should see **MANAGER** badge in navbar
   - Login with `agent@atlasdca.com` → Should see **AGENT** badge in navbar
   - Login with `viewer@atlasdca.com` → Should see **VIEWER** badge in navbar

## Role Capabilities

### ADMIN
- Full system access
- Can manage all users, cases, and settings
- Can modify compliance rules and templates
- Can view all analytics and reports

### MANAGER
- Elevated permissions
- Can manage cases and assign agents
- Can modify compliance rules and templates
- Can view analytics and reports

### AGENT (Default)
- Standard user access
- Can view and work on assigned cases
- Can update case information
- Limited analytics access

### VIEWER
- Read-only access
- Can view cases and analytics
- Cannot modify any data
- Useful for stakeholders and reporting

## Troubleshooting

### Issue: "Auth user not found" error when running migration

**Solution**: Make sure you created the auth users in Supabase Dashboard FIRST before running the migration script.

### Issue: Profile created but role is still 'AGENT'

**Solution**: Run the migration script again. It will update existing profiles with the correct roles.

### Issue: Can't login with test accounts

**Solution**: 
1. Check that you clicked "Auto Confirm User" when creating the accounts
2. Verify the password matches exactly (case-sensitive)
3. Check browser console for error messages

### Issue: Role badge showing incorrect role

**Solution**:
1. Sign out and sign back in
2. Check the profiles table in Supabase to verify the role is correct
3. Clear browser cache and local storage

## Alternative: Create Users via Frontend

If you prefer to create users through the app:

1. Visit http://localhost:3000/sign-up
2. Create an account normally
3. Go to Supabase Dashboard > Database > Tables > profiles
4. Find your user and manually update the `role` column
5. Sign out and back in to see the new role

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION**:
- These default accounts are for **DEVELOPMENT/TESTING ONLY**
- Delete or change passwords before deploying to production
- Use strong, unique passwords in production
- Consider implementing email verification for production users
- Set up proper role assignment workflows for production

## Next Steps

Once users are set up:
1. Test role-based access control
2. Verify that role guards work correctly
3. Check that admin-only features are hidden from non-admin users
4. Test the complete authentication flow

Need help? Check the main [walkthrough.md](walkthrough.md) for more details on the authentication system.
