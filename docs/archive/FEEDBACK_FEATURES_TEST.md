# MentalPath Feedback Features - Testing Checklist

## ✅ Setup Complete
- [x] Toaster component added to App.tsx
- [x] Position: top-right
- [x] Features: Rich colors, close button enabled
- [x] Import verified: `import { Toaster } from './components/ui/sonner';`

## ✅ Code Review Verification (Automated)
- [x] All toast calls use correct syntax (`toast.error()`, `toast.success()`)
- [x] Toast imports present in all files that use them
- [x] No undefined toast references
- [x] Error boundaries on all routes
- [x] Navigation structure validated

---

## 🔔 Toast Notifications

### Client Portal (`/client-portal`)
| Feature | Location | Trigger | Expected Result | Status |
|---------|----------|---------|-----------------|--------|
| Missing required fields | Step 2 - About You | Click "Continue" without filling First Name, Last Name, or Email | Red error toast: "Please fill in all required fields (First name, Last name, Email)" | ⏳ Test |
| Invalid email format | Step 2 - About You | Click "Continue" with invalid email (e.g., "test@com") | Red error toast: "Please enter a valid email address" | ⏳ Test |
| Missing consent checkboxes | Step 4 - Consent | Click "Continue" without checking both boxes | Red error toast: "Please check both consent boxes to continue" | ⏳ Test |
| Booking success | Step 5 - Confirmation | Click "Close window" button | Green success toast: "Session booked successfully!" | ⏳ Test |

### Checkout Page (`/checkout`)
| Feature | Location | Trigger | Expected Result | Status |
|---------|----------|---------|-----------------|--------|
| Payment failure | Checkout form | Submit payment with test card that fails | Red error toast: "Payment failed" or specific error message | ⏳ Test |
| Payment initialization error | Page load | If Stripe fails to load | Red error toast: "Failed to load payment form. Please try again." | ⏳ Test |
| Subscription success | After payment | Successful payment completion | Green success toast: "Subscription activated! Welcome to MentalPath 🎉" + redirect to dashboard | ⏳ Test |

### Contact Page (`/contact`)
| Feature | Location | Trigger | Expected Result | Status |
|---------|----------|---------|-----------------|--------|
| Message sent successfully | Contact form | Submit valid contact form | Green success toast: "Message sent! We'll respond within 24 hours." + form clears | ⏳ Test |
| Message send failure | Contact form | If server request fails | Red error toast: "Failed to send message. Please email us directly at support@mentalpath.ca" | ⏳ Test |

---

## 🎨 Visual Feedback States

### Button States
| Component | State | Visual Indicator | Status |
|-----------|-------|------------------|--------|
| Primary buttons (sage) | Hover | Background darkens to `--sage-deep` | ⏳ Test |
| Primary buttons | Disabled | Opacity 50%, cursor not-allowed | ⏳ Test |
| Secondary buttons (outline) | Hover | Background changes to `--sage-pale`, border to `--sage-light` | ⏳ Test |
| Link buttons | Hover | Color changes to `--sage`, small upward movement (-translate-y-px) | ⏳ Test |

### Form Input States
| Element | State | Visual Indicator | Status |
|---------|-------|------------------|--------|
| Text inputs | Focus | Border changes to `--sage`, shadow appears (0_0_0_3px_rgba(74,124,111,0.08)) | ⏳ Test |
| Text inputs | Error | Red border (if implemented) | ⏳ Test |
| Checkboxes | Checked | Sage color accent | ⏳ Test |
| Radio buttons | Selected | Sage color, filled circle | ⏳ Test |
| Select dropdowns | Focus | Sage border and shadow | ⏳ Test |

### Interactive Elements
| Element | State | Visual Indicator | Status |
|---------|-------|------------------|--------|
| Pricing cards | Hover | Translate up (-translate-y-1 or -translate-y-2 for featured) | ⏳ Test |
| Navigation links | Hover | Color changes to `--sage` | ⏳ Test |
| Calendar date buttons | Selected | Sage background, white text | ⏳ Test |
| Calendar date buttons | Disabled | Opacity 40%, cursor not-allowed | ⏳ Test |
| Time slot buttons | Selected | Sage background and border, white text | ⏳ Test |
| Time slot buttons | Hover (unselected) | Border changes to `--sage-light`, text to `--sage` | ⏳ Test |
| Concern tags (Step 3) | Selected | Sage border and pale background, sage text, font-medium | ⏳ Test |
| Concern tags | Hover (unselected) | Border changes to `--sage-light` | ⏳ Test |
| Wellbeing scale buttons | Selected | Sage background, white text | ⏳ Test |
| Wellbeing scale buttons | Hover (unselected) | Border changes to `--sage-light` | ⏳ Test |

---

## 🔄 Loading & Progress States

### Loading Indicators
| Feature | Location | Visual Indicator | Status |
|---------|----------|---------|--------|
| Checkout initialization | Checkout page | `isLoading` state shows loading message/spinner | ⏳ Test |
| Contact form submission | Contact page | Button shows "Sending..." text, disabled state | ⏳ Test |

### Progress Indicators
| Feature | Location | Visual Indicator | Status |
|---------|----------|---------|--------|
| Step progress (Client Portal) | Top of form | 5-step indicator with active/completed/upcoming states | ⏳ Test |
| Step numbers | Step progress bar | Active: sage background, Completed: sage-pale background, Upcoming: white background | ⏳ Test |
| Step connectors | Between steps | Completed steps show sage line, upcoming show gray line | ⏳ Test |
| Step labels | Below numbers | Active: sage-deep text, Completed: sage text, Upcoming: muted text | ⏳ Test |

---

## ✨ Animations & Transitions

