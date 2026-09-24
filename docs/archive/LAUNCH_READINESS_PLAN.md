# MentalPath 18-22 Day Launch Readiness Plan
**Target Launch Date:** April 4-8, 2026  
**Today:** March 17, 2026  
**Days Remaining:** 18-22 days

---

## ✅ COMPLETED TODAY (March 17)

### ClientPortal - FIXED ✅
- Added navigation (Close button now redirects to home)
- Added success confetti on completion
- Added toast notifications
- Added consent checkbox state management
- Fixed form data persistence (reasonForTherapy field)
- Added proper imports (useNavigate, toast, fireSuccessConfetti)

---

## 📋 18-22 DAY SPRINT PLAN

### **WEEK 1: CRITICAL FUNCTIONALITY (Days 1-7)**

#### **Day 1-2: Payment & Subscriptions** 🔴 CRITICAL
**Goal:** Ensure money flows correctly

- [ ] **Stripe Integration Testing**
  - Test $49/mo Solo plan subscription
  - Test $79/mo Group plan subscription  
  - Test free trial (14 days)
  - Test subscription cancellation
  - Test failed payment handling
  - Test card decline scenarios
  
- [ ] **Payment Flow Components**
  - [ ] Create `/pricing/checkout` route
  - [ ] Build CheckoutForm component with Stripe Elements
  - [ ] Add subscription success page with confirmation
  - [ ] Add subscription management page (cancel/upgrade)
  - [ ] Email receipts via Resend API
  
- [ ] **Webhook Implementation**
  - [ ] Test webhook handler at `/supabase/functions/server/stripe-webhook.ts`
  - [ ] Handle `invoice.paid` event
  - [ ] Handle `invoice.payment_failed` event
  - [ ] Handle `customer.subscription.deleted` event
  - [ ] Update user subscription status in database

**Deliverable:** Users can sign up, pay, and subscriptions are tracked

---

#### **Day 3-4: Contact & Support Systems** 📞
**Goal:** Users can get help

- [ ] **Contact Information**
  - [ ] Footer: Add real email (support@mentalpath.ca)
  - [ ] Footer: Add phone number (+1-XXX-XXX-XXXX)
  - [ ] Create `/contact` page with form
  - [ ] Test contact form submissions → email notifications
  
- [ ] **Support Pages**
  - [ ] Create `/help` page with FAQs
  - [ ] Create `/support` page with ticket system
  - [ ] Add "Chat with us" widget (Intercom or Crisp)
  - [ ] Create knowledge base articles (10 core topics)

- [ ] **FAQ Page** (`/faq`)
  - Billing: How does the free trial work?
  - Privacy: Is my data really stored in Canada?
  - Features: Can I export my client data?
  - Compliance: Is MentalPath PHIPA compliant?
  - Setup: How do I invite my first client?
  - Security: How is my data encrypted?
  - Pricing: Can I upgrade/downgrade plans?
  - Cancellation: What happens if I cancel?
  - Data retention: How long do you keep my data?
  - Support: How do I contact support?

**Deliverable:** Users can reach support 3 ways (email, chat, ticket)

---

#### **Day 5-6: Chatbot Implementation** 🤖
**Goal:** 24/7 automated support

- [ ] **Chatbot Setup**
  - [ ] Install Intercom OR Crisp chat widget
  - [ ] Configure automated responses for common questions
  - [ ] Set business hours (or 24/7 bot)
  - [ ] Add chat bubble to all pages (bottom-right)
  
- [ ] **Chatbot Flows**
  - Flow 1: "How do I book a session?" → Link to Client Portal
  - Flow 2: "What's included in the Solo plan?" → Link to Pricing
  - Flow 3: "Is my data secure?" → Link to Compliance
  - Flow 4: "I need help with billing" → Create support ticket
  - Flow 5: "How do I cancel?" → Link to Settings → Subscription

**Deliverable:** Live chat on every page

---

#### **Day 7: Complete Testing Round 1** ✅
**Goal:** Verify all core functionality works

- [ ] **End-to-End User Journey Testing**
  - [ ] Land on homepage → Read features → View pricing
  - [ ] Click "Start Free Trial" → Onboarding flow
  - [ ] Add billing info → Start $49/mo subscription
  - [ ] Access Dashboard → Add first client
  - [ ] Book session via Client Portal
  - [ ] Create session note (DAP format)
  - [ ] Generate invoice → Send to client
  - [ ] Client pays invoice → Money received
  - [ ] Export T2125 tax summary
  - [ ] Cancel subscription → Confirm cancellation works
  
- [ ] **Test All Buttons/Links**
  - Run automated link checker on entire site
  - Manually click every button on Landing page
  - Verify all nav links work (mobile + desktop)
  - Check footer links (Privacy, Terms, Contact)

**Deliverable:** Complete user journey works without errors

---

### **WEEK 2: DESIGN & INFORMATION (Days 8-14)**

