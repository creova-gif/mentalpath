import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { buildUserPrompt, sanitize } from "./ai-prompts.ts";

Deno.test("sanitize removes direct identifiers", () => {
  const cases: Array<[string, string]> = [
    ["email jane.doe@example.ca today", "[email redacted]"],
    ["call 416-555-1234", "[phone redacted]"],
    ["call (416) 555 1234", "[phone redacted]"],
    ["call +1 416.555.1234", "[phone redacted]"],
    ["OHIP 1234-567-890-AB", "[health number redacted]"],
    ["SIN 123 456 789", "[SIN redacted]"],
    ["lives near M5V 2T6", "[postal code redacted]"],
    ["DOB 1990-04-12", "[date redacted]"],
    ["DOB 12/04/1990", "[date redacted]"],
  ];
  for (const [input, marker] of cases) {
    const out = sanitize(input);
    assertStringIncludes(out, marker, `for input: ${input}`);
    assert(!/\d{3}/.test(out.replace(marker, "")), `digits leaked for: ${input} → ${out}`);
  }
});

Deno.test("sanitize keeps clinical content intact", () => {
  const text = "Client reported PHQ-9 of 12, down from 18 over 6 sessions. Slept 5 hours on average.";
  assertEquals(sanitize(text), text);
});

Deno.test("sanitize handles empty values and caps length", () => {
  assertEquals(sanitize(undefined), "");
  assertEquals(sanitize(""), "");
  assertEquals(sanitize("a".repeat(10_000)).length, 8000);
});

Deno.test("buildUserPrompt uses the requested format's labels and scrubs every section", () => {
  const { format, prompt } = buildUserPrompt({
    note_format: "soap",
    section_1: "Client (reach at 416-555-1234) reports low mood",
    section_2: "Flat affect",
    section_3: "",
    section_4: "Follow up in 1 week",
    session_context: "video session, 50 minutes",
  });
  assertEquals(format, "SOAP");
  assertStringIncludes(prompt, "Subjective notes: Client (reach at [phone redacted]) reports low mood");
  assertStringIncludes(prompt, "Assessment notes: (none provided)");
  assertStringIncludes(prompt, "Plan notes: Follow up in 1 week");
  assert(!prompt.includes("416-555-1234"));
});

Deno.test("buildUserPrompt falls back to DAP for unknown formats", () => {
  assertEquals(buildUserPrompt({ note_format: "xyz" }).format, "DAP");
});
