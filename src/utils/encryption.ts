// Session notes are encrypted on the server. The browser must not derive a key.
// Decrypt failures throw. They do not become note text.

import { projectId } from '/utils/supabase/info';
import { supabase } from './supabase/client';

const FUNCTION_BASE = '/functions/v1/make-server-4d1a502d/notes';

export class DecryptionError extends Error {
  constructor() {
    super('Decryption failed');
    this.name = 'DecryptionError';
  }
}

async function accessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
}

async function postSections(op: 'encrypt' | 'decrypt', sections: string[]): Promise<string[]> {
  const token = await accessToken();
  const base = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
  const response = await fetch(`${base}${FUNCTION_BASE}/${op}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sections }),
  });

  if (!response.ok) {
    if (op === 'decrypt') throw new DecryptionError();
    throw new Error('Encryption failed for sensitive data');
  }

  const payload = await response.json().catch(() => null) as { sections?: unknown } | null;
  if (!payload || !Array.isArray(payload.sections) || payload.sections.length !== sections.length) {
    if (op === 'decrypt') throw new DecryptionError();
    throw new Error('Encryption failed for sensitive data');
  }
  if (payload.sections.some((section) => typeof section !== 'string')) {
    if (op === 'decrypt') throw new DecryptionError();
    throw new Error('Encryption failed for sensitive data');
  }
  return payload.sections as string[];
}

export async function encryptSections(sections: string[]): Promise<string[]> {
  if (sections.length === 0) return [];
  return postSections('encrypt', sections);
}

export async function decryptText(encrypted: string): Promise<string> {
  if (!encrypted) return encrypted;
  const [plain] = await postSections('decrypt', [encrypted]);
  return plain;
}
