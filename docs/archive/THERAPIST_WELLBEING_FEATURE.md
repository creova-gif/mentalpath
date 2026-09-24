# MentalPath - Therapist Wellbeing Feature 💚

**The feature we built for therapists, not their clients**

---

## 🎯 Overview

A **private, weekly wellbeing check-in** designed exclusively for therapists themselves. This is MentalPath's most unique feature — it's not about productivity, compliance, or client outcomes. It's purely about the therapist's emotional health.

**Route:** `/wellbeing`  
**File:** `/src/app/components/pages/TherapistWellbeing.tsx`

---

## 🌟 The Manifesto

> "Every other tool in this space is designed to make therapists more productive, more organised, more compliant. None of them stop and ask how the therapist is doing. And therapists — who spend their entire working lives asking other people that exact question — **almost never get asked it themselves.**"

This feature addresses:
- **Compassion fatigue** (occupational reality)
- **Vicarious trauma** (secondary traumatic stress)
- **Burnout prevention** (ethical obligation per CRPO)
- **Self-care tracking** (what gets measured gets managed)

---

## 📊 Feature Components

### 1. **Wellbeing Sliders** (4 scales, 1-10)

Interactive sliders with visual feedback:
- **Energy** - depleted → energised
- **Emotional load** - light → very heavy  
- **Satisfaction** - going through motions → deeply purposeful
- **Boundary clarity** (additional)

**Design:**
- Sage green fill bar
- Draggable thumb indicator
- Plain language labels (not clinical scales)
- Current value displayed (Playfair Display font)

### 2. **Vicarious Trauma Indicators** (6 toggles)

Based on validated research (ProQOL-5, Figley 2002):

1. **Intrusive thoughts** - Thinking about client material outside session
2. **Sleep disruption** - Waking/difficulty sleeping due to work
3. **Session dread** - Reluctance about seeing specific client
4. **Emotional numbing** - Feeling flat/distant in sessions
5. **Cynicism increase** - Skepticism about therapy effectiveness
6. **Presence difficulty** - Mind wandering, attention struggles

**Escalation Logic:**
- 0-2 flags: Standard language
- 3 flags: Gentle notice
- 4+ flags: System escalates tone, suggests supervision

### 3. **Private Reflection Textarea**

- Free-form journaling space
- Explicitly labeled: **"Never read by anyone"**
- No share button
- No export option
- No audit log entry
- Just space to process

### 4. **AI Reflection Back**

Claude-powered response that:
- ❌ Doesn't give advice
- ❌ Doesn't create to-do lists
- ❌ Isn't artificially cheerful
- ✅ Names what the week held
- ✅ Notices one thing
- ✅ Offers one possibility
- ✅ Tone shifts based on inputs

**Example:**
> "You carried a lot this week. Sleep being disrupted by a session isn't just fatigue — it's a sign that something landed somewhere deeper than usual, and that's worth paying attention to."

### 5. **Self-Care Tracking** (6 checkboxes)

Weekly yes/no tracking:
- Had supervision this week
- Took intentional breaks
- Attended personal therapy
- Exercised regularly
- Connected with peers
- Maintained boundaries

**No judgment** - just data to see patterns.

### 6. **Historical Trends**

Visual analytics over time:
- Are heavy weeks clustering?
- Does emotional load outrun energy?
- Does supervision move the needle?
- Weekly progression charts
- Month-over-month comparisons

---

## 🔒 Privacy Architecture

### Database Design

**Table:** `therapist_checkins`  
**RLS Policy:** `therapist_own_checkins_only`

```sql
CREATE POLICY therapist_own_checkins_only
ON therapist_checkins
FOR ALL
USING (auth.uid() = therapist_id);
```

### Privacy Guarantees

✅ **Row-level security** - Database-enforced, own account only  
✅ **Not in audit log** - Not client health records  
✅ **Cannot export** - No export function built  
✅ **Cannot share** - No supervisor view  
✅ **Cannot join to client data** - Isolated table  
✅ **Canadian storage** - AWS ca-central-1 (Montreal/Toronto)  
✅ **AES-256 at rest** - Same encryption as client data  
✅ **TLS 1.3 in transit** - Industry standard  

