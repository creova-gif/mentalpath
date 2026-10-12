import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import en from '@/i18n/locales/en.json';
import fr from '@/i18n/locales/fr.json';

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

function leaves(value: Json, path = ''): Map<string, string> {
  const out = new Map<string, string>();
  if (Array.isArray(value)) {
    value.forEach((v, i) => leaves(v, `${path}[${i}]`).forEach((s, k) => out.set(k, s)));
  } else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k).forEach((s, key) => out.set(key, s));
  } else {
    out.set(path, String(value));
  }
  return out;
}

const enLeaves = leaves(en as Json);
const frLeaves = leaves(fr as Json);
const vars = (s: string) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map(m => m[1]).sort();
const tags = (s: string) => [...s.matchAll(/<(\/?\w+)>/g)].map(m => m[1]).sort();

describe('EN/FR locale parity', () => {
  it('has the same keys (and array lengths) in both languages', () => {
    const missingInFr = [...enLeaves.keys()].filter(k => !frLeaves.has(k));
    const missingInEn = [...frLeaves.keys()].filter(k => !enLeaves.has(k));
    expect({ missingInFr, missingInEn }).toEqual({ missingInFr: [], missingInEn: [] });
  });

  it('has no empty strings', () => {
    const empty = [...enLeaves, ...frLeaves].filter(([, v]) => v.trim() === '').map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it('uses the same interpolation variables and <Trans> tags in both languages', () => {
    const mismatched = [...enLeaves.keys()].filter(k => frLeaves.has(k)
      && (vars(enLeaves.get(k)!).join() !== vars(frLeaves.get(k)!).join() || tags(enLeaves.get(k)!).join() !== tags(frLeaves.get(k)!).join()));
    expect(mismatched).toEqual([]);
  });
});

// Production screens must not hard-code UI text. Dev-only prototypes (not
// bundled in production, see routes.tsx) and shadcn/ui primitives are exempt.
const DEV_ONLY = new Set(['AITest', 'BookingPage', 'ClientPortal', 'ClientPortalFull', 'ClinicalTools', 'CulturalTemplates',
  'HEPBuilder', 'Messages', 'ProfessionIntake', 'TherapistWellbeing', 'TreatmentCourses']);
const ALLOWED = new Set(['MentalPath', 'FAQ', 'IP', '24/7', 'DAP', 'SOAP', 'BIRP', 'PHQ-9', 'GAD-7', 'Promise', 'item.anchor ? (',
  'mentalpath.ca/book/', 'A: P:']);
const PATTERNS: [string, RegExp][] = [
  ['jsx text', />\s*([A-Za-z][A-Za-z0-9 ,.'’!?&()/:;—–-]{2,})\s*</g],
  ['prop', /\b(?:aria-label|placeholder|title|alt|label|hint)="([A-Za-z][^"]{2,})"/g],
  ['toast', /toast\.(?:success|error|info|warning)\(\s*['"`]([A-Z][^'"`]+)/g],
  ['dialog', /window\.(?:confirm|prompt|alert)\(\s*['"`]([A-Z][^'"`]+)/g],
  ['error state', /set(?:Error|LoadError|CodeError)\(\s*['"`]([A-Z][^'"`]+)/g],
  ['fixed locale', /('en-CA')/g],
];

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === 'ui' || name === 'figma' ? [] : tsxFiles(p);
    return p.endsWith('.tsx') && !DEV_ONLY.has(basename(p, '.tsx')) ? [p] : [];
  });
}

describe('i18n coverage', () => {
  it('production components contain no hard-coded UI text', () => {
    const root = join(__dirname, '..', 'app', 'components');
    const files = [...tsxFiles(root), join(root, 'ui', 'PreviewPage.tsx')];
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      for (const [kind, re] of PATTERNS) {
        for (const m of src.matchAll(re)) {
          const text = (m[1] ?? m[0]).trim();
          if (!ALLOWED.has(text)) offenders.push(`${basename(file)} [${kind}] ${text.slice(0, 60)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
