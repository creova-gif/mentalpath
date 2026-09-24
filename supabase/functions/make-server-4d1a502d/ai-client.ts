// The single place that calls Claude for note drafting — shared by the API route
// and the offline eval harness (evals/run.ts) so both exercise the same request.
import Anthropic from "npm:@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./ai-prompts.ts";

export const DEFAULT_MODEL = "claude-opus-5";

export interface DraftResult {
  text: string;
  model: string;
  stopReason: string | null;
  inputTokens?: number;
  outputTokens?: number;
}

export async function draftNote(client: Anthropic, prompt: string, model = DEFAULT_MODEL): Promise<DraftResult> {
  // Server-side fallbacks re-run a classifier-declined request on the model
  // Anthropic recommends for that refusal category, in the same call.
  // `fallbacks: "default"` is newer than the SDK's published types, hence the cast.
  const response = await client.beta.messages.create({
    model,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  } as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming);

  const text = response.stop_reason === "refusal"
    ? ""
    : response.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
  return {
    text,
    model: response.model,
    stopReason: response.stop_reason,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens,
  };
}
