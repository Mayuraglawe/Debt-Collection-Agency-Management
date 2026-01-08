# Quick Start: User Setup

## 🚀 Fastest Way to Get Started

### 1. Create Auth Users in Supabase Dashboard

Go to: **Supabase Dashboard → Authentication → Users → Add User**

Create these 4 accounts (click "Auto Confirm User" for each):

```
✅ admin@atlasdca.com     | password123  | ADMIN role
✅ manager@atlasdca.com   | password123  | MANAGER role  
✅ agent@atlasdca.com     | password123  | AGENT role
✅ viewer@atlasdca.com    | password123  | VIEWER role
```

### 2. Run the Profile Migration

**In Supabase SQL Editor:**
```sql
-- Copy and paste the contents of:
backend/supabase/migrations/003_seed_users.sql
```

**OR via CLI:**
```bash
cd backend
supabase db push
```

### 3. Test Login

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3000/sign-in`

Login with any account above to test! 🎉

---

**Full documentation:** See [SETUP_USERS.md](./SETUP_USERS.md) for detailed instructions and troubleshooting.
