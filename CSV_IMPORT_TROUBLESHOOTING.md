# 🔧 CSV Import Troubleshooting Guide

## Quick Diagnosis Checklist

Run through this checklist to identify the issue:

- [ ] Edge Function deployed to Supabase
- [ ] Database migrations 001-008 executed
- [ ] Logged in as ADMIN or MANAGER
- [ ] CSV file format correct
- [ ] Browser console checked for errors
- [ ] Network tab shows API call

---

## Most Common Issues

### ❌ Issue 1: Edge Function Not Deployed

**Symptom**: Error message "Failed to process CSV" or network error

**Root Cause**: The `process-csv` Edge Function hasn't been deployed to Supabase

**Solution**:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
cd backend
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the Edge Function
supabase functions deploy process-csv

# Verify deployment
supabase functions list
```

**Expected Output**:
```
Deployed Functions:
├── process-csv (deployed)
```

---

### ❌ Issue 2: Missing Database Tables

**Symptom**: Error "relation 'csv_import_logs' does not exist"

**Root Cause**: Migration 008 not executed

**Solution**:

1. Go to Supabase Dashboard → SQL Editor
2. Open file: `backend/supabase/migrations/008_advanced_automation.sql`
3. Copy all contents
4. Paste in SQL Editor
5. Click "RUN"

**Verify**:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('csv_import_logs', 'allocation_rules', 'compliance_violations');
```

Should return 3 rows.

---

### ❌ Issue 3: Authentication/Authorization Error

**Symptom**: "Unauthorized" or "Access Denied"

**Root Cause**: User not logged in as ADMIN or MANAGER

**Solution**:

1. **Check current role**:
   ```sql
   SELECT email, role FROM profiles 
   WHERE email = 'your-email@example.com';
   ```

2. **Update role if needed**:
   ```sql
   UPDATE profiles 
   SET role = 'ADMIN' 
   WHERE email = 'admin@atlasdca.com';
   ```

3. **Sign out and sign back in**

---

### ❌ Issue 4: CORS Error

**Symptom**: "CORS policy" error in browser console

**Root Cause**: Edge Function not handling CORS properly

**Check**:
```typescript
// Verify in backend/supabase/functions/process-csv/index.ts
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Redeploy** if missing:
```bash
supabase functions deploy process-csv
```

---

### ❌ Issue 5: Incorrect CSV Format

**Symptom**: Import succeeds but 0 rows imported

**Root Cause**: CSV column names don't match expected format

**Correct Format**:
```csv
Name,Email,Phone,Amount
John Doe,john@example.com,9876543210,50000
Jane Smith,jane@example.com,9876543211,75000
```

**Auto-Mapping Keywords**:
- `name` → `full_name`
- `email` → `email`
- `phone` or `mobile` → `phone`
- `amount` or `debt` → `amount`

---

### ❌ Issue 6: Supabase Environment Variables

**Symptom**: Edge Function errors about missing URL or keys

**Root Cause**: Environment variables not set in Edge Function

**Solution**:

Edge Functions automatically have these variables:
- `SUPABASE_URL` → Your project URL
- `SUPABASE_ANON_KEY` → Anon key
- `SUPABASE_SERVICE_ROLE_KEY` → Service role key

**Verify in Supabase Dashboard**:
1. Settings → API
2. Copy Project URL and keys
3. Check they match your `.env.local`

---

## Step-by-Step Debugging

### Step 1: Check Browser Console

Open Developer Tools (F12) and check for errors:

```javascript
// Expected console logs during import:
⏳ Processing: 10% (1/3 rows)
⏳ Processing: 33% (2/3 rows)
⏳ Processing: 100% (3/3 rows)
```

**If you see errors**:
- Network error → Edge Function not deployed
- CORS error → Redeploy Edge Function
- Unauthorized → Role issue

---

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Click "Import" button
3. Look for request to `/functions/v1/process-csv`

**Expected**:
- Status: 200 OK
- Response: `{"success": true, "successCount": 3, ...}`

**If 404**:
- Edge Function not deployed

**If 500**:
- Check Edge Function logs in Supabase

---

### Step 3: Check Edge Function Logs

1. Supabase Dashboard → Edge Functions
2. Click on `process-csv`
3. Click "Logs" tab
4. Look for recent invocations

**Expected logs**:
```
Progress: 33% (1/3 rows)
Progress: 66% (2/3 rows)
Progress: 100% (3/3 rows)
```

---

### Step 4: Test with Sample CSV

Create `test.csv`:
```csv
Name,Email,Phone,Amount
Test User 1,test1@example.com,9876543210,150000
Test User 2,test2@example.com,9876543211,75000
Test User 3,test3@example.com,9876543212,200000
```

Upload and check database:
```sql
SELECT full_name, email, amount FROM debtors 
WHERE email LIKE '%test%@example.com';

-- Should return 3 rows
```

---

## Complete Setup Guide

If nothing works, start from scratch:

### 1. Database Setup

```bash
# Run ALL migrations in order
cd backend/supabase/migrations
```

Execute in Supabase SQL Editor:
1. `001_initial_schema.sql`
2. `002_seed_data.sql`
3. `003_seed_users.sql`
4. `004_complete_auth_setup.sql`
5. `005_workflow_schema.sql`
6. `006_admin_support_tables.sql`
7. `007_seed_test_data.sql`
8. `008_advanced_automation.sql` ← **Critical for CSV import**

### 2. Edge Function Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
cd backend
supabase link --project-ref YOUR_PROJECT_REF

# Deploy function
supabase functions deploy process-csv

# Verify
supabase functions list
```

### 3. Create Admin User

```sql
-- Create admin user in Supabase Dashboard → Authentication
-- Email: admin@atlasdca.com
-- Password: Admin@123
-- Auto-confirm: YES

-- Verify profile exists with ADMIN role
SELECT email, role FROM profiles WHERE email = 'admin@atlasdca.com';

-- If not ADMIN, update:
UPDATE profiles SET role = 'ADMIN' WHERE email = 'admin@atlasdca.com';
```

### 4. Test Import

1. Login as `admin@atlasdca.com`
2. Navigate to `/admin/data-ingestion`
3. Upload test CSV
4. Check for errors in console
5. Verify data in database

---

## Get Help

### Check These Files

- `TESTING_WORKFLOW.md` - Test scenario for CSV import
- `SETUP_USERS.md` - User setup guide
- Edge Function: `backend/supabase/functions/process-csv/index.ts`
- Database migration: `backend/supabase/migrations/008_advanced_automation.sql`

### Common Commands

```bash
# Check Supabase project status
supabase status

# View Edge Function logs
supabase functions logs process-csv --tail

# Test Edge Function locally (advanced)
supabase functions serve process-csv
```

---

## Success Checklist

When CSV import is working correctly:

- ✅ No console errors
- ✅ Progress logs appear every 500ms
- ✅ Import completes with success message
- ✅ Data appears in `debtors` table
- ✅ Cases created in `workflow_cases` table
- ✅ Import log in `csv_import_logs` table

**Still not working?** Check the Edge Function logs in Supabase Dashboard for detailed error messages.
