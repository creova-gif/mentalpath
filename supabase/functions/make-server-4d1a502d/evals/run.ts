// Offline evaluation for AI Note Assist.
//
//   ANTHROPIC_API_KEY=... deno run --allow-env --allow-net --allow-read evals/run.ts [--model claude-opus-5]
//
// Sends each synthetic case through the SAME prompt builder, scrubber and model
// call as production (ai-prompts.ts + ai-client.ts), then applies deterministic
// graders. Costs one Messages API call per case (6 cases ≈ a few cents) —
// run it deliberately: before changing the model, prompts or scrubber.
import Anthropic from "npm:@anthropic-ai/sdk";
import { buildUserPrompt, NOTE_FORMAT_PROMPTS, type NoteAssistInput } from "../ai-prompts.ts";
import { DEFAULT_MODEL, draftNote } from "../ai-client.ts";

interface Case { id: string; input: NoteAssistInput; must_contain: string[]; must_not_contain: string[] }

const numbers = (s: string) => new Set((s.match(/\b\d+(?:\.\d+)?\b/g) ?? []));

export function grade(c: Case, output: string, prompt: string): string[] {
  const failures: string[] = [];
  const lower = output.toLowerCase();
  for (const needle of c.must_contain) {
    if (!lower.includes(needle.toLowerCase())) failures.push(`missing "${needle}"`);
  }
  for (const needle of c.must_not_contain) {
    if (output.includes(needle) || prompt.includes(needle)) failures.push(`leaked "${needle}"`);
  }
  // Hallucination guard: every number in the draft must appear in the input.
  const allowed = numbers(prompt);
  for (const n of numbers(output)) if (!allowed.has(n)) failures.push(`introduced number ${n}`);
  // Format guard: every label for the (resolved) format must appear.
  const fmt = (c.input.note_format ?? "DAP").toUpperCase();
  const labels = (NOTE_FORMAT_PROMPTS[fmt] ?? NOTE_FORMAT_PROMPTS.DAP).labels;
  for (const label of labels) if (!output.includes(`${label}:`)) failures.push(`missing section "${label}:"`);
  return failures;
}

if (import.meta.main) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("Set ANTHROPIC_API_KEY to run the eval.");
    Deno.exit(2);
  }
  const modelArg = Deno.args.indexOf("--model");
  const model = modelArg >= 0 ? Deno.args[modelArg + 1] : DEFAULT_MODEL;
  const { cases } = JSON.parse(await Deno.readTextFile(new URL("./cases.json", import.meta.url))) as { cases: Case[] };
  const client = new Anthropic({ apiKey });

  let failed = 0;
  for (const c of cases) {
    const { prompt } = buildUserPrompt(c.input);
    const result = await draftNote(client, prompt, model);
    const failures = result.stopReason === "refusal" ? ["model refused"] : grade(c, result.text, prompt);
    if (failures.length) failed++;
    console.log(`${failures.length ? "✗" : "✓"} ${c.id} (${result.model}, ${result.outputTokens ?? "?"} out)`);
    for (const f of failures) console.log(`    - ${f}`);
  }
  console.log(`\n${cases.length - failed}/${cases.length} cases passed`);
  Deno.exit(failed ? 1 : 0);
}
