// Session-note envelope encryption.
//
// No cloud KMS is wired. The key-encryption key (KEK) is a 32-byte AES-256
// key supplied as NOTE_MASTER_KEY (base64) in the server environment. That
// value is the stand-in for a KMS customer key.
//
// Each practice has its own data key (DEK). The DEK is random, and only the
// AES-GCM wrap of it is stored. Note fields are encrypted with the DEK.
// Neither key is returned to the browser.
//
// When a KMS is available, replace wrapDek/unwrapDek with KMS Encrypt and
// Decrypt (or GenerateDataKey) and record the KMS key id. Existing note
// ciphertext can stay; only the wrapped DEK is re-wrapped. Do not fall back
// to deriving a key from a user id.

export const ENVELOPE_VERSION = "mp1";

const IV_BYTES = 12;
const KEY_BYTES = 32;
const TAG_BYTES = 16;

export class DecryptionError extends Error {
  constructor() {
    super("Decryption failed");
    this.name = "DecryptionError";
  }
}

export class KeyConfigError extends Error {
  constructor() {
    super("Note encryption is not configured");
    this.name = "KeyConfigError";
  }
}

function bytesToB64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function b64ToBytes(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function decodeMasterKey(encoded: string | undefined | null): Uint8Array {
  if (!encoded || !encoded.trim()) throw new KeyConfigError();
  let raw: Uint8Array;
  try {
    raw = b64ToBytes(encoded.trim());
  } catch {
    throw new KeyConfigError();
  }
  if (raw.byteLength !== KEY_BYTES) throw new KeyConfigError();
  return raw;
}

export function generateDek(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(KEY_BYTES));
}

async function importAes(raw: Uint8Array, usage: "encrypt" | "decrypt"): Promise<CryptoKey> {
  if (raw.byteLength !== KEY_BYTES) throw new DecryptionError();
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [usage]);
}

async function seal(plain: Uint8Array, keyRaw: Uint8Array): Promise<string> {
  const key = await importAes(keyRaw, "encrypt");
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain),
  );
  const combined = new Uint8Array(iv.length + cipher.length);
  combined.set(iv, 0);
  combined.set(cipher, iv.length);
  return `${ENVELOPE_VERSION}.${bytesToB64(combined)}`;
}

async function open(payload: string, keyRaw: Uint8Array): Promise<Uint8Array> {
  if (!payload.startsWith(`${ENVELOPE_VERSION}.`)) throw new DecryptionError();
  let combined: Uint8Array;
  try {
    combined = b64ToBytes(payload.slice(ENVELOPE_VERSION.length + 1));
  } catch {
    throw new DecryptionError();
  }
  if (combined.byteLength < IV_BYTES + TAG_BYTES) throw new DecryptionError();
  const iv = combined.slice(0, IV_BYTES);
  const cipher = combined.slice(IV_BYTES);
  try {
    const key = await importAes(keyRaw, "decrypt");
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
    return new Uint8Array(plain);
  } catch (error) {
    if (error instanceof DecryptionError) throw error;
    throw new DecryptionError();
  }
}

export function wrapDek(dek: Uint8Array, kek: Uint8Array): Promise<string> {
  if (dek.byteLength !== KEY_BYTES) throw new DecryptionError();
  return seal(dek, kek);
}

export async function unwrapDek(wrapped: string, kek: Uint8Array): Promise<Uint8Array> {
  const dek = await open(wrapped, kek);
  if (dek.byteLength !== KEY_BYTES) throw new DecryptionError();
  return dek;
}

export async function encryptUtf8(plaintext: string, dek: Uint8Array): Promise<string> {
  if (plaintext === "") return "";
  return seal(new TextEncoder().encode(plaintext), dek);
}

export async function decryptUtf8(payload: string, dek: Uint8Array): Promise<string> {
  if (payload === "") return "";
  const plain = await open(payload, dek);
  return new TextDecoder().decode(plain);
}
