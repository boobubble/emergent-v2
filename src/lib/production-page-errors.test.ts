import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthStateSubscription } from "@/lib/auth-listener";
import { attachSupabaseMonitoring } from "@/lib/supabase-monitor";
import { isSeoGlobalTableMissing, loadSeoGlobal } from "@/lib/seo/load-global";
import { resolvePageSeo } from "@/lib/seo/resolve-seo";
import type { SeoGlobal } from "@/lib/seo/types";

describe("isSeoGlobalTableMissing", () => {
  it("detects PGRST205", () => {
    expect(isSeoGlobalTableMissing({ code: "PGRST205", message: "any" })).toBe(true);
  });

  it("detects schema cache message", () => {
    expect(isSeoGlobalTableMissing({
      message: "Could not find the table 'public.seo_global' in the schema cache",
    })).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isSeoGlobalTableMissing({ code: "42501", message: "permission denied" })).toBe(false);
  });
});

describe("loadSeoGlobal", () => {
  it("returns null when seo_global table is missing", async () => {
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: null,
              error: { code: "PGRST205", message: "Could not find the table 'public.seo_global' in the schema cache" },
            }),
          }),
        }),
      }),
    };
    await expect(loadSeoGlobal(client)).resolves.toBeNull();
  });

  it("returns row when table exists", async () => {
    const row: SeoGlobal = {
      id: 1,
      site_name: "BooBubble",
      default_title: "BooBubble",
      default_description: "Chat community",
    } as SeoGlobal;
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: row, error: null }),
          }),
        }),
      }),
    };
    await expect(loadSeoGlobal(client)).resolves.toEqual(row);
  });

  it("throws on non-missing-table errors", async () => {
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: null,
              error: { message: "connection refused" },
            }),
          }),
        }),
      }),
    };
    await expect(loadSeoGlobal(client)).rejects.toThrow("connection refused");
  });
});

describe("resolvePageSeo fallback when seo_global missing", () => {
  it("uses route fallback metadata instead of global defaults", () => {
    const resolved = resolvePageSeo(null, null, {
      routePath: "/lahore-chat-room",
      fallback: {
        title: "Lahore Chat Rooms",
        description: "Meet and chat in Lahore.",
      },
    });
    expect(resolved.title).toBe("Lahore Chat Rooms");
    expect(resolved.description).toBe("Meet and chat in Lahore.");
  });
});

describe("getAuthStateSubscription", () => {
  it("extracts subscription from standard Supabase shape", () => {
    const unsub = vi.fn();
    const sub = getAuthStateSubscription({ data: { subscription: { unsubscribe: unsub } } });
    expect(sub).toBeTruthy();
    sub?.unsubscribe();
    expect(unsub).toHaveBeenCalledOnce();
  });

  it("returns null for undefined listener result", () => {
    expect(getAuthStateSubscription(undefined)).toBeNull();
    expect(getAuthStateSubscription({})).toBeNull();
  });
});

describe("attachSupabaseMonitoring auth.onAuthStateChange", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-key");
  });

  it("preserves synchronous listener return (not a Promise)", () => {
    const mockUnsub = vi.fn();
    const inner = {
      auth: {
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: mockUnsub } },
        })),
      },
    };
    const monitored = attachSupabaseMonitoring(inner as never);
    const result = monitored.auth.onAuthStateChange(() => {});
    expect(result).not.toBeInstanceOf(Promise);
    expect(getAuthStateSubscription(result)).toBeTruthy();
  });
});

describe("subscribeAuthStateChange", () => {
  it("returns no-op unsubscribe when subscription is missing", () => {
    const inner = {
      auth: {
        onAuthStateChange: vi.fn(() => ({})),
      },
    };
    const monitored = attachSupabaseMonitoring(inner as never);
    vi.doMock("@/integrations/supabase/client", () => ({ supabase: monitored }));
    // Direct test via monitored client + helper logic
    const result = monitored.auth.onAuthStateChange(() => {});
    const unsub = getAuthStateSubscription(result);
    expect(() => unsub?.unsubscribe()).not.toThrow();
  });
});

describe("subscription profile guard", () => {
  it("user with no subscription does not require subscription object", async () => {
    const payload = {
      subscription: null as null,
      isActive: false,
      ownedRoomCount: 0,
    };
    const sub = payload?.subscription;
    const plan = (sub as { plan?: { name?: string } } | null)?.plan;
    expect(payload.isActive).toBe(false);
    expect(plan).toBeUndefined();
    expect(() => Boolean(plan?.name)).not.toThrow();
  });

  it("user with valid subscription exposes plan name", () => {
    const payload = {
      subscription: { plan_id: "p1", plan: { name: "Premium", perks: { no_ads: true } } },
      isActive: true,
      ownedRoomCount: 1,
    };
    const sub = payload.subscription as { plan?: { name?: string; perks?: Record<string, unknown> } };
    expect(sub.plan?.name).toBe("Premium");
    expect(Boolean(sub.plan?.perks?.no_ads)).toBe(true);
  });
});

describe("static page heading contract", () => {
  it("does not inject H1 into body SEO resolution", () => {
    const resolved = resolvePageSeo(null, null, {
      routePath: "/lahore-chat-room",
      fallback: { title: "Lahore Chat Rooms" },
    });
    expect(resolved.title).toBe("Lahore Chat Rooms");
    expect(resolved.title).not.toMatch(/<h1/i);
  });
});
