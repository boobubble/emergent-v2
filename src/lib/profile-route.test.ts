import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  escapeIlikeExact,
  normalizeProfileUsernameParam,
} from "./profile.public";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), `src/${rel}`), "utf8");
}

describe("profile username param", () => {
  it("accepts real usernames including princess and Arman", () => {
    expect(normalizeProfileUsernameParam("princess")).toBe("princess");
    expect(normalizeProfileUsernameParam("Arman")).toBe("Arman");
    expect(normalizeProfileUsernameParam("  kiran  ")).toBe("kiran");
  });

  it("rejects user ids, wildcards, and empty values", () => {
    expect(normalizeProfileUsernameParam("")).toBeNull();
    expect(normalizeProfileUsernameParam("%princess%")).toBeNull();
    expect(normalizeProfileUsernameParam("41af93bf-d960-44db-820d-1a50d681f6d2")).toBeNull();
    expect(normalizeProfileUsernameParam("user/slash")).toBeNull();
  });

  it("escapes ILIKE wildcards so underscore usernames match literally", () => {
    expect(escapeIlikeExact("pr_ncess")).toBe("pr\\_ncess");
    expect(escapeIlikeExact("100%")).toBe("100\\%");
  });
});

describe("/u/$username SSR boundary", () => {
  const route = read("routes/u.$username.tsx");

  it("does not import the browser supabase proxy", () => {
    expect(route).not.toContain('from "@/integrations/supabase/client"');
    expect(route).not.toContain("loadBrowserSupabase");
  });

  it("does not import client.server in the route loader", () => {
    expect(route).not.toContain('import("@/integrations/supabase/client.server")');
    expect(route).not.toContain("@/integrations/supabase/client.server");
  });

  it("uses SSR admin lookup and client RPC, then throw notFound() on miss", () => {
    expect(route).toContain("getPublicProfileByUsername");
    expect(route).toContain("getPublicProfileByUsernameFn");
    expect(route).toContain('typeof window === "undefined"');
    expect(route).toContain("if (!profile) throw notFound()");
    expect(route).toContain("notFoundComponent: MissingProfileNotFound");
    expect(route).toContain("UserProfileRedirect");
    expect(route).toContain('search={{ u: username } as never}');
  });

  it("resolves username, not handle/slug/user id", () => {
    expect(route).toContain("normalizeProfileUsernameParam");
    expect(route).toContain("params.username");
    expect(route).not.toContain("params.userId");
    expect(route).not.toContain("params.handle");
    expect(route).not.toContain("params.slug");
  });
});

describe("profile public lookup module", () => {
  const src = read("lib/profile.public.ts");

  it("uses service-role client only via dynamic server import", () => {
    expect(src).toContain('import("@/integrations/supabase/client.server")');
    expect(src).not.toContain('from "@/integrations/supabase/client"');
    expect(src).toContain("ilike");
    expect(src).toContain("escapeIlikeExact");
  });
});

describe("getPublicProfileByUsername query", () => {
  it("looks up profiles.username case-insensitively and returns the row", async () => {
    const { getPublicProfileByUsername } = await import("./profile.public");
    let ilikeArg = "";
    const sb = {
      from(table: string) {
        expect(table).toBe("profiles");
        return {
          select(columns: string) {
            expect(columns).toContain("username");
            return {
              ilike(_col: string, value: string) {
                ilikeArg = value;
                return {
                  limit: async () => ({
                    data: [{
                      id: "41af93bf-d960-44db-820d-1a50d681f6d2",
                      username: "Arman",
                      display_name: null,
                      bio: null,
                      avatar_url: null,
                      is_private: false,
                    }],
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
    };
    const row = await getPublicProfileByUsername("arman", sb as never);
    expect(ilikeArg).toBe("arman");
    expect(row?.username).toBe("Arman");
  });

  it("returns null for unknown usernames", async () => {
    const { getPublicProfileByUsername } = await import("./profile.public");
    const sb = {
      from() {
        return {
          select() {
            return {
              ilike() {
                return { limit: async () => ({ data: [], error: null }) };
              },
            };
          },
        };
      },
    };
    expect(await getPublicProfileByUsername("nobodyhere", sb as never)).toBeNull();
  });
});
