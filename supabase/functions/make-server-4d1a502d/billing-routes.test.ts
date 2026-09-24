import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { buildT2125Summary, csvSafe, generateT2125CSV } from "./billing-routes.ts";

Deno.test("csvSafe neutralises spreadsheet formulas and quotes special characters", () => {
  assertEquals(csvSafe("=HYPERLINK(\"x\")"), `"'=HYPERLINK(""x"")"`);
  assertEquals(csvSafe("+1"), "'+1");
  assertEquals(csvSafe("Smith, J"), `"Smith, J"`);
  assertEquals(csvSafe("plain"), "plain");
});

Deno.test("T2125 summary totals by month", () => {
  const summary = buildT2125Summary("2026", [
    { invoiceNumber: "INV-1", date: "2026-01-15", client: "A", amount: 140, sessions: 1 },
    { invoiceNumber: "INV-2", date: "2026-01-20", client: "B", amount: 280, sessions: 2 },
    { invoiceNumber: "INV-3", date: "2026-12-01", client: "=cmd", amount: 100.5, sessions: 1 },
  ]);
  assertEquals(summary.grossRevenue, 520.5);
  assertEquals(summary.totalSessions, 4);
  assertEquals(summary.monthlyBreakdown[0].revenue, 420);
  assertEquals(summary.monthlyBreakdown[11].invoices, 1);
  const csv = generateT2125CSV(summary);
  assertStringIncludes(csv, "Total Gross Revenue,520.50");
  assertStringIncludes(csv, "INV-3,2026-12-01,'=cmd,100.50,1");
});
