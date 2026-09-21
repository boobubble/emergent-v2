import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveBrowserAuthHeaders } from "@/integrations/supabase/auth-attacher";

vi.mock("@/integrations/supabase/load-browser", () => ({
  loadBrowserSupabase: vi.fn(),
}));

import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";

const loadBrowserSupabaseMock = vi.mocked(loadBrowserSupabase);

describe("resolveBrowserAuthHeaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns bearer headers when getSession succeeds with a token", async () => {
    const getSession = vi.fn().mockResolvedValue({
      data: { session: { access_token: "tok-abc" } },
      error: null,
    });
    loadBrowserSupabaseMock.mockResolvedValue({ auth: { getSession } } as never);

    await expect(resolveBrowserAuthHeaders()).resolves.toEqual({
      Authorization: "Bearer tok-abc",
    });
    expect(getSession).toHaveBeenCalledOnce();
  });

  it("returns empty headers when there is no session", async () => {
    loadBrowserSupabaseMock.mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    } as never);

    await expect(resolveBrowserAuthHeaders()).resolves.toEqual({});
  });

  it("returns empty headers when getSession returns an error", async () => {
    loadBrowserSupabaseMock.mockResolvedValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: { message: "refresh failed" },
        }),
      },
    } as never);

    await expect(resolveBrowserAuthHeaders()).resolves.toEqual({});
  });

  it("returns empty headers when Supabase client initialization fails", async () => {
    loadBrowserSupabaseMock.mockRejectedValue(new Error("Missing env"));

    await expect(resolveBrowserAuthHeaders()).resolves.toEqual({});
  });
});
