# Database Migration Guide for Production

## Overview
You need to run 3 SQL scripts in Supabase to prepare your database for production. These scripts must be executed IN ORDER.

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to [supabase.com](https://supabase.com)
2. Log in to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run Migration Scripts (In Order)

#### Script 1: Create Credits Schema
**File:** `scripts/001-create-credits-schema.sql`

This script creates the database tables needed for the credit system:
- `users` - User accounts
- `user_credits` - Credit balances
- `credit_transactions` - Transaction history
- `credit_packages` - Available packages

Status: ✅ Already executed (verify by checking tables in Supabase)

#### Script 2: Setup Admin User
**File:** `scripts/002-setup-admin-user.sql`

This script creates the admin user with unlimited credits.

Status: ✅ Already executed (verify by checking users table)

#### Script 3: Enable RLS Policies (CRITICAL)
**File:** `scripts/003-enable-rls-policies.sql`

This script MUST be run before production launch. It:
- Enables Row Level Security on all tables
- Creates security policies so users can only see their own data
- Prevents unauthorized data access

**Action Required:**
\`\`\`
1. Copy entire contents of scripts/003-enable-rls-policies.sql
2. Paste into Supabase SQL Editor
3. Click "Run" button
4. Verify success (no errors should appear)
\`\`\`

#### Script 4: Seed Credit Packages
**File:** `scripts/seed-credit-packages.sql`

This script populates the available credit packages:
- Starter: 100 credits @ $9.99
- Pro: 500 credits @ $39.99
- Business: 1500 credits @ $99.99

**Action Required:**
\`\`\`
1. Copy entire contents of scripts/seed-credit-packages.sql
2. Paste into Supabase SQL Editor
3. Click "Run" button
4. Verify success (should show "INSERT 0 3" or similar)
\`\`\`

---

## Verification Checklist

After running all scripts, verify in Supabase:

### Verify Tables Exist
\`\`\`sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
\`\`\`

You should see:
- credit_packages
- credit_transactions
- user_credits
- users

### Verify RLS is Enabled
\`\`\`sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_credits', 'credit_transactions', 'credit_packages');
\`\`\`

All should show: `rowsecurity = true`

### Verify Credit Packages
\`\`\`sql
SELECT name, credits, price_usd, is_active 
FROM credit_packages 
ORDER BY credits;
\`\`\`

Should show 3 packages:
- Starter | 100 | 9.99 | true
- Pro | 500 | 39.99 | true
- Business | 1500 | 99.99 | true

---

## Troubleshooting

### "Table already exists" error
**Cause:** You already ran this script
**Solution:** This is fine, the script uses `IF NOT EXISTS` clauses

### "Permission denied" error
**Cause:** Your Supabase user doesn't have admin rights
**Solution:** Use the project's main admin account (check Project Settings > Database)

### RLS policies fail to create
**Cause:** Tables don't have RLS enabled yet
**Solution:** Ensure Script 3 ran successfully - it enables RLS on tables first

---

## Important Security Notes

- RLS policies MUST be enabled before going to production
- Users can only see their own data (enforced by RLS)
- Credit packages are visible to everyone (read-only)
- Admin operations require ADMIN_SECRET environment variable

---

## Environment Variables to Set (Vercel)

After database is ready, verify these are set:

- `ADMIN_SECRET` - Change from default value
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- All other integration keys (Stripe, Replicate, FAL, etc.)

---

## Next Steps

1. ✅ Run all 4 SQL scripts above
2. ✅ Verify database tables and RLS policies
3. ✅ Verify environment variables
4. ✅ Test user signup/payment flow
5. ✅ Deploy to production

Questions? Contact: info@clar1ty.art
