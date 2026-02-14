# PRODUCTION DEPLOYMENT CHECKLIST

## Critical (Must Complete Before Launch)

### Database Security
- [ ] Run `scripts/001-create-credits-schema.sql` (if not already run)
- [ ] Run `scripts/002-setup-admin-user.sql` (if not already run)
- [ ] **Run `scripts/003-enable-rls-policies.sql` - CRITICAL FOR SECURITY**
- [ ] Verify RLS is enabled on all tables in Supabase
- [ ] Run `scripts/seed-credit-packages.sql` to populate packages
- [ ] Verify packages appear in database

### Environment Variables
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://clar1ty.art` (or your domain)
- [ ] Change `ADMIN_SECRET` from default value
- [ ] Verify all 13 Supabase variables are set
- [ ] Verify Stripe keys are production keys (not test keys)
- [ ] Verify Replicate API token is valid
- [ ] Verify FAL API key is valid
- [ ] Verify OpenAI API key is valid

### Payment System
- [ ] Test crypto payment flow with test amount
- [ ] Verify WhatsApp notifications work (+56940946660)
- [ ] Test admin payment approval workflow
- [ ] Verify credits are added correctly after approval
- [ ] Test all three package tiers (Starter, Pro, Business)
- [ ] Verify Stripe webhooks are configured correctly

### User Journey Testing
- [ ] New user signup → 50 credits awarded
- [ ] Upload image and enhance (uses 6 credits)
- [ ] Free user restricted to 2x upscale
- [ ] Purchase credits flow complete
- [ ] Admin approves payment → credits added
- [ ] Paid user can access 4x upscale

### Admin Panel
- [ ] Access `/admin/payments` with correct ADMIN_SECRET
- [ ] Verify pending payments display correctly
- [ ] Test approval button functionality
- [ ] Verify WhatsApp notification sends with payment details

---

## High Priority (Before Public Launch)

### Security
- [ ] Review and approve Terms of Service
- [ ] Review and approve Privacy Policy
- [ ] Verify SSL certificate is active (automatic on Vercel)
- [ ] Enable CORS only for your domain
- [ ] Review all API endpoints for security

### Testing
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on tablet devices
- [ ] Test image upload with various file formats (PNG, JPG, WebP)
- [ ] Test with large images (>5MB after compression)
- [ ] Test with small/low quality images

### Monitoring & Analytics
- [ ] Verify Vercel Analytics is capturing data
- [ ] Verify Speed Insights is capturing data
- [ ] Consider adding Sentry for error tracking
- [ ] Set up email alerts for critical errors

### Branding & Content
- [ ] Verify Clarity logo displays correctly on all pages
- [ ] Check all links work properly
- [ ] Review all copy for typos
- [ ] Verify contact email info@clar1ty.art is correct

---

## Medium Priority (Post-Launch Optimization)

### Performance
- [ ] Monitor image enhancement processing times
- [ ] Analyze database query performance
- [ ] Optimize any slow endpoints
- [ ] Consider caching strategies

### User Experience
- [ ] Collect user feedback
- [ ] Monitor support emails to info@clar1ty.art
- [ ] Track user drop-off points
- [ ] Improve onboarding if needed

### Backup & Disaster Recovery
- [ ] Enable Supabase automated backups
- [ ] Document recovery procedures
- [ ] Test backup restoration
- [ ] Set up regular backup verification

---

## Deployment Steps

1. Complete all "Critical" checklist items
2. Deploy to production branch on Vercel
3. Verify production URL works: https://clar1ty.art
4. Complete "High Priority" testing
5. Enable monitoring and analytics
6. Announce public launch

---

## Rollback Plan

If critical issues are discovered:
1. Disable public access to `/enhance` page
2. Redirect users to maintenance page
3. Investigate and fix issues
4. Re-enable after verification

---

## Support Contact

- **Email:** info@clar1ty.art
- **Admin Panel:** https://clar1ty.art/admin/payments
- **Bug Reports:** Document in support email with reproduction steps

---

## Post-Launch Support

- Monitor error tracking (Sentry/LogRocket)
- Review support emails daily
- Track payment success rate
- Monitor API response times
- Update documentation as needed
