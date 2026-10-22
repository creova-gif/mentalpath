import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { scrubPII, segmentPII } from '../piiScrubber.ts';

describe('PII Scrubber for Canadian PHIPA Compliance', () => {
  test('redacts OHIP and Canadian health numbers', () => {
    const input = 'Patient OHIP number is 1234 567 890 AB and secondary card 9876543210.';
    const result = scrubPII(input);
    assert.equal(result.hasRedactions, true);
    assert.ok(!result.scrubbedText.includes('1234 567 890 AB'));
    assert.ok(!result.scrubbedText.includes('9876543210'));
    assert.ok(result.scrubbedText.includes('[OHIP/Health Card Number]'));
  });

  test('redacts Canadian postal codes', () => {
    const input = 'Client lives near M5V 2T6 in Toronto, formerly K1A 0B1 in Ottawa.';
    const result = scrubPII(input);
    assert.equal(result.hasRedactions, true);
    assert.ok(!result.scrubbedText.includes('M5V 2T6'));
    assert.ok(!result.scrubbedText.includes('K1A 0B1'));
    assert.ok(result.scrubbedText.includes('[Postal Code]'));
  });

  test('redacts Canadian phone numbers in various formats', () => {
    const input = 'Contact client at (416) 555-0199 or mobile 647-555-1234 or +1 613 555 4321.';
    const result = scrubPII(input);
    assert.equal(result.hasRedactions, true);
    assert.ok(!result.scrubbedText.includes('416) 555-0199'));
    assert.ok(!result.scrubbedText.includes('647-555-1234'));
    assert.ok(!result.scrubbedText.includes('613 555 4321'));
  });

  test('redacts email addresses', () => {
    const input = 'Send reports to sarah.jenkins@hospital.ca or private patient.email@gmail.com.';
    const result = scrubPII(input);
    assert.equal(result.hasRedactions, true);
    assert.ok(!result.scrubbedText.includes('sarah.jenkins@hospital.ca'));
    assert.ok(!result.scrubbedText.includes('patient.email@gmail.com'));
  });

  test('redacts date of birth notations', () => {
    const input = 'Client DOB: 1988-04-12 presented with elevated anxiety.';
    const result = scrubPII(input);
    assert.equal(result.hasRedactions, true);
    assert.ok(!result.scrubbedText.includes('1988-04-12'));
    assert.ok(result.scrubbedText.includes('DOB: [Date of Birth]'));
  });

  test('redacts explicitly labeled client names and known client names with French accents', () => {
    const input = 'Client: François Tremblay discussed boundary management with family.';
    const result = scrubPII(input, 'François Tremblay');
    assert.equal(result.hasRedactions, true);
    assert.ok(!result.scrubbedText.includes('François Tremblay'));
    assert.ok(result.scrubbedText.includes('[Client Name]'));
  });

  test('STRICT ALLOWLIST: never redacts standard clinical terms and acronyms', () => {
    const clinicalNote = `
      Administered PHQ-9 (score 14) and GAD-7 (score 11).
      Client meets criteria for MDD and severe PTSD symptoms.
      Plan: Continue weekly CBT and DBT distress tolerance skills.
      Consulting psychiatrist regarding SSRI medication compliance.
      DAP note logged per standard clinical protocol.
    `;
    const result = scrubPII(clinicalNote);
    // None of the clinical terms should be removed
    assert.ok(result.scrubbedText.includes('PHQ-9'));
    assert.ok(result.scrubbedText.includes('GAD-7'));
    assert.ok(result.scrubbedText.includes('MDD'));
    assert.ok(result.scrubbedText.includes('PTSD'));
    assert.ok(result.scrubbedText.includes('CBT'));
    assert.ok(result.scrubbedText.includes('DBT'));
    assert.ok(result.scrubbedText.includes('SSRI'));
    assert.ok(result.scrubbedText.includes('DAP'));
  });

  test('segmentPII produces correct segments for visual highlight badges', () => {
    const input = 'Call 416-555-0199 regarding PHQ-9 review.';
    const segments = segmentPII(input);
    assert.ok(segments.length >= 3);
    const phoneSegment = segments.find(s => s.isPII && s.type === 'phone');
    assert.ok(phoneSegment);
    assert.equal(phoneSegment.text, '416-555-0199');
  });
});
