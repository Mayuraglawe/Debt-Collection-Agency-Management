# Test User Credentials - Quick Reference

## 🔑 All Accounts (Same Password)

**Password for all accounts:** `password123`

---

### Admin Account
- **Email:** `admin@atlasdca.com`
- **Password:** `password123`
- **Role:** ADMIN
- **Access:** Full system access

### Manager Account
- **Email:** `manager@atlasdca.com`
- **Password:** `password123`
- **Role:** MANAGER
- **Access:** Elevated permissions

### Agent Account (Default)
- **Email:** `agent@atlasdca.com`
- **Password:** `password123`
- **Role:** AGENT
- **Access:** Standard user

### Viewer Account
- **Email:** `viewer@atlasdca.com`
- **Password:** `password123`
- **Role:** VIEWER
- **Access:** Read-only

---

## 🚀 Quick Setup

1. **Create users in Supabase Dashboard:**
   - Go to: Authentication > Users > Add user
   - Use emails above with password: `password123`
   - Check "Auto Confirm User" for each

2. **Run SQL migration:**
   - Copy `backend/supabase/migrations/003_seed_users.sql`
   - Paste in Supabase SQL Editor
   - Click "Run"

3. **Test login:**
   - Visit: `http://localhost:3000/sign-in`
   - Login with any account above

---

## 📝 Copy-Paste Ready

```
admin@atlasdca.com | password123
manager@atlasdca.com | password123
agent@atlasdca.com | password123
viewer@atlasdca.com | password123
```

⚠️ **Note:** These are development credentials only. Change passwords in production!
