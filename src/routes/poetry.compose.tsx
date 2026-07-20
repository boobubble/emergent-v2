import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Save, Send, X, Swords, Loader2 } from "lucide-react";
import { listMehfilCategories, publishPoem } from "@/lib/mehfil.functions";
import { assistPoemAI, type PoemAiAction } from "@/lib/mehfil-ai.functions";
import { MehfilShell } from "@/components/mehfil/MehfilShell";
import { useAuth } from "@/lib/auth-store";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { gamify } from "@/lib/gamification-emit";

export const Route = createFileRoute("/poetry/compose")({
  head: () => ({
    meta: [
      { title: "Write a Poem · Poetry Hub" },
      { name: "description", content: "Publish your poetry to Poetry Hub." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComposePage,
});

const THEMES = [
  { key: "paper",   label: "Paper",    css: "linear-gradient(135deg,#fef7e0 0%,#faf0d0 100%)" },
  { key: "night",   label: "Night",    css: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)" },
  { key: "rose",    label: "Rose",     css: "linear-gradient(135deg,#fecdd3 0%,#fda4af 100%)" },
  { key: "ocean",   label: "Ocean",    css: "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)" },
  { key: "sunset",  label: "Sunset",   css: "linear-gradient(135deg,#fed7aa 0%,#fca5a5 100%)" },
  { key: "sage",    label: "Sage",     css: "linear-gradient(135deg,#d9f99d 0%,#a7f3d0 100%)" },
];

function ComposePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const fetchCats = useServerFn(listMehfilCategories);
  const publish = useServerFn(publishPoem);

  const cats = useQuery({ queryKey: ["mehfil", "categories"], queryFn: () => fetchCats() });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("original-poetry");
  const [theme, setTheme] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("en");
  const [optInBattle, setOptInBattle] = useState(false);
  const [aiBusy, setAiBusy] = useState<PoemAiAction | null>(null);

  const aiFn = useServerFn(assistPoemAI);
  const runAI = async (action: PoemAiAction) => {
    if (!body.trim() && action !== "continue") return toast.error("Write something first");
    setAiBusy(action);
    try {
      const res = await aiFn({ data: { action, text: body || title, title, targetLang: language } });
      if (res?.text) {
        setBody(action === "continue" ? `${body}\n\n${res.text}` : res.text);
        toast.success("AI applied");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "AI failed");
    } finally {
      setAiBusy(null);
    }
  };

  const publishMut = useMutation({
    mutationFn: (status: "draft" | "published") =>
      publish({
        data: {
          title,
          body,
          categorySlug,
          language,
          tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
          theme: theme ?? undefined,
          status,
          optInBattle,
        },
      }),
    onSuccess: (poem) => {
      if (poem.status === "published") {
        gamify("poetry_publish", 1, { poem_id: poem.id, category: categorySlug });
        toast.success(optInBattle ? "Published & entered active battle" : "Poem published to Poetry Hub");
        nav({ to: "/poetry/$slug", params: { slug: poem.slug } });
      } else {
        toast.success("Saved as draft");
        nav({ to: "/poetry" });
      }
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to publish"),
  });

  if (!user) {
    return (
      <MehfilShell showBack>
        <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center">
          <h1 className="font-serif text-2xl font-bold">Sign in to write</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Poetry Hub to publish your poetry, earn writer ranks, and enter poetry battles.
          </p>
          <div className="mt-6">
            <AuthScreen />
          </div>
        </div>
      </MehfilShell>
    );
  }

  const themeCss = theme ?? "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.4) 100%)";
  const canPublish = title.trim().length > 0 && body.trim().length >= 10 && !publishMut.isPending;

  return (
    <MehfilShell showBack>
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold">Write a Poem</h1>
            <p className="text-xs text-muted-foreground">Draft, publish and share with the Poetry Hub community.</p>
          </div>
          <Link to="/poetry" className="rounded-md p-2 hover:bg-muted" aria-label="Close"><X className="h-4 w-4" /></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your poem…"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 font-serif text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              maxLength={140}
            />
            <div className="overflow-hidden rounded-2xl border border-border/60" style={{ background: themeCss }}>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={"Let your words breathe…\n\nEvery line matters. Write it your way."}
                rows={16}
                className="min-h-[420px] w-full resize-y bg-transparent p-6 font-serif text-lg leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated): love, urdu, monsoon"
              className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {(cats.data ?? []).map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ur">Urdu</option>
                <option value="pa">Punjabi</option>
                <option value="bn">Bengali</option>
                <option value="es">Spanish</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Background Theme</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme(null)}
                  className={`h-10 rounded-lg border text-[10px] font-semibold ${theme === null ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
                >Default</button>
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.css)}
                    className={`h-10 rounded-lg border text-[10px] font-semibold ${theme === t.css ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
                    style={{ background: t.css }}
                    title={t.label}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Assist</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {([
                  ["improve", "Improve"],
                  ["continue", "Continue"],
                  ["beautify", "Beautify"],
                  ["translate", "Translate"],
                  ["urdu_style", "Urdu Style"],
                  ["hindi_style", "Hindi Style"],
                  ["english_style", "English"],
                ] as [PoemAiAction, string][]).map(([act, label]) => (
                  <button
                    key={act}
                    onClick={() => runAI(act)}
                    disabled={aiBusy !== null}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] font-semibold hover:bg-muted disabled:opacity-50"
                  >
                    {aiBusy === act ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 cursor-pointer hover:border-primary/50">
              <input type="checkbox" checked={optInBattle} onChange={(e) => setOptInBattle(e.target.checked)} className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <Swords className="h-4 w-4 text-primary" /> Enter Poetry Battle
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Auto-enroll this poem in the active battle for its category.
                </div>
              </div>
            </label>


            <div className="space-y-2">
              <button
                onClick={() => publishMut.mutate("published")}
                disabled={!canPublish}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Publish
              </button>
              <button
                onClick={() => publishMut.mutate("draft")}
                disabled={!title.trim() || publishMut.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Draft
              </button>
            </div>
          </aside>
        </div>
      </div>
    </MehfilShell>
  );
}
