import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
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
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = reactExports.useState(false);
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [err, setErr] = reactExports.useState("");
  const [info, setInfo] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    if (password.length < 4) {
      setErr("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setInfo("Password updated! Redirecting…");
    await supabase.auth.signOut();
    setTimeout(() => navigate({
      to: "/"
    }), 1200);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background p-4 text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-1 text-xl font-bold", children: "Set a new password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-5 text-xs text-muted-foreground", children: ready ? "Choose a new password for your account." : "Open this page from the reset email link to continue." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "New password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), maxLength: 100, required: true, disabled: !ready || busy, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50", placeholder: "••••••" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Confirm password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), maxLength: 100, required: true, disabled: !ready || busy, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50", placeholder: "••••••" })
      ] }),
      err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive", children: err }),
      info && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/15 px-3 py-2 text-xs text-primary", children: info }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !ready || busy, type: "submit", className: "w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50", style: {
        background: "var(--gradient-accent, var(--primary))"
      }, children: busy ? "..." : "Update password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate({
        to: "/"
      }), className: "w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground", children: "Back to sign in" })
    ] })
  ] }) });
}
export {
  ResetPasswordPage as component
};
