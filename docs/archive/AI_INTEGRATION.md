# MentalPath AI Integration Documentation

## Overview

MentalPath integrates **Claude AI** (Anthropic) for PHIPA-compliant AI-assisted clinical note generation. The system helps Canadian mental health practitioners draft professional session notes in DAP, SOAP, BIRP, and Progress formats.

---

## 🔒 PHIPA Compliance

### Privacy-First Design

**✅ What is sent to Claude API:**
- Session ID (UUID only - no client names)
- Note format (DAP/SOAP/BIRP/PROGRESS)
- Therapist's rough notes/observations
- Session context (e.g., "50-minute individual session")

**❌ What is NEVER sent:**
- Client names
- Client date of birth
- Client contact information
- Client address
- Client health card numbers
- Client SIN

### PII Sanitization

Before sending to Claude, all text is sanitized:
```typescript
// Redacts phone numbers: 123-456-7890 → [phone redacted]
// Redacts emails: user@email.com → [email redacted]
// Redacts SINs: 123456789 → [SIN redacted]
```

### Data Storage

- **Notes stored:** Canadian Supabase servers (Toronto region)
- **AI API calls:** Claude API (Anthropic)
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Retention:** Audit logs for 7 years (CRPO requirement)

---

## Architecture

### **Backend: Supabase Edge Function**

File: `/supabase/functions/server/ai-note-assist.ts`

```
Client (Browser)
    ↓
Edge Function (Deno)
    ↓ [Sanitize PII]
    ↓
Claude API (Anthropic)
    ↓ [Generate draft]
    ↓
Edge Function
    ↓
Client (Browser)
```

**Environment Variable:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Endpoint:**
```
POST https://{projectId}.supabase.co/functions/v1/ai-note-assist
```

### **Frontend: React Service Layer**

File: `/src/app/services/aiNoteService.ts`

**Key Functions:**
- `generateNoteAssist()` - Call AI API
- `parseNoteSections()` - Parse AI response into sections
- `generateSessionId()` - Generate UUID for session

---

## API Reference

### **Request Format**

```json
POST /functions/v1/ai-note-assist
Headers:
  Authorization: Bearer {SUPABASE_ANON_KEY}
  Content-Type: application/json

Body:
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "note_format": "DAP",
  "section_1": "Client reported feeling anxious about work...",
  "section_2": "Used CBT techniques to explore thought patterns...",
  "section_3": "Continue monitoring anxiety levels...",
  "section_4": null,
  "session_context": "Individual therapy session, 50 minutes"
}
```

### **Response Format**

```json
{
  "draft": "Data:\nClient reported feeling anxious...\n\nAssessment:\nClient shows progress...\n\nPlan:\nContinue CBT techniques...",
  "format": "DAP",
  "model": "claude-sonnet-4-20250514",
  "disclaimer": "AI draft — review and edit before saving. Not a substitute for clinical judgment."
}
```

### **Error Response**

```json
{
  "error": "AI assist unavailable. Please write your note manually."
}
```

---

## Note Formats

### **DAP (Data · Assessment · Plan)**
```
Data: What the client reported and presented
Assessment: Clinical formulation and progress
Plan: Interventions and next session focus
```

### **SOAP (Subjective · Objective · Assessment · Plan)**
```
Subjective: Client's self-report
Objective: Observable behaviors, affect
Assessment: Clinical interpretation
Plan: Therapeutic goals
```

### **BIRP (Behavior · Intervention · Response · Plan)**
```
Behavior: Presenting behaviors
Intervention: Techniques used
Response: Client's response
Plan: Goals for next session
```

### **PROGRESS (Narrative)**
```
Summary: Session overview
Observations: Clinical observations
Plan: Next steps
```

---

## Usage Example

### **From React Component**

```tsx
import { generateNoteAssist, generateSessionId } from '../../services/aiNoteService';

const handleAiAssist = async () => {
  try {
    const result = await generateNoteAssist({
      sessionId: generateSessionId(),
      noteFormat: 'DAP',
      section1: 'Client reported stress at work, difficulty sleeping',
      section2: 'Used relaxation techniques, explored coping strategies',
      section3: 'Practice sleep hygiene, monitor stress levels',
      sessionContext: 'Individual therapy session, 50 minutes',
    });

    // result.sections contains parsed sections
    setSectionValues(result.sections);
  } catch (error) {
    console.error('AI assist error:', error);
  }
};
```

### **AI Response Parsing**

The service automatically parses the AI draft into sections:

```typescript
Input (AI draft):
"Data:
Client reported feeling anxious about upcoming presentation.

Assessment:
Client demonstrates insight into anxiety triggers.

Plan:
Practice grounding techniques before presentation."

Output (parsed sections):
{
  section1: "Client reported feeling anxious about upcoming presentation.",
  section2: "Client demonstrates insight into anxiety triggers.",
  section3: "Practice grounding techniques before presentation."
}
```

---

## UI Components

### **NoteModal Component**

File: `/src/app/components/modals/NoteModal.tsx`

**Features:**
- Format selector (DAP/SOAP/BIRP/Progress)
- Section input fields
- AI Assist button
- Loading state
- Error handling
- Success confirmation
- PHIPA compliance notice

**States:**
- `aiAssisting` - Loading state during API call
- `aiError` - Error message display
- `aiSuccess` - Success confirmation (3 seconds)
- `sectionValues` - Form field values

---

## Testing

### **Manual Testing**

1. Go to `/dashboard/notes`
2. Click "New Note" or edit existing note
3. Select a note format (DAP/SOAP/BIRP/Progress)
4. Enter some rough notes in each section:
   ```
   Data: "Client reported stress"
   Assessment: "Showed progress"
   Plan: "Continue CBT"
   ```
