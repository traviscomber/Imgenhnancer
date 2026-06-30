# clar1ty - Complete Compliance & Legal Summary

## Jurisdiction & Compliance Framework
- **Jurisdiction:** Chile
- **Applicable Law:** Chilean Law 19.628 (Personal Data Protection)
- **Company Location:** n3uralia group, Chile

---

## Legal Documents Created

### 1. Privacy Policy (`/app/privacy/page.tsx`)
**Key Points:**
- Compliant with Chilean Law 19.628
- Details on data collection: images, account info, technical data, payment info
- **Data Retention:** Images deleted after 7 days
- No AI training on user images
- Third-party sharing: Replicate, Stripe, Vercel, Cloudflare
- User rights: Access, Correction, Deletion, Opposition
- Data security measures outlined

**Contact:** privacy@clar1ty.art

---

### 2. Terms of Service (`/app/terms/page.tsx`)
**Key Points:**
- Governed by Chilean law
- User responsibilities: Own uploaded images, no illegal use, no abuse
- Intellectual property: Users retain image ownership, service IP protected
- **CRITICAL:** 7-day data retention - users must download within window
- NO WARRANTY on service quality or results
- Limitation of liability: Max liability = amount paid (or $100 USD)
- Acceptable use policy: NO deepfakes, NO non-consensual content
- Content moderation rights reserved
- Account termination for violation

**Contact:** legal@clar1ty.art

---

### 3. Disclaimer (`/app/disclaimer/page.tsx`)
**Key Points:**
- **NO WARRANTY** - AS IS/AS AVAILABLE basis
- **LIMITED LIABILITY** - Not liable for:
  - Lost/corrupted images
  - Data breaches beyond reasonable control
  - Service interruptions
  - Indirect/consequential damages
- **USER RESPONSIBILITY:**
  - Download images within 7 days
  - Own all image rights
  - Verify copyright compliance
- NO deepfake use allowed
- Enhancement results may vary
- Chilean Law 19.628 compliance
- Users acknowledge all terms upon use

---

## Data Handling & Retention Policy

### Image Storage (CRITICAL)
```
Timeline:
- Upload → Image stored for processing
- Enhancement → Enhanced image generated and stored
- 7-Day Window → ONLY 7 DAYS to download enhanced image
- After 7 Days → AUTOMATIC DELETION (permanent, irreversible)
- No recovery available after deletion
```

### User Data
- Account info retained while account active
- Personal data deleted within 30 days of account deletion
- Technical logs retained 12 months

### Payment Data
- Stripe handles payment processing (not stored by clar1ty)
- See Stripe privacy policy

---

## Third-Party Integrations & Liability

| Service | Purpose | Data Shared | Liability |
|---------|---------|-------------|-----------|
| Replicate | Image processing | Images for enhancement | Not liable for 3rd party failures |
| Stripe | Payment processing | Transaction data | See Stripe privacy policy |
| Vercel | Hosting & analytics | Technical data, analytics | Not liable for 3rd party failures |
| Cloudflare | CDN & security | Traffic, IP data | Not liable for 3rd party failures |

---

## Key Liabilities & Disclaimers

### Image Loss
- **NOT LIABLE** for lost images after 7-day retention
- **NOT LIABLE** for accidental deletion
- **NOT LIABLE** for service downtime losses
- **USER RESPONSIBILITY:** Download immediately after enhancement

### Quality & Results
- **NOT LIABLE** for enhancement quality
- **NOT LIABLE** for unsatisfactory results
- **NOT LIABLE** if enhancement doesn't meet expectations
- Results may vary based on input quality

### Copyright & Rights
- **USER RESPONSIBLE** for ensuring image ownership
- **NOT LIABLE** for copyright infringement claims
- **USER INDEMNIFIES** clar1ty for third-party copyright claims
- Users must verify ownership before upload

### Deepfakes & Misuse
- **STRICTLY PROHIBITED** - deepfakes, non-consensual content
- **IMMEDIATE TERMINATION** for violation
- **USERS LIABLE** for criminal penalties
- **NOT LIABLE** - clar1ty is not responsible for user misuse

---

## Liability Caps

```
Total Liability (Maximum):
= Amount paid by user in past 12 months
OR
= $100 USD (whichever is greater)

This applies to ALL claims, damages, or losses
Excludes cases of willful misconduct or gross negligence
```

---

## Website Footer Integration

Footer now includes:
- **Privacy Policy link** → `/privacy`
- **Terms of Service link** → `/terms`
- **Disclaimer link** → `/disclaimer`
- **Legal Contact** → legal@clar1ty.art
- **n3uralia group credit** → links to www.n3uralia.com

---

## Compliance Checklist

- ✅ Privacy Policy (Chilean Law 19.628 compliant)
- ✅ Terms of Service (7-day retention, liability caps)
- ✅ Disclaimer (NO WARRANTY, liability limitations)
- ✅ Footer links to all legal documents
- ✅ Data retention policy documented (7 days automatic deletion)
- ✅ Third-party integrations disclosed
- ✅ User responsibilities clearly stated
- ✅ Image rights disclaimers prominent
- ✅ Deepfake prohibition clear
- ✅ Liability caps specified
- ✅ User acknowledgment of terms upon use

---

## Email Contacts for Users

| Purpose | Email |
|---------|-------|
| General inquiries | info@clar1ty.art |
| Privacy concerns | privacy@clar1ty.art |
| Legal/Compliance | legal@clar1ty.art |

---

## Important Notes for Operations

1. **7-Day Automatic Deletion:** Implement automated script to delete all images (uploaded + enhanced) after 7 days. This MUST be enforced.

2. **Email Disclaimers:** Consider adding 7-day retention reminder to enhancement email confirmations.

3. **Support Training:** Support team should reference:
   - Cannot recover images after 7 days
   - Users responsible for downloading
   - Policy applies to all images regardless of payment status

4. **Future Expansion:** When expanding to LATAM, review local privacy laws for each country (Argentina, Colombia, Mexico, Peru, etc.).

5. **Updates:** Review and update compliance documents annually or when law changes.

---

## Legal Review Recommended

Before production launch, have these documents reviewed by:
- Chilean employment/tech lawyer
- Data protection specialist (PDPA compliance)
- Payment compliance expert (Stripe integration)

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Jurisdiction:** Chile