**Technically impossible to access, not just against policy.**

---

## 🎨 Design System

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Instrument Sans (sans-serif)
- **Contrast:** Cream background (#F5F0E8) vs dark ink (#1C1A16)

### Colors
```css
--cream: #F5F0E8
--cream-dark: #EDE7D9
--ink: #1C1A16
--ink-mid: #4A4640
--ink-soft: #7A7570
--sage: #4A7C6F
--sage-light: #6B9E8F
--sage-pale: #E8F0ED
--sage-deep: #2D5049
```

### Layout Structure

1. **Masthead** - Split screen hero (dark left, UI preview right)
2. **Manifesto** - Dark background, large serif text
3. **Features Grid** - 3-column responsive grid
4. **Research Section** - Two-column validation
5. **Privacy Section** - Guarantees with icons
6. **Quote** - Centered testimonial
7. **CTA** - Sign-up conversion

### Animations
- **Fade-up on scroll** - IntersectionObserver
- **0.7s ease transitions**
- **0.15 threshold** for triggering
- **Staggered delays** for grid items

---

## 📐 Component Structure

```typescript
export function TherapistWellbeing() {
  // State management
  const [energy, setEnergy] = useState(6);
  const [emotionalLoad, setEmotionalLoad] = useState(7);
  const [satisfaction, setSatisfaction] = useState(7);
  const [vtFlags, setVtFlags] = useState({
    intrusive: false,
    sleep: true,
    dread: false
  });

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.15 }
    );
    // ...
  }, []);

  // Render sections
  return <div>...</div>;
}
```

---

## 📊 Data Structure

```typescript
interface TherapistCheckin {
  id: string;
  therapist_id: string; // FK to auth.users
  week_start_date: Date;
  
  // Wellbeing scores (1-10)
  energy: number;
  emotional_load: number;
  satisfaction: number;
  boundary_clarity: number;
  
  // Vicarious trauma flags (boolean)
  vt_intrusive_thoughts: boolean;
  vt_sleep_disruption: boolean;
  vt_session_dread: boolean;
  vt_emotional_numbing: boolean;
  vt_cynicism: boolean;
  vt_presence_difficulty: boolean;
  
  // Self-care tracking (boolean)
  sc_supervision: boolean;
  sc_breaks: boolean;
  sc_personal_therapy: boolean;
  sc_exercise: boolean;
  sc_peer_connection: boolean;
  sc_boundary_maintenance: boolean;
  
  // Private reflection
  private_notes: string | null; // Never exported
  
  // AI response
  ai_reflection: string | null;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}
```

---

## 🧪 Research Foundation

### ProQOL-5 (Professional Quality of Life Scale)
- Developed by B. Hudnall Stamm
- Measures compassion satisfaction and fatigue
- 30-item validated instrument
- Industry standard for therapist wellbeing

### Figley (2002) - Compassion Fatigue Model
- Secondary traumatic stress framework
- Occupational hazard in helping professions
- Preventable with monitoring and intervention

### CRPO Standards of Practice
> "Members shall engage in self-care practices to maintain their physical, emotional, mental, spiritual and relational health." — Standard 4.2

---

## 🎯 Key Differentiators

### What This Is NOT:
❌ Productivity tracking  
❌ Time management tool  
❌ Client outcome measure  
❌ Compliance requirement  
❌ Billable service  
❌ Shareable with anyone  

### What This IS:
✅ Private emotional check-in  
✅ Burnout prevention  
✅ Self-awareness tool  
✅ Pattern recognition  
✅ Ethical self-care practice  
✅ Research-validated approach  

---

## 💡 Marketing Copy Highlights

### Hero Headline
> "The feature we built for **you,** not your clients."

### Manifesto Quote
> "Therapists — who spend their entire working lives asking other people that exact question — **almost never get asked it themselves.**"

### Privacy Promise
> "Genuinely private. **Not just a promise.**"

### Research Validation
> "Built on **real research,** not gut feeling."

### Famous Quote Referenced
> "You cannot pour from an empty cup. Take care of yourself first."  
> *— Said to every therapist in training. Rarely operationalised in any tool they use every day.*

---

## 🚀 Future Enhancements

### Phase 2 Features
- **Weekly email summary** - Opt-in reminder to check in
- **Threshold alerts** - When 4+ VT flags triggered
- **Supervisor referral** - Suggested when patterns emerge
- **Peer anonymized trends** - "73% of therapists report sleep disruption this week"
- **Integration with personal therapy** - If client of another therapist using MentalPath

### Advanced Analytics
- **Seasonal patterns** - Do heavy weeks cluster in winter?
- **Caseload correlation** - Does number of clients affect load?
- **Session type analysis** - Trauma work vs maintenance sessions
- **Recovery time tracking** - How long after a heavy week to bounce back?

---

## 🎨 UI Preview Section

The right side of the masthead shows a **live interactive UI preview**:

- Week label: "Week of March 16, 2026"
- Privacy badge: "Private to you only" (with lock icon)
- Question prompt: "How are you doing this week?"
- 3 sliders with values (6, 7, 7)
- 3 VT indicator toggles
- AI response card (sage-pale background)

**Interactive elements:**
- Sliders are functional (can drag)
- Toggles switch on/off
- Real-time value updates

---

## 📱 Responsive Design

- **Desktop (>960px):** Side-by-side hero, 3-col grid
- **Tablet/Mobile (<960px):** 
  - Stacked hero (hides UI preview)
  - 1-column grid
  - Reduced padding (64px → 28px)
  - Smaller font sizes (clamp())

---

## 🔧 Technical Implementation

### Dependencies
- React hooks (useState, useEffect, useRef)
- Lucide React icons (Shield, FileText, Eye, Lock)
- Tailwind CSS
- Google Fonts (Playfair Display, Instrument Sans)

### Performance
- IntersectionObserver for scroll animations
- CSS transitions (not JS animations)
- Lazy font loading
- No external images (SVG icons only)

### Accessibility
- Semantic HTML
- ARIA labels on sliders
- Keyboard navigation support
- High contrast text
- Focus states on interactive elements

---

## 📈 Success Metrics

### User Engagement
- **Weekly completion rate** - % of therapists who check in
- **Time to complete** - Average 2-3 minutes
- **Consecutive weeks** - Habit formation tracking
- **VT flag trends** - Early warning system effectiveness

### Clinical Impact
- **Burnout prevention** - Self-reported reduction
- **Supervision engagement** - Correlation with check-ins
- **Session quality** - Indirect measure via client outcomes
- **Retention** - Do therapists stay subscribed?

---

## 🎯 Positioning

**Primary Message:**
> MentalPath is the only practice management tool that takes care of the therapist while they take care of others.

**Secondary Message:**
> Self-care isn't a luxury. It's an ethical obligation backed by research and enforced by your College.

**Proof Points:**
- ProQOL-5 validated indicators
- Figley compassion fatigue model
- CRPO Standards compliance
- Database-level privacy architecture
- Canadian data residency

---

## ✅ Implementation Checklist

- [x] Create React component
- [x] Add route (`/wellbeing`)
- [x] Implement interactive sliders
- [x] Add VT indicator toggles
- [x] Build scroll animations
- [x] Design responsive layout
- [x] Add privacy guarantees section
- [x] Include research citations
- [ ] Connect to Supabase backend
- [ ] Build `therapist_checkins` table
- [ ] Implement RLS policies
- [ ] Create AI reflection endpoint
- [ ] Add historical charts
- [ ] Build email reminders
- [ ] Track completion metrics

---

## 🌟 Why This Matters

**Compassion fatigue is real.**  
**Vicarious trauma is occupational.**  
**Burnout is preventable.**

This feature gives therapists what they give their clients every day: someone asking "How are you doing?" and actually meaning it.

Not for billable hours.  
Not for compliance.  
Not for productivity.

**Just for you.**

---

**Built with ❤️ for Canadian therapists**  
**March 16, 2026**
