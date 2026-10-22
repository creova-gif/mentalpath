/**
 * PII Scrubber & Tokenizer for Canadian Mental Health Practices
 * 
 * Compliant with Ontario PHIPA (Personal Health Information Protection Act),
 * PIPEDA, and provincial regulatory colleges (CRPO, CCPA, BCACC).
 * 
 * Strips personal health identifiers before payloads leave the client machine.
 */

export type PIIEntityType = 
  | 'health_number'
  | 'postal_code'
  | 'phone'
  | 'email'
  | 'date_of_birth'
  | 'name';

export interface PIIEntity {
  type: PIIEntityType;
  original: string;
  replacement: string;
  index: number;
  label: string;
}

export interface PIIResult {
  scrubbedText: string;
  detectedEntities: PIIEntity[];
  hasRedactions: boolean;
}

export interface TextSegment {
  text: string;
  isPII: boolean;
  type?: PIIEntityType;
  label?: string;
  replacement?: string;
}

// Protected clinical abbreviations and terms that must never be redacted as names or entities
const CLINICAL_ALLOWLIST = new Set([
  'PHQ-9', 'PHQ9', 'GAD-7', 'GAD7', 'PCL-5', 'PCL5', 'BDI', 'BAI', 'DASS-21', 'AUDIT', 'DAST-10',
  'CBT', 'DBT', 'EMDR', 'ACT', 'EFT', 'IFS', 'MBCT', 'CPT', 'MI', 'SFBT',
  'MDD', 'PTSD', 'C-PTSD', 'CPTSD', 'GAD', 'OCD', 'ADHD', 'BPD', 'SAD', 'AUD', 'SUD',
  'DSM-5', 'DSM5', 'DSM-V', 'ICD-10', 'ICD10', 'ICD-11', 'ICD11',
  'SSRI', 'SNRI', 'NDRI', 'MAOI', 'TCA',
  'DAP', 'SOAP', 'BIRP', 'MSE', 'MSE-R', 'PRN', 'BID', 'TID', 'QID',
  'DX', 'SX', 'TX', 'HX', 'RX', 'BX', 'FX', 'WX'
]);

/**
 * Canadian Health Card Numbers
 * OHIP (Ontario): 10 digits followed optionally by 2 version letters (e.g., 1234 567 890 AB or 1234-567-890)
 * BC CareCard / PHN: 10 digits
 * Alberta PHN: 9 digits
 */
const HEALTH_CARD_REGEX = /\b(?:\d{4}[-\s]?\d{3}[-\s]?\d{3}[-\s]?[A-Za-z]{2}|\d{10}|\d{9})\b/g;

/**
 * Canadian Postal Codes (e.g. M5V 2T6, K1A 0B1, V6B-1A1)
 */
const CANADIAN_POSTAL_REGEX = /\b[A-Za-z]\d[A-Za-z][-\s]?\d[A-Za-z]\d\b/g;

/**
 * North American Phone Numbers (10-11 digits with standard dividers or parentheses)
 */
const PHONE_REGEX = /\b(?:\+?1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}\b/g;

/**
 * Email Addresses
 */
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/**
 * Dates of birth or specific labeled dates
 * e.g., DOB: 1985-04-12, born 14/08/1992, Date of Birth: May 12, 1990
 */
const DOB_REGEX = /\b(?:DOB|Date\s+of\s+Birth|Born(?:\s+on)?):\s*(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|[A-Za-z]+\s+\d{1,2},?\s+\d{4})\b/gi;

/**
 * Explicit client/patient introductions
 * e.g., "Client: John Smith", "Patient: Sarah Connor", "Client name is Maria Gonzalez"
 */
const LABELED_NAME_REGEX = /\b(?:Client|Patient|Individual|Pt|Ct)(?:\s+Name)?(?:\s+is|\s*:)\s+([A-ZÀ-ÖØ-öø-ÿ][a-zà-öø-ÿ]+(?:\s+[A-ZÀ-ÖØ-öø-ÿ][a-zà-öø-ÿ]+)+)\b/g;

/**
 * Check if a word or phrase is a clinical protected term
 */
function isClinicalTerm(term: string): boolean {
  return CLINICAL_ALLOWLIST.has(term.toUpperCase().trim());
}

/**
 * Core PII scrubbing engine
 */
