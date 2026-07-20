/**
 * Poetry Hub AI Assist — Improve, Continue, Beautify, Translate, and style presets.
 * Calls Lovable AI Gateway directly (same pattern used elsewhere in the app).
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PoemAiAction =
  | "improve"
  | "continue"
  | "beautify"
  | "translate"
  | "urdu_style"
  | "hindi_style"
  | "english_style";

const SYSTEM: Record<PoemAiAction, string> = {
  improve: "You are a poetry editor. Rewrite the poem to improve rhythm, imagery and word choice while preserving its meaning, voice, tone and line structure. Return ONLY the poem.",
  continue: "You are a poet. Continue the following poem with 4-8 additional lines that match its tone, rhythm and imagery. Return ONLY the new lines to append (no repetition of the original).",
  beautify: "You are a poetry editor. Polish the following poem: tighten line breaks, refine punctuation, deepen imagery, keep it emotionally honest. Do not change meaning. Return ONLY the polished poem.",
  translate: "You are a literary translator. Translate the following poem into the target language while preserving imagery, rhythm and emotional weight. Return ONLY the translated poem.",
  urdu_style: "You are an Urdu poet. Rewrite the poem in a classical Urdu ghazal style (romanized Urdu is fine if input is romanized). Preserve meaning, deepen romance and metaphor. Return ONLY the poem.",
  hindi_style: "You are a Hindi poet. Rewrite the poem in a classical/modern Hindi kavita style with vivid imagery. Preserve meaning. Return ONLY the poem.",
  english_style: "You are a modern English poet. Rewrite the poem in a contemporary English free-verse style with strong imagery and cadence. Preserve meaning. Return ONLY the poem.",
};

export interface PoemAiInput {
  action: PoemAiAction;
  text: string;
  title?: string;
  targetLang?: string;
}

export const assistPoemAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PoemAiInput) => {
    if (!input?.action) throw new Error("action required");
    if (!input?.text || input.text.trim().length < 3) throw new Error("text too short");
    if (input.text.length > 4000) throw new Error("text too long");
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const system = SYSTEM[data.action];
    const userMsg =
      data.action === "translate"
        ? `Target language: ${data.targetLang || "English"}\n\nPoem${data.title ? ` — "${data.title}"` : ""}:\n\n${data.text}`
        : `Poem${data.title ? ` — "${data.title}"` : ""}:\n\n${data.text}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "app-server-fn",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.8,
      }),
    });

    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up.");
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);

    const body = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const output = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!output) throw new Error("AI returned no content");
    return { text: output };
  });
