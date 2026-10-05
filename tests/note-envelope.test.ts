import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { decideAiAuth, readJwtClaims } from "../supabase/functions/_shared/ai-access.ts";
import {
  DecryptionError,
  KeyConfigError,
  decodeMasterKey,
  decryptUtf8,
  encryptUtf8,
  generateDek,
  unwrapDek,
  wrapDek,
} from "../supabase/functions/_shared/note-envelope.ts";
import { loadOrCreateDek, type WrappedKeyStore } from "../supabase/functions/_shared/practice-keys.ts";

const FORBIDDEN = "*** Decryption failed or data is corrupted ***";

function b64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fakeJwt(payload: object): string {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `eyJhbGciOiJub25lIn0.${body}.sig`;
}

test("envelope round-trip and fail closed", async () => {
  const kek = decodeMasterKey(b64(crypto.getRandomValues(new Uint8Array(32))));
  const dek = generateDek();
  const wrapped = await wrapDek(dek, kek);
  const opened = await unwrapDek(wrapped, kek);
  assert.deepEqual(opened, dek);

  const cipher = await encryptUtf8("session note", dek);
  assert.equal(await decryptUtf8(cipher, dek), "session note");
  assert.equal(await encryptUtf8("", dek), "");
  assert.equal(await decryptUtf8("", dek), "");

  const other = generateDek();
  await assert.rejects(() => decryptUtf8(cipher, other), DecryptionError);
  await assert.rejects(() => unwrapDek(wrapped, other), DecryptionError);
  await assert.rejects(() => decryptUtf8(cipher.slice(0, -2) + "aa", dek), DecryptionError);
  await assert.rejects(() => decryptUtf8("bXktdmVyeS1vbGQtY2lwaGVy", dek), DecryptionError);

  await assert.rejects(
    () => decryptUtf8("not-envelope", dek),
    (error: unknown) => {
      assert.ok(error instanceof DecryptionError);
      assert.equal((error as Error).message, "Decryption failed");
      assert.notEqual((error as Error).message, FORBIDDEN);
      return true;
    },
  );
});

test("master key must be 32 bytes", () => {
  assert.throws(() => decodeMasterKey(""), KeyConfigError);
  assert.throws(() => decodeMasterKey(b64(new Uint8Array(16))), KeyConfigError);
  assert.throws(() => decodeMasterKey("%%%"), KeyConfigError);
});

test("a failed unwrap does not mint a replacement data key", async () => {
  const kek = crypto.getRandomValues(new Uint8Array(32));
  let inserts = 0;
  const store: WrappedKeyStore = {
    async get() {
      return "mp1.not-a-valid-wrap";
    },
    async insertIfAbsent() {
      inserts += 1;
    },
  };
  await assert.rejects(() => loadOrCreateDek(store, "practice", kek, "env:NOTE_MASTER_KEY:v1"), DecryptionError);
  assert.equal(inserts, 0);
});

test("raced creates keep the stored data key", async () => {
  const kek = crypto.getRandomValues(new Uint8Array(32));
  let row: string | null = null;
  const store: WrappedKeyStore = {
    async get() {
      return row;
    },
    async insertIfAbsent(_practiceId, wrapped) {
      if (!row) row = wrapped;
    },
  };
  const [first, second] = await Promise.all([
    loadOrCreateDek(store, "practice", kek, "env:NOTE_MASTER_KEY:v1"),
    loadOrCreateDek(store, "practice", kek, "env:NOTE_MASTER_KEY:v1"),
  ]);
  const cipher = await encryptUtf8("shared", first);
  assert.equal(await decryptUtf8(cipher, second), "shared");
});

test("anon tokens are rejected and there is no demo caller", () => {
  assert.deepEqual(decideAiAuth(null), { action: "reject" });
  assert.deepEqual(decideAiAuth({ role: "anon", sub: "someone" }), { action: "reject" });
  assert.deepEqual(decideAiAuth({ role: "authenticated" }), { action: "reject" });
  assert.deepEqual(
    decideAiAuth(readJwtClaims(fakeJwt({ role: "anon" }))),
    { action: "reject" },
  );
  assert.deepEqual(
    decideAiAuth(readJwtClaims(fakeJwt({ role: "authenticated", sub: "user-1" }))),
    { action: "verify-user" },
  );
  assert.equal(readJwtClaims("not-a-jwt"), null);

  const actions = new Set(["reject", "verify-user"]);
  assert.equal(actions.has(decideAiAuth({ role: "anon" }).action), true);
  assert.equal(JSON.stringify(decideAiAuth({ role: "anon" })).includes("demo"), false);
});

test("shipped paths no longer derive note keys or accept a demo AI user", () => {
  const encryption = readFileSync(new URL("../src/utils/encryption.ts", import.meta.url), "utf8");
  assert.equal(encryption.includes("PBKDF2"), false);
  assert.equal(encryption.includes("mentalpath-salt"), false);
  assert.equal(encryption.includes(FORBIDDEN), false);

  for (const relative of [
    "../supabase/functions/server/ai-routes.ts",
    "../supabase/functions/make-server-4d1a502d/ai-routes.ts",
  ]) {
    const source = readFileSync(new URL(relative, import.meta.url), "utf8");
    assert.equal(source.includes("demo-user"), false);
    assert.equal(source.includes("isAnonKey"), false);
    assert.match(source, /decideAiAuth/);
    assert.match(source, /auth\.getUser/);
  }

  const client = readFileSync(new URL("../src/app/services/aiNoteService.ts", import.meta.url), "utf8");
  assert.equal(client.includes("publicAnonKey"), false);
  assert.match(client, /access_token/);
});
