// Prompt construction and PII scrubbing for AI Note Assist. Kept free of I/O so
// it can be unit-tested and evaluated (see ai-prompts.test.ts and docs/ai/).

export const NOTE_FORMAT_PROMPTS: Record<string, { labels: string[]; instruction: string }> = {
  DAP: {
    labels: ["Data", "Assessment", "Plan"],
    instruction: `Generate a concise, clinically appropriate DAP note for a Canadian registered psychotherapist.

Data: Summarize what the client reported, presented concerns, and observable session content. Use person-centred language. Include relevant affect and presentation observations.

Assessment: Provide clinical formulation of themes, progress toward goals, and therapeutic process. Reference evidence-based frameworks (e.g., CBT, DBT, emotion-focused, narrative therapy) where applicable. Note any risk factors or protective factors observed.

Plan: Outline therapeutic interventions planned, homework assigned, goals for next session, and any follow-up required. Include frequency recommendations if relevant.

Use formal clinical language suitable for College of Registered Psychotherapists of Ontario (CRPO) records. Be specific, evidence-based, and person-centred. Avoid diagnostic language unless clearly indicated by the therapist's notes. Total length: 200-350 words.`,
  },
  SOAP: {
    labels: ["Subjective", "Objective", "Assessment", "Plan"],
    instruction: `Generate a concise SOAP note for a Canadian mental health practice.

Subjective: Client's self-report, presenting concerns, and subjective experience of symptoms or progress. Use the client's own language where possible.

Objective: Observable behaviours, affect, appearance, engagement level, and therapist observations. Include mental status observations where relevant.

Assessment: Clinical interpretation, progress toward treatment goals, effectiveness of interventions, and any shifts in presentation or functioning. Reference therapeutic modalities used.

Plan: Goals for upcoming sessions, interventions to continue or modify, any referrals or collateral contacts needed, and session frequency recommendations.

Maintain professional clinical standards appropriate for CRPO documentation. Be concise and evidence-based. Total length: 200-350 words.`,
  },
  BIRP: {
    labels: ["Behavior", "Intervention", "Response", "Plan"],
    instruction: `Generate a concise BIRP note for a Canadian psychotherapy practice.

Behavior: Presenting behaviors, client report, affect, and engagement. Note any significant changes from previous sessions.

Intervention: Specific therapeutic techniques and approaches used this session. Name modalities (e.g., CBT thought records, mindfulness exercises, emotion regulation skills, psychoeducation on [topic]). Include any resources provided.

Response: Client's response to interventions—engagement level, insights gained, skills practiced, barriers encountered. Note progress or setbacks.

Plan: Goals and therapeutic focus for upcoming sessions. Homework or between-session practice assigned. Any adjustments to treatment approach.

Use evidence-based language suitable for regulated mental health practice in Canada. Be specific about interventions. Total length: 200-350 words.`,
  },
  PROGRESS: {
    labels: ["Summary", "Observations", "Plan"],
    instruction: `Generate a narrative progress note suitable for a Canadian psychotherapy practice regulated by CRPO.

Summary: Provide a cohesive narrative of session content, themes explored, and client presentation. Integrate subjective report with therapeutic process.

Observations: Clinical observations about progress, therapeutic relationship, client strengths and resources, barriers to progress, and any risk or safety considerations.

Plan: Treatment direction, goals for continued work, interventions to employ, and any collaborative planning with client.

Use person-centred, non-pathologising language that respects client dignity and agency. Maintain clinical professionalism while being warm and humanistic. Avoid jargon. Total length: 200-400 words.`,
  },
};

export const SYSTEM_PROMPT = `You are a clinical documentation assistant for Canadian registered psychotherapists and mental health professionals.

Your role:
- Help therapists draft session notes in professional clinical language
- Follow College of Registered Psychotherapists of Ontario (CRPO) documentation standards
- Use person-centred, evidence-based language
- Never invent clinical details not present in the therapist's notes
- Never reproduce client names or identifying information
- Reference common therapeutic modalities in Canada: CBT, DBT, ACT, emotion-focused therapy, narrative therapy, solution-focused brief therapy, trauma-informed approaches
- Use inclusive, non-pathologising language that respects client dignity
- Maintain appropriate clinical boundaries and professional tone

All output will be reviewed and edited by a registered professional before saving.
Your drafts should be concise, clinically sound, and suitable for regulated practice records.`;

// Obvious direct identifiers are removed before text leaves our infrastructure.
// This is a safety net, not de-identification: free-text names and places can
// still be present, which is why clinicians must opt in (AiConsentDialog).
const REDACTIONS: Array<[RegExp, string]> = [
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[email redacted]"],
  // Phone numbers: 416-555-1234, (416) 555 1234, +1 416.555.1234
  [/(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[phone redacted]"],
  // Ontario health card: 1234-567-890 or 1234 567 890, optional 2-letter version code
  [/\b\d{4}[\s-]?\d{3}[\s-]?\d{3}(?:[\s-]?[A-Z]{2})?\b/g, "[health number redacted]"],
  // SIN: 123 456 789 / 123-456-789 / 123456789
  [/\b\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/g, "[SIN redacted]"],
  // Canadian postal code: A1A 1A1
  [/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s-]?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi, "[postal code redacted]"],
  // Dates written with a 4-digit year (e.g. DOB 1990-04-12, 12/04/1990)
  [/\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/g, "[date redacted]"],
];

export function sanitize(text: string | undefined | null): string {
  if (!text) return "";
  let out = text;
  for (const [pattern, replacement] of REDACTIONS) out = out.replace(pattern, replacement);
  return out.trim().slice(0, 8000);
}

export interface NoteAssistInput {
  note_format?: string;
  section_1?: string;
  section_2?: string;
  section_3?: string;
  section_4?: string;
  session_context?: string;
}

export function buildUserPrompt(input: NoteAssistInput): { format: string; prompt: string } {
  const fmt = (input.note_format || "DAP").toUpperCase();
  const config = NOTE_FORMAT_PROMPTS[fmt] ?? NOTE_FORMAT_PROMPTS.DAP;
  const format = NOTE_FORMAT_PROMPTS[fmt] ? fmt : "DAP";
  const sections = [input.section_1, input.section_2, input.section_3, input.section_4].map(sanitize);
  const ctx = sanitize(input.session_context) || "individual therapy session";

  const parts = config.labels
    .map((label, i) => (sections[i] ? `${label} notes: ${sections[i]}` : `${label} notes: (none provided)`))
    .join("\n\n");

  const prompt = `You are assisting a Canadian regulated health practitioner draft a ${format} session note.
Session context: ${ctx}

${parts}

${config.instruction}

Respond with ONLY the formatted note — no preamble, no explanation, no markdown headers.
Format each section with its label (e.g. "${config.labels[0]}:\n...") separated by blank lines.
Only use information present in the clinician's notes above. If a section has no information, write "Not documented."
This note will be reviewed and edited by the clinician before saving.`;
  return { format, prompt };
}
