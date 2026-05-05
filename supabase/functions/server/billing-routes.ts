// MentalPath — Billing & T2125 Tax Export Routes
// For Canadian mental health practitioners

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.ts";

const app = new Hono();

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  sessions: number;
  userId: string;
}

// POST /make-server-4d1a502d/invoices - Create new invoice
app.post("/make-server-4d1a502d/invoices", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.split(" ")[1];
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { clientName, amount, sessions, date } = body;

    // ── M-04: Validate invoice fields ──────────────────────────────────────
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 99999) {
      return c.json({ error: "Invalid amount — must be a positive number up to 99999" }, 400);
    }
    const parsedSessions = parseInt(sessions, 10);
    if (isNaN(parsedSessions) || parsedSessions < 1 || parsedSessions > 100) {
      return c.json({ error: "Invalid sessions — must be between 1 and 100" }, 400);
    }
    if (!clientName || typeof clientName !== 'string' || clientName.length < 1 || clientName.length > 200) {
      return c.json({ error: "Invalid clientName — must be 1–200 characters" }, 400);
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json({ error: "Invalid date — must be YYYY-MM-DD" }, 400);
    }

    // Generate invoice number
    const invoiceCountKey = `invoice_count:${user.id}`;
    const currentCount = await kv.get(invoiceCountKey);
    const newCount = currentCount ? parseInt(currentCount as string, 10) + 1 : 1;
    await kv.set(invoiceCountKey, String(newCount));

    const invoiceNumber = `INV-${String(newCount).padStart(4, '0')}`;
    const invoiceId = crypto.randomUUID();

    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      clientName,
      date: date || new Date().toISOString().split('T')[0],
      amount: parsedAmount,
      status: 'pending',
      sessions: parsedSessions,
      userId: user.id,
    };

    // Store invoice
    await kv.set(`invoice:${invoiceId}`, JSON.stringify(invoice));
    
    // Add to user's invoice list
    const userInvoicesKey = `invoices:${user.id}`;
    const existingInvoices = await kv.get(userInvoicesKey);
    const invoiceList = existingInvoices ? JSON.parse(existingInvoices as string) : [];
    invoiceList.unshift(invoiceId);
    await kv.set(userInvoicesKey, JSON.stringify(invoiceList));

    console.log(JSON.stringify({
      event: "invoice_created",
      user_id: user.id,
      invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      amount: invoice.amount,
      timestamp: new Date().toISOString(),
    }));

    return c.json({ invoice });

  } catch (error) {
    console.error("Create invoice error:", error);
    return c.json({ error: "Failed to create invoice" }, 500);
  }
});

// GET /make-server-4d1a502d/invoices - Get all user invoices
app.get("/make-server-4d1a502d/invoices", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.split(" ")[1];
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userInvoicesKey = `invoices:${user.id}`;
    const invoiceListData = await kv.get(userInvoicesKey);
    const invoiceIds = invoiceListData ? JSON.parse(invoiceListData as string) : [];

    const invoices = await Promise.all(
      invoiceIds.map(async (id: string) => {
        const data = await kv.get(`invoice:${id}`);
        return data ? JSON.parse(data as string) : null;
      })
    );

    return c.json({ 
      invoices: invoices.filter(inv => inv !== null)
    });

  } catch (error) {
    console.error("Get invoices error:", error);
    return c.json({ error: "Failed to fetch invoices" }, 500);
  }
});

// PATCH /make-server-4d1a502d/invoices/:id - Update invoice status
app.patch("/make-server-4d1a502d/invoices/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.split(" ")[1];
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const invoiceId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    const invoiceData = await kv.get(`invoice:${invoiceId}`);
    if (!invoiceData) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    const invoice = JSON.parse(invoiceData as string);
    
    // Verify ownership
    if (invoice.userId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Update status
    invoice.status = status;
    await kv.set(`invoice:${invoiceId}`, JSON.stringify(invoice));

    return c.json({ invoice });

  } catch (error) {
    console.error("Update invoice error:", error);
    return c.json({ error: "Failed to update invoice" }, 500);
  }
});

