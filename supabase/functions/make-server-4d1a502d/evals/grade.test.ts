import { assertEquals } from "jsr:@std/assert@1";
import { grade } from "./run.ts";
import { buildUserPrompt } from "../ai-prompts.ts";

Deno.test("grader passes a faithful DAP draft", () => {
  const c = { id: "t", input: { note_format: "DAP", section_1: "PHQ-9 score 14 today." }, must_contain: ["14"], must_not_contain: [] };
  const { prompt } = buildUserPrompt(c.input);
  assertEquals(grade(c, "Data:\nPHQ-9 score of 14.\n\nAssessment:\nNot documented.\n\nPlan:\nNot documented.", prompt), []);
});

Deno.test("grader flags invented numbers, leaks and missing sections", () => {
  const c = { id: "t", input: { note_format: "DAP", section_1: "Call 416-555-0199" }, must_contain: [], must_not_contain: ["416-555-0199"] };
  const { prompt } = buildUserPrompt(c.input);
  const failures = grade(c, "Data:\nClient called 416-555-0199 after 3 days.", prompt);
  assertEquals(failures.includes('leaked "416-555-0199"'), true);
  assertEquals(failures.some((f) => f.startsWith("introduced number 3")), true);
  assertEquals(failures.includes('missing section "Plan:"'), true);
});
