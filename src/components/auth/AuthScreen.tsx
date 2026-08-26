import { useEffect, useState } from "react";
import { useBrand } from "@/lib/branding";
import { supabase } from "@/integrations/supabase/client";
import { SIGNUP_ACCESS_DEFAULTS, type SignupAccessConfig } from "@/lib/signup-config";
import { FeedbackShowcase } from "@/components/feedback/FeedbackShowcase";
import { LiveCommunityBackground } from "@/components/auth/LiveCommunityBackground";
import { AuthDialogs, type AuthPopup } from "@/components/auth/AuthDialogs";

export type { AuthPopup };
export { AuthDialogs };

export function AuthScreen() {
  const brand = useBrand();
  const [popup, setPopup] = useState<AuthPopup>(null);
  const [signupCfg, setSignupCfg] = useState<SignupAccessConfig>(SIGNUP_ACCESS_DEFAULTS);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "signup_access")
          .maybeSingle();
        if (cancel) return;
        const signup = (data?.value as Partial<SignupAccessConfig> | null) ?? {};
        setSignupCfg({ ...SIGNUP_ACCESS_DEFAULTS, ...signup });
      } catch { /* keep defaults */ }
    })();
    return () => { cancel = true; };
  }, []);

  const signupAvailable = signupCfg.signupEnabled;

  return (
    <LiveCommunityBackground>
      <div className="w-full max-w-sm space-y-6">
        <div
          className="rounded-3xl border border-white/10 bg-card/80 p-8 text-center shadow-2xl supports-[backdrop-filter]:bg-card/60 supports-[backdrop-filter]:backdrop-blur-[var(--auth-card-blur,24px)]"
          style={{ boxShadow: "var(--shadow-panel)" }}
        >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-3xl font-bold text-primary-foreground" style={{ background: "var(--primary)", boxShadow: "var(--shadow-glow)" }}>P</div>
        <h1 className="mt-4 text-2xl font-bold">Welcome to {brand.name}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Chat, post, and play with friends.</p>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => setPopup("signin")}
            className="w-full rounded-full px-4 py-3 text-sm font-bold text-primary-foreground"
            style={{ background: "var(--gradient-accent, var(--primary))" }}
          >
            Sign in
          </button>
          {signupAvailable ? (
            <button
              onClick={() => setPopup("signup")}
              className="w-full rounded-full border border-primary/50 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/20"
            >
              Create account
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
              {signupCfg.disabledMessage}
            </div>
          )}
          </div>

        </div>
        <FeedbackShowcase surface="signup" />
      </div>

      <AuthDialogs popup={popup} setPopup={setPopup} signupEnabled={signupAvailable} />
    </LiveCommunityBackground>
  );
}