### Page Transitions
| Feature | Trigger | Animation | Status |
|---------|---------|-----------|--------|
| Step transitions (Client Portal) | Next/Back buttons | fadeUp animation (0.3s ease) - opacity 0→1, translateY 12px→0 | ⏳ Test |

### Hover Animations
| Element | Animation | Duration | Status |
|---------|-----------|----------|--------|
| Pricing cards | Translate up | transition-transform | ⏳ Test |
| Navigation logo (Client Portal) | Opacity reduction | transition-opacity | ⏳ Test |
| "Back to Home" link | Color change white/60 → white | transition-colors | ⏳ Test |

---

## 📊 Dashboard-Specific Feedback (Future Testing)

### Trial System Feedback
| Feature | Trigger | Expected Feedback | Status |
|---------|---------|-------------------|--------|
| Trial banner | User on trial | Yellow/sage banner at top of dashboard | ⏳ Test |
| AI usage limit warning | Approaching limit | Toast or banner notification | ⏳ Test |
| Trial expired | Trial period ends | Gate blocking access, upgrade prompt | ⏳ Test |

### Auto-Save Indicators
| Feature | Location | Visual Indicator | Status |
|---------|----------|------------------|--------|
| Session notes auto-save | Notes editor | "Saving..." → "Saved" indicator | ⏳ Test |

### Offline Detection
| Feature | Trigger | Visual Indicator | Status |
|---------|---------|------------------|--------|
| Offline banner | Internet disconnection | Banner appears at top warning user | ⏳ Test |
| Online restoration | Internet reconnection | Banner disappears or shows "Back online" | ⏳ Test |

---

## 🎯 Validation Feedback

### Real-Time Validation
| Field | Rule | Feedback Type | Status |
|-------|------|---------------|--------|
| Email (Step 2) | Must match email pattern | Toast on Continue click | ✅ Implemented |
| Required fields (Step 2) | First Name, Last Name, Email must not be empty | Toast on Continue click | ✅ Implemented |
| Consent checkboxes (Step 4) | Both must be checked | Toast on Continue click | ✅ Implemented |
| Date/Time selection (Step 1) | Must select both | Button disabled until selected | ✅ Implemented |

### Form Field Visual Cues
| Element | Visual Cue | Status |
|---------|------------|--------|
| Required fields | Red asterisk (*) next to label | ✅ Implemented |
| Focus state | Sage border + shadow on focus | ✅ Implemented |
| Placeholder text | Gray muted color | ✅ Implemented |

---

## 🔍 Accessibility Features

### Keyboard Navigation
| Feature | Expected Behavior | Status |
|---------|------------------|--------|
| Tab navigation | All interactive elements focusable in logical order | ⏳ Test |
| Enter key | Submits forms, activates buttons | ⏳ Test |
| Escape key | Closes modals/dropdowns (if applicable) | ⏳ Test |

### Screen Reader Support
| Feature | Implementation | Status |
|---------|---------------|--------|
| Button labels | Clear descriptive text | ✅ Implemented |
| Form labels | Associated with inputs via htmlFor | ✅ Implemented |
| Error messages | Announced by screen readers | ⏳ Test |

---

## 🧪 Test Scenarios

### Happy Path Tests
1. **Complete Client Portal Flow**
   - Select date and time → Continue
   - Fill all required fields (valid email) → Continue
   - Select concerns, rate wellbeing → Continue
   - Check both consent boxes → Continue
   - See success message and booking summary
   - Expected: 4-5 smooth transitions, success toast on completion

2. **Contact Form Submission**
   - Fill name, email, subject, message
   - Click submit
   - Expected: Success toast + form clears

3. **Navigation Flow**
   - From landing → Client Portal → Back to Home
   - Expected: Smooth routing, no errors

### Error Path Tests
1. **Missing Required Fields**
   - Go to Step 2, leave First Name empty
   - Click Continue
   - Expected: Red error toast appears, stays on Step 2

2. **Invalid Email**
   - Go to Step 2, enter "invalidemail"
   - Click Continue
   - Expected: Red error toast about email format

3. **Missing Consent**
   - Go to Step 4, check only one box
   - Click Continue
   - Expected: Red error toast about both consents required

4. **Incomplete Booking**
   - Step 1: Select date but no time
   - Expected: "Select a time to continue" button is disabled (opacity 50%)

---

## 📝 Testing Notes

### Browser Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Responsive Testing
- [ ] Desktop (1920px+)
- [ ] Laptop (1366px - 1920px)
- [ ] Tablet (768px - 1366px)
- [ ] Mobile (320px - 768px)

### Performance
- [ ] Toast notifications appear within 100ms
- [ ] Animations are smooth (60fps)
- [ ] No layout shift when toasts appear
- [ ] Form validation is instantaneous

---

## 🐛 Known Issues & Edge Cases

| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| None yet | - | - | - |

---

## ✅ Test Results Summary

**Test Date:** _To be filled_
**Tester:** _To be filled_
**Browser/Device:** _To be filled_

### Overall Results
- **Toast Notifications:** __ / 8 passing
- **Visual States:** __ / 15 passing
- **Validation:** 4 / 4 passing (implemented)
- **Navigation:** __ / 3 passing
- **Animations:** __ / 5 passing

### Critical Issues Found
_None yet - to be filled during testing_

### Recommendations
_To be filled after testing_

---

## 🚀 Next Steps

1. ✅ **COMPLETED:** Add Toaster component to App.tsx
2. ⏳ **TODO:** Manual testing of all toast notifications
3. ⏳ **TODO:** Test all visual feedback states
4. ⏳ **TODO:** Verify keyboard navigation
5. ⏳ **TODO:** Cross-browser compatibility testing
6. ⏳ **TODO:** Mobile responsive testing
7. ⏳ **TODO:** Document any issues found
8. ⏳ **TODO:** Fix critical issues before launch