5. Click "Get AI suggestions"
6. Wait 2-5 seconds
7. AI will populate fields with professionally formatted text

### **Test the Edge Function Directly**

```bash
curl -X POST \
  https://{projectId}.supabase.co/functions/v1/ai-note-assist \
  -H "Authorization: Bearer {SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "note_format": "DAP",
    "section_1": "Client reported stress",
    "section_2": "Made progress with CBT",
    "section_3": "Continue monitoring"
  }'
```

### **Expected Behavior**

✅ **Success:**
- Returns formatted note in ~2-5 seconds
- Sections auto-populate
- Green checkmark appears
- Professional clinical language

❌ **Validation Errors:**
- "Invalid session_id" - UUID format required
- "Unauthorized" - Missing/invalid API key
- "Please enter some session notes" - Empty fields

⚠️ **Service Errors:**
- "AI assist unavailable" - API down or key invalid
- Shows error message in red
- User can still write notes manually

---

## Cost Estimation

### **Claude Sonnet 4 Pricing (March 2026)**
- Input: ~$3 per 1M tokens
- Output: ~$15 per 1M tokens

### **Per Note Generation**
- Input tokens: ~200-400 tokens
- Output tokens: ~300-500 tokens
- **Cost per note:** ~$0.01 CAD

### **Monthly Usage (50 clients)**
- 50 clients × 4 sessions/month = 200 sessions
- 200 notes × $0.01 = **$2 CAD/month**

**Very affordable for AI-assisted clinical documentation!**

---

## Configuration

### **AI Model**

Current model: `claude-sonnet-4-20250514`

To change model, edit `/supabase/functions/server/ai-note-assist.ts`:
```typescript
model: "claude-sonnet-4-20250514", // or "claude-3-5-sonnet-20241022"
```

### **Token Limits**

Current: `max_tokens: 600`

Adjust for longer/shorter notes:
```typescript
max_tokens: 600, // 600 = ~450 words
```

### **System Prompt**

Located in `/supabase/functions/server/ai-note-assist.ts`:

```typescript
system: `You are a clinical documentation assistant for a Canadian psychotherapy practice.
You help therapists draft session notes in professional clinical language.
You never invent clinical details not present in the therapist's notes.
...`
```

---

## Security Best Practices

### **API Key Management**

✅ **DO:**
- Store `ANTHROPIC_API_KEY` in Supabase secrets
- Never commit API keys to Git
- Use environment variables
- Rotate keys quarterly

❌ **DON'T:**
- Expose keys in frontend code
- Log API keys
- Share keys between environments

### **Input Validation**

All inputs are validated:
```typescript
// UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PII sanitization
text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[phone redacted]")
```

### **Rate Limiting**

Implement in production:
```typescript
// Supabase Edge Function
const rateLimit = await kv.get(`rate_limit:${userId}`);
if (rateLimit > 100) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

---

## Audit Logging

All AI calls are logged (no PII):

```json
{
  "event": "ai_note_assist",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "note_format": "DAP",
  "input_tokens": 342,
  "output_tokens": 487,
  "timestamp": "2026-03-18T14:32:00.000Z"
}
```

**Log Retention:** 7 years (CRPO requirement)

---

## Troubleshooting

### **"AI assist unavailable"**

**Causes:**
- ANTHROPIC_API_KEY not set
- Invalid API key
- Claude API down
- Network error

**Fix:**
1. Check Supabase secrets
2. Verify API key at console.anthropic.com
3. Check server logs
4. Test API directly with curl

### **"Invalid session_id"**

**Cause:** Session ID is not a valid UUID

**Fix:**
```typescript
// Use this function
const sessionId = generateSessionId();

// Not this
const sessionId = "session123"; // ❌ Not a UUID
```

### **Empty/Incomplete Response**

**Causes:**
- Input too short
- Input too vague
- API timeout

**Fix:**
- Ensure each section has 5+ words
- Be specific in notes
- Retry request

### **Slow Response (>10 seconds)**

**Normal:** 2-5 seconds
**Slow:** 5-10 seconds (acceptable)
**Very slow:** >10 seconds (investigate)

**Check:**
- Network latency
- Claude API status
- Token count (reduce if >1000)

---

## Future Enhancements

### **V2.0 Features**

1. **Multi-language Support**
   - French note generation
   - Bilingual templates

2. **Custom Templates**
   - User-defined note formats
   - Clinic-specific styles

3. **Batch Processing**
   - Generate multiple notes at once
   - Export to PDF

4. **Advanced Analytics**
   - Track AI usage
   - Cost monitoring
   - Quality metrics

5. **Voice-to-Text Integration**
   - Speak notes, AI transcribes
   - Real-time dictation

---

## Summary

The MentalPath AI integration provides:

✅ **PHIPA-compliant** note generation  
✅ **Claude Sonnet 4** for professional clinical language  
✅ **4 note formats** (DAP/SOAP/BIRP/Progress)  
✅ **PII sanitization** before API calls  
✅ **Canadian data residency** (Supabase Toronto)  
✅ **Audit logging** for compliance  
✅ **Cost-effective** (~$0.01 per note)  
✅ **Production-ready** with error handling  

**The system is fully functional and ready to assist therapists with clinical documentation!** 🎉

---

## Support

**API Issues:**
- Check Supabase Edge Function logs
- Verify ANTHROPIC_API_KEY in secrets
- Test endpoint with curl

**Feature Requests:**
- Submit to product team
- Include use case and benefits

**Bug Reports:**
- Include error message
- Provide session ID
- Attach browser console logs
