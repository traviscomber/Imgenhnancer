# Subscription Plans Implementation Status

## ✅ COMPLETED

### Phase 1: Core Constants Updated (lib/credits.ts)
- **SUBSCRIPTION_TIERS expanded** with all spec fields:
  - `creditsType`: "one_time" (free) | "monthly" (paid)
  - `billing`: "free" | "monthly" | "monthly_custom"
  - `batchLimit`: 0 (free/starter) | 20 (creator) | 100 (studio) | null (archive/custom)
  - `processingQueue`: "standard" | "priority" | "high_priority" | "highest_priority"
  - `support`: "none" | "email" | "priority_email" | "dedicated"
  - `teamWorkflow`: true/false (Archive only)
  - `invoicePayment`: true/false (Archive only)
  - `optionalApi`: true/false (Archive only)
  - `usageRights`: "personal" | "small_business" | "full_commercial" | "institutional"
  - `maxFileSizeNote`: "50MB+ available on request" (for Archive)

- **Archive plan ID fixed**: "business" → "archive_business"
- **Creator plan badge added**: "most_popular"
- **Credit costs verified**: x2=6, x3=8, x4=10 ✓
- **PAYG packs verified**: $5→50cr, $12→150cr, $29→450cr, $79→1500cr ✓

### Phase 2: Pricing Page Updated (app/pricing/page.tsx)
- **Removed duplicate FAQ rows** about x2/x3/x4 costs (now only in "How Credits Work" section)
- **Added imports**: `PAYG_CREDIT_PACKS`, `SUBSCRIPTION_TIERS` from lib/credits
- **PAYG section now uses constants**: dynamically renders from PAYG_CREDIT_PACKS
- **Updated upload limit FAQ**: Added "50MB+ available on request" for Archive

### Phase 3: Profile Page Updated (app/profile/page.tsx)
- **Added mock user fields**: `planId`, `maxUploadMb`, `batchLimit`, `supportLevel`
- **Ready for plan-specific feature display**: can now conditionally show batch processing, support level, etc.

---

## 🔄 IN PROGRESS / TO DO

### Phase 4: Pricing Section Component (components/pricing-section.tsx)
**Still needs:**
- Update PlanCard component to display new fields: batch_limit, support, billing type
- Remove redundant x2/x3/x4 mode cards if they duplicate FAQ
- Dynamically populate plans from SUBSCRIPTION_TIERS constant instead of hardcoded

### Phase 5: Pricing Page Comparison Table
**Still needs:**
- Add full plan comparison table showing:
  - Credits per month
  - Max upload size
  - Batch limit
  - Usage rights (personal / small business / commercial / institutional)
  - Processing queue priority
  - Support level
  - File storage (always "Not permanently stored" / "Temporary download window")

### Phase 6: Database & API Integration
**Still needs:**
- Supabase schema for `subscriptions`, `payg_transactions`, `users` tables
- API: `/api/plans` — GET all subscription tiers
- API: `/api/payg` — GET/POST PAYG credit packs
- Stripe checkout integration for subscriptions and PAYG
- Credit validation logic before processing

### Phase 7: Billing & Checkout UI
**Still needs:**
- Stripe Checkout page for plan upgrades
- PAYG purchase modal
- Invoice history page
- Plan downgrade flow

### Phase 8: Usage Enforcement
**Still needs:**
- File upload validation: check against `maxFileSize` per plan
- Batch processing validation: check against `batchLimit` per plan
- Credit validation: ensure sufficient credits before allowing enhancement
- Error messages with upgrade CTAs

---

## Database Schema (Recommended)

```sql
-- Users (extended)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  plan_id TEXT REFERENCES subscription_plans(id),
  monthly_credits_balance INT DEFAULT 0,
  monthly_credits_reset_at TIMESTAMP,
  payg_credits_balance INT DEFAULT 0,
  created_at TIMESTAMP
);

-- Subscription Plans (auto-generated from SUBSCRIPTION_TIERS constant)
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT,
  monthly_credits INT,
  price_monthly DECIMAL,
  max_file_size_mb INT,
  batch_limit INT,
  processing_queue TEXT,
  support_level TEXT
);

-- PAYG Transactions
CREATE TABLE payg_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  credits INT,
  price DECIMAL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Job History (metadata only, not images)
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  filename TEXT,
  preset TEXT,
  enhancement_mode TEXT,  -- "x2", "x3", "x4"
  credits_used INT,
  status TEXT,  -- "completed", "failed"
  created_at TIMESTAMP
);
```

---

## Key Implementation Notes

1. **Credit Types**: Free tier gets ONE-TIME 10 credits (never reset). Paid tiers get MONTHLY credits (reset on billing date).
2. **Archive Plan**: Special case with custom fields. Max upload "30MB+" means 30MB is guaranteed, but 50MB+ available by request.
3. **PAYG Behavior**: Purchased credits last 12 months from purchase. Used AFTER monthly credits run out.
4. **No Batch Endpoint Duplication**: x2/x3/x4 credit costs are core constants, displayed in "How Credits Work" section only.
5. **Plan-Specific Limits**: Each plan enforces different limits — validation should check against `SUBSCRIPTION_TIERS[planId]`.

---

## Files Modified

- ✅ `/lib/credits.ts` — Added all spec fields to SUBSCRIPTION_TIERS
- ✅ `/app/pricing/page.tsx` — Removed FAQ duplication, added constants import
- ✅ `/app/profile/page.tsx` — Added mock fields for plan limits

## Files To Modify Next

- `components/pricing-section.tsx` — Update to use constants, display full plan info
- `app/enhance/page.tsx` — Add validation against plan limits
- `app/api/checkout.ts` (new) — Stripe integration
- `app/api/credits/deduct.ts` (new) — Credit deduction logic

---

**Status**: Core spec alignment COMPLETE. Ready for UI component updates and API integration.