export function scrubPII(text: string, knownClientName?: string): PIIResult {
  if (!text || typeof text !== 'string') {
    return { scrubbedText: '', detectedEntities: [], hasRedactions: false };
  }

  const entities: PIIEntity[] = [];

  // 1. Redact known client name if provided (e.g. from active client profile)
  if (knownClientName && knownClientName.trim().length > 1) {
    const trimmedName = knownClientName.trim();
    // Escape regex special chars
    const escaped = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = nameRegex.exec(text)) !== null) {
      if (!isClinicalTerm(match[0])) {
        entities.push({
          type: 'name',
          original: match[0],
          replacement: '[Client Name]',
          index: match.index,
          label: 'Client Name',
        });
      }
    }
  }

  // 2. Redact explicitly labeled client names ("Client: John Smith")
  let match: RegExpExecArray | null;
  while ((match = LABELED_NAME_REGEX.exec(text)) !== null) {
    const capturedName = match[1];
    if (capturedName && !isClinicalTerm(capturedName)) {
      const nameIndex = match.index + match[0].indexOf(capturedName);
      entities.push({
        type: 'name',
        original: capturedName,
        replacement: '[Client Name]',
        index: nameIndex,
        label: 'Client Name',
      });
    }
  }

  // 3. Redact Health Card Numbers (OHIP / PHN)
  while ((match = HEALTH_CARD_REGEX.exec(text)) !== null) {
    const raw = match[0];
    // Exclude simple years or short numbers if matched 9 digits
    if (!isClinicalTerm(raw)) {
      entities.push({
        type: 'health_number',
        original: raw,
        replacement: '[OHIP/Health Card Number]',
        index: match.index,
        label: 'Canadian Health Number',
      });
    }
  }

  // 4. Redact Canadian Postal Codes
  while ((match = CANADIAN_POSTAL_REGEX.exec(text)) !== null) {
    const raw = match[0];
    if (!isClinicalTerm(raw)) {
      entities.push({
        type: 'postal_code',
        original: raw,
        replacement: '[Postal Code]',
        index: match.index,
        label: 'Postal Code',
      });
    }
  }

  // 5. Redact Phone Numbers
  while ((match = PHONE_REGEX.exec(text)) !== null) {
    const raw = match[0];
    entities.push({
      type: 'phone',
      original: raw,
      replacement: '[Phone Number]',
      index: match.index,
      label: 'Phone Number',
    });
  }

  // 6. Redact Email Addresses
  while ((match = EMAIL_REGEX.exec(text)) !== null) {
    const raw = match[0];
    entities.push({
      type: 'email',
      original: raw,
      replacement: '[Email Address]',
      index: match.index,
      label: 'Email Address',
    });
  }

  // 7. Redact Dates of Birth
  while ((match = DOB_REGEX.exec(text)) !== null) {
    const raw = match[0];
    entities.push({
      type: 'date_of_birth',
      original: raw,
      replacement: 'DOB: [Date of Birth]',
      index: match.index,
      label: 'Date of Birth',
    });
  }

  // Deduplicate and sort entities by index descending for safe string replacement
  const sortedEntities = entities
    .sort((a, b) => b.index - a.index)
    .filter((entity, idx, arr) => 
      // Avoid overlapping ranges
      idx === 0 || entity.index + entity.original.length <= arr[idx - 1].index
    );

  let scrubbed = text;
  for (const entity of sortedEntities) {
    scrubbed = 
      scrubbed.substring(0, entity.index) + 
      entity.replacement + 
      scrubbed.substring(entity.index + entity.original.length);
  }

  // Return ascending for UI consumers
  const finalDetected = [...sortedEntities].reverse();

  return {
    scrubbedText: scrubbed,
    detectedEntities: finalDetected,
    hasRedactions: finalDetected.length > 0,
  };
}

/**
 * Break text down into segments for UI visualization with highlight chips
 */
export function segmentPII(text: string, knownClientName?: string): TextSegment[] {
  if (!text) return [];

  const { detectedEntities } = scrubPII(text, knownClientName);
  if (detectedEntities.length === 0) {
    return [{ text, isPII: false }];
  }

  const segments: TextSegment[] = [];
  let currentIndex = 0;

  for (const entity of detectedEntities) {
    if (entity.index > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, entity.index),
        isPII: false,
      });
    }

    segments.push({
      text: entity.original,
      isPII: true,
      type: entity.type,
      label: entity.label,
      replacement: entity.replacement,
    });

    currentIndex = entity.index + entity.original.length;
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isPII: false,
    });
  }

  return segments;
}