#### **Day 8-9: Design Alignment** 🎨
**Goal:** Pixel-perfect consistency

- [ ] **Component Alignment Audit**
  - [ ] Verify spacing consistency (8px grid system)
  - [ ] Check button sizes (small: 32px, medium: 40px, large: 48px)
  - [ ] Verify border-radius consistency (8px, 12px, 16px)
  - [ ] Check color usage (sage, warm, ink variants)
  - [ ] Font sizes: Headings (DM Serif Display), Body (DM Sans)
  
- [ ] **Responsive Design Testing**
  - [ ] Test on iPhone SE (375px width)
  - [ ] Test on iPhone 12 Pro (390px)
  - [ ] Test on iPad (768px)
  - [ ] Test on Desktop 1920px
  - [ ] Fix any layout breaks
  
- [ ] **Accessibility Fixes**
  - [ ] Add ARIA labels to all interactive elements
  - [ ] Test keyboard navigation (Tab order)
  - [ ] Test screen reader (NVDA/JAWS)
  - [ ] Color contrast check (WCAG AA minimum)
  - [ ] Add focus states to all buttons/links

**Deliverable:** Design system is consistent across all pages

---

#### **Day 10-11: Information Verification** ✅
**Goal:** All content is accurate

- [ ] **Legal Pages** (Critical for launch)
  - [ ] Create `/privacy` - Privacy Policy (PHIPA/PIPEDA compliant)
  - [ ] Create `/terms` - Terms of Service
  - [ ] Create `/security` - Security & Compliance whitepaper
  - [ ] Add "Last updated" dates to all legal pages
  
- [ ] **Content Audit**
  - [ ] Landing page: Verify all claims are accurate
  - [ ] Pricing page: Confirm prices ($0, $49, $79/mo)
  - [ ] Features page: Ensure all features are implemented
  - [ ] Compliance page: Verify PHIPA/PIPEDA claims
  - [ ] Testimonials: Get written permission from "users"
  
- [ ] **Data Accuracy**
  - [ ] Server location: Confirm AWS ca-central-1 (Montreal/Toronto)
  - [ ] Encryption: Confirm AES-256 at rest, TLS 1.3 in transit
  - [ ] College codes: CRPO, OCSWSSW, CPO, CPSBC (verify accuracy)

**Deliverable:** All information on site is factually correct

---

#### **Day 12-14: Bilingual Translations** 🇨🇦🇫🇷
**Goal:** Full EN/FR support

- [ ] **Dashboard Pages Translation**
  - [ ] Overview page → `/src/i18n/locales/{en,fr}.json`
  - [ ] Clients page
  - [ ] Session Notes page
  - [ ] Billing page
  - [ ] Calendar page
  - [ ] Messages page
  - [ ] Settings page
  
- [ ] **Client Portal Translation**
  - [ ] Step 1: Booking
  - [ ] Step 2: About you
  - [ ] Step 3: Your needs
  - [ ] Step 4: Consent
  - [ ] Step 5: Confirmation
  
- [ ] **Onboarding Translation**
  - [ ] Step 1: Account setup
  - [ ] Step 2: Practice info
  - [ ] Step 3: Preferences
  - [ ] Step 4: Complete

**Deliverable:** App works in English AND French

---

### **WEEK 3: POLISH & LAUNCH PREP (Days 15-22)**

#### **Day 15-16: Final Feature Implementation** ⚡
**Goal:** Add remaining Quick Wins

- [ ] **Complete Quick Wins**
  - [ ] Progress bars for tax export
  - [ ] Onboarding progress indicator
  - [ ] First client success celebration (confetti)
  
- [ ] **Error Handling**
  - [ ] Wrap all pages in ErrorBoundary
  - [ ] Add OfflineBanner to DashboardLayout
  - [ ] Implement auto-save for session notes (30s interval)
  - [ ] Add retry logic for failed API calls

**Deliverable:** All Quick Wins from audit complete

---

#### **Day 17-18: Security & Compliance** 🔐
**Goal:** PHIPA-ready

- [ ] **Data Export Feature** (PIPEDA requirement)
  - [ ] Add "Export Data" button to client portal
  - [ ] Generate PDF with all client data
  - [ ] Generate JSON backup
  - [ ] Include: sessions, notes, invoices, messages
  
- [ ] **Consent Withdrawal Flow** (PHIPA requirement)
  - [ ] Add "Withdraw Consent" button in Settings
  - [ ] Show data deletion timeline (30 days)
  - [ ] Log consent withdrawal with timestamp
  - [ ] Implement data deletion after retention period
  
- [ ] **Session Timeout**
  - [ ] Auto-logout after 15 minutes of inactivity
  - [ ] Show warning modal at 14 minutes
  - [ ] Save drafts before logout

**Deliverable:** PHIPA/PIPEDA compliant features complete

---

#### **Day 19: Load Testing & Performance** ⚡
**Goal:** App can handle traffic