// GET /make-server-4d1a502d/tax-export/t2125/:year - Generate T2125 summary
app.get("/make-server-4d1a502d/tax-export/t2125/:year", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accessToken = authHeader.split(" ")[1];
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const year = c.req.param("year");

    // ── L-03: Validate year param ───────────────────────────────────────────
    if (!/^\d{4}$/.test(year)) {
      return c.json({ error: "Invalid year — must be a 4-digit year" }, 400);
    }
    
    // Get all user invoices
    const userInvoicesKey = `invoices:${user.id}`;
    const invoiceListData = await kv.get(userInvoicesKey);
    const invoiceIds = invoiceListData ? JSON.parse(invoiceListData as string) : [];

    const allInvoices = await Promise.all(
      invoiceIds.map(async (id: string) => {
        const data = await kv.get(`invoice:${id}`);
        return data ? JSON.parse(data as string) : null;
      })
    );

    // Filter by year and paid status
    const yearInvoices = allInvoices.filter(inv => {
      if (!inv) return false;
      const invYear = new Date(inv.date).getFullYear().toString();
      return invYear === year && inv.status === 'paid';
    });

    // Calculate totals
    const totalRevenue = yearInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalSessions = yearInvoices.reduce((sum, inv) => sum + inv.sessions, 0);

    // Generate T2125 formatted summary
    const t2125Summary = {
      year,
      businessName: "Mental Health Services / Psychotherapy Practice",
      businessActivity: "Registered Psychotherapy Services",
      grossRevenue: totalRevenue,
      totalInvoices: yearInvoices.length,
      totalSessions,
      monthlyBreakdown: generateMonthlyBreakdown(yearInvoices),
      invoiceDetails: yearInvoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        client: inv.clientName,
        amount: inv.amount,
        sessions: inv.sessions,
      })),
      notes: [
        "This is a summary of gross professional income only.",
        "Business expenses should be tracked separately for T2125 Part 2.",
        "Common deductible expenses for psychotherapists: office rent, professional liability insurance, continuing education, professional membership fees, office supplies, advertising.",
        "Consult a tax professional for complete T2125 preparation.",
        "Keep this report with your tax records for CRA documentation."
      ],
    };

    // Generate CSV format for easy import
    const csv = generateT2125CSV(t2125Summary);

    console.log(JSON.stringify({
      event: "t2125_export",
      user_id: user.id,
      year,
      total_revenue: totalRevenue,
      total_invoices: yearInvoices.length,
      timestamp: new Date().toISOString(),
    }));

    return c.json({ 
      summary: t2125Summary,
      csv,
      fileName: `MentalPath_T2125_${year}_${user.email?.split('@')[0] || 'export'}.csv`
    });

  } catch (error) {
    console.error("T2125 export error:", error);
    return c.json({ error: "Failed to generate T2125 summary" }, 500);
  }
});

function generateMonthlyBreakdown(invoices: Invoice[]) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('en-US', { month: 'long' }),
    revenue: 0,
    sessions: 0,
    invoices: 0,
  }));

  invoices.forEach(inv => {
    const monthIndex = new Date(inv.date).getMonth();
    months[monthIndex].revenue += inv.amount;
    months[monthIndex].sessions += inv.sessions;
    months[monthIndex].invoices += 1;
  });

  return months;
}

// ── M-01: CSV injection protection ─────────────────────────────────────────
// Prefixes cells that start with formula trigger characters with a tab,
// and properly quotes cells that contain commas, quotes, or newlines.
function csvSafe(value: string): string {
  const str = String(value ?? '');
  // Prefix potential formula triggers so they are treated as text by spreadsheet apps
  if (/^[=+\-@\t\r|%]/.test(str)) return `\t${str}`;
  // Quote cells that contain special CSV characters
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateT2125CSV(summary: any): string {
  const lines = [
    "MentalPath T2125 Income Summary",
    `Tax Year,${summary.year}`,
    `Business Activity,${summary.businessActivity}`,
    "",
    "GROSS REVENUE SUMMARY",
    `Total Gross Revenue,$${summary.grossRevenue.toFixed(2)}`,
    `Total Invoices,${summary.totalInvoices}`,
    `Total Sessions,${summary.totalSessions}`,
    "",
    "MONTHLY BREAKDOWN",
    "Month,Revenue,Sessions,Invoices",
    ...summary.monthlyBreakdown.map((m: any) => 
      `${m.month},$${m.revenue.toFixed(2)},${m.sessions},${m.invoices}`
    ),
    "",
    "DETAILED INVOICE LIST",
    "Invoice Number,Date,Client,Amount,Sessions",
    ...summary.invoiceDetails.map((inv: any) =>
      `${csvSafe(inv.invoiceNumber)},${csvSafe(inv.date)},${csvSafe(inv.client)},$${inv.amount.toFixed(2)},${inv.sessions}`
    ),
    "",
    "NOTES FOR T2125 PREPARATION",
    ...summary.notes.map((note: string) => `"${note}"`),
  ];

  return lines.join('\n');
}

export default app;
