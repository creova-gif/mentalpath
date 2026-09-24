// MentalPath — account data export, deletion requests, and the public contact form.
import { Hono } from "npm:hono";
import { requireUser, serviceClient } from "./auth.ts";

const app = new Hono();

function tokenAal(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.aal === "string" ? payload.aal : null;
  } catch {
    return null;
  }
}

// GET /make-server-4d1a502d/account/export
// PIPEDA/PHIPA right of access & practice portability: everything this
// clinician has stored, as JSON. Requires an MFA-verified session.
app.get("/make-server-4d1a502d/account/export", async (c) => {
  const auth = await requireUser(c);
  if (auth instanceof Response) return auth;
  if (tokenAal(auth.token) !== "aal2") return c.json({ error: "Verify two-factor authentication first." }, 403);

  const id = auth.user.id;
  const db = serviceClient();
  const [profile, clients, notes, amendments, invoices, appointments, intake, audit] = await Promise.all([
    db.from("clinicians").select("*").eq("id", id).maybeSingle(),
    db.from("clients").select("*").eq("clinician_id", id),
    db.from("session_notes").select("*").eq("clinician_id", id),
    db.from("session_note_amendments").select("*").eq("clinician_id", id),
    db.from("invoices").select("*").eq("clinician_id", id),
    db.from("appointments").select("*").eq("clinician_id", id),
    db.from("intake_forms").select("*, clients!inner(clinician_id)").eq("clients.clinician_id", id),
    db.from("audit_log").select("*").eq("clinician_id", id).order("id"),
  ]);
  const failed = [profile, clients, notes, amendments, invoices, appointments, intake, audit].find((r) => r.error);
  if (failed) {
    console.error("export query failed:", failed.error?.code);
    return c.json({ error: "Export failed. Please try again." }, 500);
  }

  await db.from("audit_log").insert({
    clinician_id: id, action: "DATA_EXPORTED", table_name: "clinicians", record_id: id,
    details: { counts: { clients: clients.data?.length, notes: notes.data?.length, invoices: invoices.data?.length } },
  });

  const exportedAt = new Date().toISOString();
  return c.json({
    format: "mentalpath-export-v1",
    exported_at: exportedAt,
    notice: "Session notes with enc_version = 1 were stored with the retired browser-side scheme; open them in MentalPath to read them before exporting, or contact support.",
    profile: profile.data,
    clients: clients.data,
    session_notes: notes.data,
    session_note_amendments: amendments.data,
    invoices: invoices.data,
    appointments: appointments.data,
    intake_forms: intake.data?.map(({ clients: _c, ...row }) => row),
    audit_log: audit.data,
  }, 200, { "Content-Disposition": `attachment; filename="mentalpath-export-${exportedAt.slice(0, 10)}.json"` });
});

// POST /make-server-4d1a502d/account/delete
// Clinical records must be kept for the retention period set by the clinician's
// College, so "delete" closes the account immediately (sign-in blocked,
// subscription must be cancelled) and schedules record purge after retention.
app.post("/make-server-4d1a502d/account/delete", async (c) => {
  const auth = await requireUser(c);
  if (auth instanceof Response) return auth;
  if (tokenAal(auth.token) !== "aal2") return c.json({ error: "Verify two-factor authentication first." }, 403);

  let confirm = "";
  try { confirm = (await c.req.json())?.confirm ?? ""; } catch { /* empty body */ }
  if (confirm !== "DELETE") return c.json({ error: 'Type DELETE to confirm.' }, 400);

  const id = auth.user.id;
  const db = serviceClient();
  const { data: row } = await db.from("clinicians").select("subscription_status").eq("id", id).maybeSingle();
  if (["active", "trialing", "past_due"].includes(row?.subscription_status)) {
    return c.json({ error: "Cancel your subscription in the billing portal first.", code: "ACTIVE_SUBSCRIPTION" }, 409);
  }

  const { error } = await db.from("clinicians").update({ deletion_requested_at: new Date().toISOString() }).eq("id", id);
  if (error) return c.json({ error: "Could not close the account. Please contact support." }, 500);
  await db.from("audit_log").insert({ clinician_id: id, action: "ACCOUNT_CLOSED", table_name: "clinicians", record_id: id });
  // Block sign-in and revoke sessions.
  await db.auth.admin.updateUserById(id, { ban_duration: "876000h" });
  await db.auth.admin.signOut(auth.token, "global").catch(() => {});
  return c.json({ closed: true });
});

// POST /make-server-4d1a502d/contact  (public)
app.post("/make-server-4d1a502d/contact", async (c) => {
  // deno-lint-ignore no-explicit-any
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON" }, 400); }
  if (body?.website) return c.json({ ok: true }); // honeypot field: bots fill it, people don't see it

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const message = String(body?.message ?? "").trim();
  if (!name || name.length > 200) return c.json({ error: "Please enter your name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return c.json({ error: "Please enter a valid email." }, 400);
  if (subject.length > 200) return c.json({ error: "Subject is too long." }, 400);
  if (message.length < 5 || message.length > 5000) return c.json({ error: "Please enter a message (5–5000 characters)." }, 400);

  const { error } = await serviceClient().from("contact_messages").insert({ name, email, subject, message });
  if (error) {
    console.error("contact insert failed:", error.code);
    return c.json({ error: "Could not send your message. Please email support@mentalpath.ca." }, 500);
  }
  return c.json({ ok: true });
});

export default app;
