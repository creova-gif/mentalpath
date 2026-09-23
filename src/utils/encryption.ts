// Read-only support for session notes written by the retired browser-side
// "encryption" scheme (enc_version = 1). That scheme derived its key from the
// user id and provided no real protection; see docs/adr/0001-session-note-storage.md.
// New notes are never encrypted in the browser. Do not add an encrypt function here.

const LEGACY_SALT = 'mentalpath-salt';

async function deriveLegacyKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey('raw', enc.encode(userId), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(LEGACY_SALT), iterations: 100000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
}

export class LegacyDecryptError extends Error {}

/** Decrypts a legacy (enc_version = 1) value. Throws instead of returning placeholder text. */
export async function legacyDecrypt(encryptedBase64: string | null, userId: string): Promise<string> {
  if (!encryptedBase64) return '';
  try {
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const key = await deriveLegacyKey(userId);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: combined.slice(0, 12) }, key, combined.slice(12));
    return new TextDecoder().decode(plain);
  } catch {
    throw new LegacyDecryptError('This note section could not be read. Contact support before editing it.');
  }
}
