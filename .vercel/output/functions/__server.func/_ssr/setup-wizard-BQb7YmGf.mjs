import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, N as Navigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useServerFn, $ as getOwnerStatus, az as saveCommunitySetup, aB as createOwner, aA as uploadCommunityAsset, aC as runInstallationHealthCheck, ae as Card, ag as CardHeader, ah as CardTitle, ai as CardDescription, af as CardContent, B as Button, ac as Label, a0 as Input, ad as Textarea, ay as PasswordStrength } from "./router-CYWPFaDK.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { R as RadioGroup, a as RadioGroupItem } from "./radio-group-BYXGCyZJ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { A as APP_VERSION } from "./app-version-8YDb-xNu.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a0 as LoaderCircle, bz as CircleCheck, bA as PartyPopper, ab as ArrowRight, y as Settings2, s as UserPlus, au as ShieldCheck, b2 as Rocket, I as Image, bH as Upload, d as Trash2, T as TriangleAlert, bB as CircleX } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
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
import "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/radix-ui__react-radio-group.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
function SetupWizardPage() {
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getOwnerStatus);
  const runSaveCommunity = useServerFn(saveCommunitySetup);
  const runCreateOwner = useServerFn(createOwner);
  const runUpload = useServerFn(uploadCommunityAsset);
  const runHealth = useServerFn(runInstallationHealthCheck);
  const {
    data: status,
    isLoading
  } = useQuery({
    queryKey: ["owner-setup-status"],
    queryFn: () => fetchStatus({}),
    staleTime: 0,
    refetchOnWindowFocus: false
  });
  const [step, setStep] = reactExports.useState(1);
  const [busy, setBusy] = reactExports.useState(false);
  const [cName, setCName] = reactExports.useState("");
  const [cTagline, setCTagline] = reactExports.useState("");
  const [cDescription, setCDescription] = reactExports.useState("");
  const [cLanguage, setCLanguage] = reactExports.useState("en");
  const [cTimezone, setCTimezone] = reactExports.useState(typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC");
  const [cCurrency, setCCurrency] = reactExports.useState("USD");
  const [cLogo, setCLogo] = reactExports.useState("");
  const [cFavicon, setCFavicon] = reactExports.useState("");
  const [cHero, setCHero] = reactExports.useState("");
  const [homepage, setHomepage] = reactExports.useState("welcome");
  const [fullName, setFullName] = reactExports.useState("");
  const [username, setUsername] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [health, setHealth] = reactExports.useState(null);
  const [healthOk, setHealthOk] = reactExports.useState(null);
  const [healthRunning, setHealthRunning] = reactExports.useState(false);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-h-screen place-items-center bg-background text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 inline h-4 w-4 animate-spin" }),
      " Checking installation…"
    ] });
  }
  if (!status) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: "Unable to verify status." });
  if (!status.installed) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/installer", replace: true });
  if (step === 1 && (status.hasOwner || status.firstRunCompleted)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  }
  async function fileToBase64(file) {
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  async function uploadAsset(kind, file) {
    const base64 = await fileToBase64(file);
    const res = await runUpload({
      data: {
        kind,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        base64
      }
    });
    return res.url;
  }
  async function handleSaveCommunity(e) {
    e.preventDefault();
    if (!cName.trim()) {
      toast.error("Community name is required.");
      return;
    }
    setBusy(true);
    try {
      await runSaveCommunity({
        data: {
          name: cName,
          tagline: cTagline,
          description: cDescription,
          language: cLanguage,
          timezone: cTimezone,
          currency: cCurrency,
          logoUrl: cLogo,
          faviconUrl: cFavicon,
          homepage
        }
      });
      toast.success("Community settings saved.");
      setStep(3);
    } catch (err) {
      toast.error(err?.message || "Failed to save community settings.");
    } finally {
      setBusy(false);
    }
  }
  async function runHealthChecks() {
    setHealthRunning(true);
    setHealth(null);
    setHealthOk(null);
    try {
      const res = await runHealth({});
      setHealth(res.checks);
      setHealthOk(res.ok);
    } catch (err) {
      toast.error(err?.message || "Health check failed.");
      setHealthOk(false);
    } finally {
      setHealthRunning(false);
    }
  }
  async function handleCreate(e) {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match.");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) return toast.error("Username must be 3–32 characters (letters, numbers, underscore).");
    setBusy(true);
    try {
      await runCreateOwner({
        data: {
          fullName,
          username,
          email,
          password
        }
      });
      const {
        error: signInErr
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInErr) {
        toast.error(`Owner account created, but auto sign-in failed: ${signInErr.message}`);
      }
      setStep(4);
      void runHealthChecks();
    } catch (err) {
      toast.error(err?.message || "Failed to create Super Admin.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepIndicator, { step }),
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mx-auto h-12 w-12 text-emerald-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "mt-2 text-2xl", children: "Installation Completed Successfully" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "Your community has been installed successfully.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "Let's finish the final setup."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-10 w-10 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", onClick: () => setStep(2), children: [
          "Continue Setup ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
        ] })
      ] })
    ] }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-5 w-5" }),
          " Community Setup"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure the basics and upload your community assets." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveCommunity, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cName", children: "Community Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cName", value: cName, onChange: (e) => setCName(e.target.value), required: true, maxLength: 120 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cTagline", children: "Tagline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cTagline", value: cTagline, onChange: (e) => setCTagline(e.target.value), maxLength: 200 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cDescription", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "cDescription", value: cDescription, onChange: (e) => setCDescription(e.target.value), maxLength: 2e3, rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cLanguage", children: "Default Language" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cLanguage", value: cLanguage, onChange: (e) => setCLanguage(e.target.value), placeholder: "en" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cTimezone", children: "Timezone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cTimezone", value: cTimezone, onChange: (e) => setCTimezone(e.target.value), placeholder: "UTC" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cCurrency", children: "Currency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cCurrency", value: cCurrency, onChange: (e) => setCCurrency(e.target.value), placeholder: "USD" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-md border border-dashed p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Community Assets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AssetUploader, { kind: "logo", label: "Community Logo", hint: "PNG, JPG, WEBP or SVG · max 2MB", accept: "image/png,image/jpeg,image/webp,image/svg+xml", value: cLogo, onChange: setCLogo, upload: (f) => uploadAsset("logo", f) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AssetUploader, { kind: "favicon", label: "Favicon", hint: "PNG, JPG, WEBP, SVG or ICO · max 512KB", accept: "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon", value: cFavicon, onChange: setCFavicon, upload: (f) => uploadAsset("favicon", f) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AssetUploader, { kind: "hero", label: "Hero Banner (optional)", hint: "PNG, JPG or WEBP · max 5MB", accept: "image/png,image/jpeg,image/webp", value: cHero, onChange: setCHero, upload: (f) => uploadAsset("hero", f) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Leave any field empty to use the platform defaults." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Homepage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { value: homepage, onValueChange: (v) => setHomepage(v), className: "mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "welcome", id: "hp-welcome", className: "mt-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Welcome Page" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Show the welcome landing as the default homepage." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "hero", id: "hp-hero", className: "mt-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Hero Homepage" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Show the marketing hero as the default homepage." })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setStep(1), disabled: busy, children: "Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy, children: [
            busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Save & Continue"
          ] })
        ] })
      ] }) })
    ] }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-5 w-5" }),
          " Create Super Administrator"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "This account will be the permanent platform owner with full permissions." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "fullName", value: fullName, onChange: (e) => setFullName(e.target.value), required: true, maxLength: 120 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "username", value: username, onChange: (e) => setUsername(e.target.value), required: true, autoComplete: "username" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "3–32 characters. Letters, numbers, underscore." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoComplete: "email" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, autoComplete: "new-password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordStrength, { value: password })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm", children: "Confirm Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "confirm", type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), required: true, autoComplete: "new-password" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setStep(2), disabled: busy, children: "Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy, children: [
            busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Create Owner & Run Health Check"
          ] })
        ] })
      ] }) })
    ] }),
    step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5" }),
          " Installation Health Check"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Verifying that all core services are online and configured properly." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HealthList, { checks: health, running: healthRunning }),
        health && health.some((c) => c.critical && c.state === "fail") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: health.filter((c) => c.critical && c.state === "fail").map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-destructive", children: c.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-muted-foreground", children: "This service requires attention before your community goes live." }),
          c.problem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Problem:" }),
            " ",
            c.problem
          ] }),
          c.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Possible reason:" }),
            " ",
            c.reason
          ] }),
          c.action && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Recommended action:" }),
            " ",
            c.action
          ] })
        ] }, c.key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: runHealthChecks, disabled: healthRunning, children: [
            healthRunning && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Re-run checks"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: healthRunning || healthOk !== true, onClick: () => setStep(5), children: [
            "Continue ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] })
        ] })
      ] })
    ] }),
    step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "mt-2 text-2xl", children: "🎉 Community Ready" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Welcome! Your Super Admin account has been created successfully." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 rounded-md border bg-muted/30 p-4 text-sm sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Community", value: cName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Homepage", value: homepage === "hero" ? "Hero Homepage" : "Welcome Page" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Owner", value: fullName ? `${fullName} (@${username})` : `@${username}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Installed Version", value: `v${APP_VERSION}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { label: "Status", value: "Ready for Production", tone: "ok" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Visit Community" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate({
            to: "/admin"
          }), children: [
            "Enter Admin Dashboard ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function StepIndicator({
  step
}) {
  const items = [{
    n: 1,
    label: "Install Complete"
  }, {
    n: 2,
    label: "Community"
  }, {
    n: 3,
    label: "Super Admin"
  }, {
    n: 4,
    label: "Health Check"
  }, {
    n: 5,
    label: "Ready"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mb-6 flex flex-wrap items-center justify-center gap-2 text-xs", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-6 w-6 place-items-center rounded-full border ${step >= it.n ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"}`, children: it.n }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: step === it.n ? "font-medium" : "text-muted-foreground", children: it.label }),
    i < items.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 h-px w-6 bg-muted-foreground/30" })
  ] }, it.n)) });
}
function AssetUploader({
  kind,
  label,
  hint,
  accept,
  value,
  onChange,
  upload
}) {
  const inputRef = reactExports.useRef(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(0);
  const [dragOver, setDragOver] = reactExports.useState(false);
  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    setProgress(10);
    const tick = setInterval(() => setProgress((p) => Math.min(90, p + 10)), 150);
    try {
      const url = await upload(file);
      onChange(url);
      setProgress(100);
      toast.success(`${label} uploaded.`);
    } catch (e) {
      toast.error(e?.message ?? `Failed to upload ${label.toLowerCase()}`);
    } finally {
      clearInterval(tick);
      setBusy(false);
      setTimeout(() => setProgress(0), 400);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onDragOver: (e) => {
    e.preventDefault();
    setDragOver(true);
  }, onDragLeave: () => setDragOver(false), onDrop: (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  }, className: `flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center ${dragOver ? "border-primary bg-primary/5" : "border-border"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/40", children: value ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: value, alt: "", className: "h-full w-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: value ? "Uploaded · drag a new file or click Replace" : `Drag & drop or click to upload · ${hint}` }),
      busy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1 w-full overflow-hidden rounded bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: {
        width: `${progress}%`
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: inputRef, type: "file", accept, className: "hidden", onChange: (e) => {
      const f = e.target.files?.[0];
      void handleFile(f);
      e.target.value = "";
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: busy, onClick: () => inputRef.current?.click(), className: "gap-1.5", children: [
        busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
        value ? "Replace" : "Upload"
      ] }),
      value && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", disabled: busy, onClick: () => onChange(""), title: `Remove ${label}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: kind })
  ] });
}
function HealthList({
  checks,
  running
}) {
  if (!checks) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 inline h-4 w-4 animate-spin" }),
      running ? "Running system checks…" : "Preparing checks…"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y rounded-md border", children: checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 px-3 py-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StateIcon, { state: c.state }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: c.detail })
  ] }, c.key)) });
}
function StateIcon({
  state
}) {
  if (state === "ok") return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" });
  if (state === "warn") return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-500" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-destructive" });
}
function SummaryRow({
  label,
  value,
  tone
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 border-b py-1 last:border-b-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-medium ${tone === "ok" ? "text-emerald-500" : ""}`, children: value })
  ] });
}
export {
  SetupWizardPage as component
};
