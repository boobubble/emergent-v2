import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
const SYSTEM = {
  improve: "You are a poetry editor. Rewrite the poem to improve rhythm, imagery and word choice while preserving its meaning, voice, tone and line structure. Return ONLY the poem.",
  continue: "You are a poet. Continue the following poem with 4-8 additional lines that match its tone, rhythm and imagery. Return ONLY the new lines to append (no repetition of the original).",
  beautify: "You are a poetry editor. Polish the following poem: tighten line breaks, refine punctuation, deepen imagery, keep it emotionally honest. Do not change meaning. Return ONLY the polished poem.",
  translate: "You are a literary translator. Translate the following poem into the target language while preserving imagery, rhythm and emotional weight. Return ONLY the translated poem.",
  urdu_style: "You are an Urdu poet. Rewrite the poem in a classical Urdu ghazal style (romanized Urdu is fine if input is romanized). Preserve meaning, deepen romance and metaphor. Return ONLY the poem.",
  hindi_style: "You are a Hindi poet. Rewrite the poem in a classical/modern Hindi kavita style with vivid imagery. Preserve meaning. Return ONLY the poem.",
  english_style: "You are a modern English poet. Rewrite the poem in a contemporary English free-verse style with strong imagery and cadence. Preserve meaning. Return ONLY the poem."
};
const assistPoemAI_createServerFn_handler = createServerRpc({
  id: "5cc41eddc3a1c5f04125f22b2801d8ae1339f4504dfab9ef76954346698f4ece",
  name: "assistPoemAI",
  filename: "src/lib/mehfil-ai.functions.ts"
}, (opts) => assistPoemAI.__executeServer(opts));
const assistPoemAI = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => {
  if (!input?.action) throw new Error("action required");
  if (!input?.text || input.text.trim().length < 3) throw new Error("text too short");
  if (input.text.length > 4e3) throw new Error("text too long");
  return input;
}).handler(assistPoemAI_createServerFn_handler, async ({
  data
}) => {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured");
  const system = SYSTEM[data.action];
  const userMsg = data.action === "translate" ? `Target language: ${data.targetLang || "English"}

Poem${data.title ? ` — "${data.title}"` : ""}:

${data.text}` : `Poem${data.title ? ` — "${data.title}"` : ""}:

${data.text}`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "app-server-fn"
    },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [{
        role: "system",
        content: system
      }, {
        role: "user",
        content: userMsg
      }],
      temperature: 0.8
    })
  });
  if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please top up.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const body = await res.json();
  const output = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!output) throw new Error("AI returned no content");
  return {
    text: output
  };
});
export {
  assistPoemAI_createServerFn_handler
};
