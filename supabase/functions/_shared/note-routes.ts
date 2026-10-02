// Server-side envelope encryption for session-note sections.
// The browser sends plaintext over TLS and stores only ciphertext.
// Practice id is the authenticated user id until a practices table exists.

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import { decideAiAuth, readJwtClaims } from "./ai-access.ts";
import {
  DecryptionError,
  KeyConfigError,
  decodeMasterKey,
  decryptUtf8,
  encryptUtf8,
} from "./note-envelope.ts";
import { loadOrCreateDek, type WrappedKeyStore } from "./practice-keys.ts";

const KEK_ID = "env:NOTE_MASTER_KEY:v1";
const MAX_SECTIONS = 8;
const MAX_CHARS = 20_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const app = new Hono();

function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

function keyStore(supabase: ReturnType<typeof serviceClient>): WrappedKeyStore {
  return {
    async get(practiceId) {
      const { data, error } = await supabase
        .from("practice_data_keys")
        .select("wrapped_dek")
        .eq("practice_id", practiceId)
        .maybeSingle();
      if (error) {
        console.error("practice_data_keys read failed", error.code);
        throw new Error("Failed to load data key");
      }
      return data?.wrapped_dek ?? null;
    },
    async insertIfAbsent(practiceId, wrappedDek, kekId) {
      const { error } = await supabase.from("practice_data_keys").insert({
        practice_id: practiceId,
        wrapped_dek: wrappedDek,
        kek_id: kekId,
      });
      if (error && error.code !== "23505") {
        console.error("practice_data_keys insert failed", error.code);
        throw new Error("Failed to store data key");
      }
    },
  };
}

async function authorizedPractice(c: { req: { header: (name: string) => string | undefined }; json: (body: unknown, status?: number) => Response }) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: c.json({ error: "Unauthorized" }, 401) };
  }
  const accessToken = authHeader.slice("Bearer ".length).trim();
  if (!accessToken || decideAiAuth(readJwtClaims(accessToken)).action !== "verify-user") {
    return { error: c.json({ error: "Unauthorized" }, 401) };
  }

  const supabase = serviceClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user || !UUID_RE.test(user.id)) {
    return { error: c.json({ error: "Unauthorized" }, 401) };
  }
  return { supabase, practiceId: user.id };
}

function readSections(body: { sections?: unknown }): string[] | null {
  if (!body || !Array.isArray(body.sections) || body.sections.length > MAX_SECTIONS) return null;
  const sections: string[] = [];
  for (const section of body.sections) {
    if (typeof section !== "string" || section.length > MAX_CHARS) return null;
    sections.push(section);
  }
  return sections;
}

async function withDek(
  c: { req: { header: (name: string) => string | undefined; json: () => Promise<unknown> }; json: (body: unknown, status?: number) => Response },
  run: (sections: string[], dek: Uint8Array) => Promise<Response>,
) {
  const auth = await authorizedPractice(c);
  if ("error" in auth && auth.error) return auth.error;

  let kek: Uint8Array;
  try {
    kek = decodeMasterKey(Deno.env.get("NOTE_MASTER_KEY"));
  } catch (error) {
    if (error instanceof KeyConfigError) {
      return c.json({ error: "Note encryption is not configured" }, 503);
    }
    throw error;
  }

  let body: { sections?: unknown };
  try {
    body = await c.req.json() as { sections?: unknown };
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const sections = readSections(body);
  if (!sections) return c.json({ error: "Invalid sections" }, 400);

  try {
    const dek = await loadOrCreateDek(keyStore(auth.supabase), auth.practiceId, kek, KEK_ID);
    return await run(sections, dek);
  } catch (error) {
    if (error instanceof DecryptionError || error instanceof KeyConfigError) {
      return c.json({ error: "Decryption failed" }, 422);
    }
    console.error("note envelope error");
    return c.json({ error: "Note encryption unavailable" }, 503);
  }
}

app.post("/make-server-4d1a502d/notes/encrypt", (c) =>
  withDek(c, async (sections, dek) => {
    const out: string[] = [];
    for (const section of sections) {
      out.push(await encryptUtf8(section, dek));
    }
    return c.json({ sections: out });
  }));

app.post("/make-server-4d1a502d/notes/decrypt", (c) =>
  withDek(c, async (sections, dek) => {
    const out: string[] = [];
    for (const section of sections) {
      try {
        out.push(await decryptUtf8(section, dek));
      } catch (error) {
        if (error instanceof DecryptionError) {
          return c.json({ error: "Decryption failed" }, 422);
        }
        throw error;
      }
    }
    return c.json({ sections: out });
  }));

export default app;