- [ ] **Performance Optimization**
  - [ ] Run Lighthouse audit (target: 90+ score)
  - [ ] Optimize images (use WebP format)
  - [ ] Implement code splitting (React.lazy)
  - [ ] Add service worker for offline caching
  
- [ ] **Load Testing**
  - [ ] Test with 100 concurrent users
  - [ ] Test database query performance
  - [ ] Test Stripe webhook handling under load
  - [ ] Verify auto-scaling works

**Deliverable:** App loads fast, handles traffic

---

#### **Day 20-21: Beta Testing** 🧪
**Goal:** Real users find bugs

- [ ] **Recruit 10 Beta Testers**
  - Ideal: 5 therapists, 5 non-therapists
  - Give them specific tasks to complete
  
- [ ] **Beta Test Scenarios**
  - Scenario 1: Sign up, add payment, create client
  - Scenario 2: Book session as client (Client Portal)
  - Scenario 3: Write session note, generate invoice
  - Scenario 4: Export T2125, cancel subscription
  - Scenario 5: Switch language to French, navigate app
  
- [ ] **Bug Tracking**
  - Use Google Sheet to track bugs
  - Priority: Critical, High, Medium, Low
  - Fix Critical & High before launch

**Deliverable:** 10 beta testers complete full user journey

---

#### **Day 22: Pre-Launch Checklist** ✅
**Goal:** Final verification

- [ ] **Technical Checklist**
  - [ ] All environment variables set (production)
  - [ ] Stripe live keys configured (not test keys!)
  - [ ] Email sending works (Resend API)
  - [ ] SMS reminders work (Twilio)
  - [ ] Database backups enabled
  - [ ] CDN configured (CloudFlare)
  - [ ] SSL certificate valid
  - [ ] Domain configured (mentalpath.ca)
  
- [ ] **Content Checklist**
  - [ ] Logo/favicon uploaded
  - [ ] OG images for social sharing
  - [ ] Google Analytics installed
  - [ ] Privacy policy published
  - [ ] Terms of service published
  
- [ ] **Payment Checklist**
  - [ ] Stripe account verified
  - [ ] Bank account linked for payouts
  - [ ] Tax info submitted to Stripe
  - [ ] Test payment successful (live mode)
  
- [ ] **Launch Announcement**
  - [ ] Draft launch email to waitlist
  - [ ] Prepare social media posts (LinkedIn, Twitter)
  - [ ] Contact CRPO/OCSWSSW for listing

**Deliverable:** Ready to launch!

---

## 🚀 LAUNCH DAY (Day 23+)

### Go-Live Checklist
- [ ] Flip feature flag to enable signups
- [ ] Send launch email to waitlist
- [ ] Post on social media
- [ ] Monitor error logs (Sentry)
- [ ] Monitor Stripe dashboard
- [ ] Respond to support tickets within 2 hours

---

## 📊 SUCCESS METRICS (First 30 Days)

**Target Goals:**
- 50 signups (free trial)
- 10 paying subscribers ($49 or $79/mo)
- < 2% error rate
- < 3 second page load time
- 80% mobile responsiveness score
- 5-star reviews from beta testers

**Revenue Goal:** $490-$790 MRR (10 customers)

---

## 🔧 TOOLS & SERVICES TO CONFIGURE

### Payment
- [x] Stripe (already integrated)
- [x] Stripe webhooks configured

### Communication
- [ ] Resend API (emails) - API key needed
- [ ] Twilio (SMS) - API key needed
- [ ] Intercom or Crisp (chat) - Account needed

### Monitoring
- [ ] Sentry (error tracking)
- [ ] Google Analytics
- [ ] Plausible Analytics (privacy-friendly)

### Infrastructure
- [ ] Supabase (already configured)
- [ ] AWS ca-central-1 (confirm region)
- [ ] CloudFlare (CDN)

---

## 🎯 DAILY STANDUP FORMAT

**Question 1:** What did you complete yesterday?  
**Question 2:** What are you working on today?  
**Question 3:** Any blockers?

---

## 🚨 CRITICAL BLOCKERS TO WATCH

1. **Stripe Live Keys** - Need real bank account
2. **Email Deliverability** - Resend account limits
3. **SMS Limits** - Twilio trial account (upgrade needed)
4. **Domain Verification** - DNS propagation (24-48hrs)
5. **SSL Certificate** - Let's Encrypt auto-renewal
6. **Beta Testers** - Need to recruit 10 people

---

## 📝 NOTES

**Current Status:** Day 1 of 22 (March 17, 2026)

**Completed:**
- Quick Wins (10/10) ✅
- Bilingual Support (Landing Page) ✅
- ClientPortal Navigation Fix ✅
- Error handling infrastructure ✅

**Next Priority:** Payment & Subscriptions (Day 1-2)

---

**Last Updated:** March 17, 2026 - 8:30 PM  
**Sprint Velocity:** On track for April 4-8 launch 🚀
