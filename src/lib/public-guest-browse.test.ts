import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthGateProvider, useAuthGate } from "./auth-gate";

const testDir = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(testDir, "..");

/** Recursively collect .ts / .tsx sources under src/ (skip tests). */
function collectSrcFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".output") continue;
      collectSrcFiles(full, out);
      continue;
    }
    const ext = extname(name);
    if (ext !== ".ts" && ext !== ".tsx") continue;
    if (name.endsWith(".test.ts") || name.endsWith(".test.tsx") || name.endsWith(".spec.ts")) continue;
    out.push(full);
  }
  return out;
}

function readSrc(relFromSrc: string) {
  return readFileSync(resolve(srcRoot, relFromSrc), "utf8");
}

vi.mock("@/lib/auth-store", () => {
  let user: null | { id: string; username: string; email: string; isGuest: boolean } = null;
  return {
    useAuth: () => ({ user, ready: true, loggingOut: false }),
    __setMockUser: (next: typeof user) => {
      user = next;
    },
  };
});

vi.mock("@/components/auth/AuthScreen", () => ({
  AuthDialogs: ({ popup }: { popup: string | null }) =>
    createElement("div", {
      "data-testid": "auth-dialogs",
      "data-popup": popup ?? "",
    }),
}));

vi.mock("@/lib/guest-chat-context", () => ({
  GuestChatProvider: ({ children }: { children: ReactNode }) => children,
  useGuestChat: () => ({
    enabled: false,
    configReady: true,
    session: null,
    isGuestChatting: false,
    nicknameDialogOpen: false,
    openNicknameDialog: () => {},
    closeNicknameDialog: () => {},
    startWithNickname: async () => {},
    endGuestChat: () => {},
    starting: false,
    error: null,
  }),
}));

vi.mock("@/components/chat/GuestNicknameDialog", () => ({
  GuestNicknameDialog: () => null,
}));

import * as authStoreMock from "@/lib/auth-store";

const setMockUser = (authStoreMock as unknown as {
  __setMockUser: (u: null | { id: string; username: string; email: string; isGuest: boolean }) => void;
}).__setMockUser;

describe("legacy guest creation — must stay removed", () => {
  const files = collectSrcFiles(srcRoot);
  const joined = files.map((f) => readFileSync(f, "utf8")).join("\n");

  it("contains no signInAnonymously / loginAsGuest / GuestAutoSignIn", () => {
    expect(joined).not.toMatch(/\bsignInAnonymously\b/);
    expect(joined).not.toMatch(/\bloginAsGuest\b/);
    expect(joined).not.toMatch(/\bGuestAutoSignIn\b/);
    expect(joined).not.toMatch(/\bcreateGuest\b/);
    expect(joined).not.toMatch(/\bensureGuest\b/);
  });

  it("does not generate guest-* auth/presence IDs in competitions audience counter", () => {
    const src = readSrc("components/competitions/AudienceCounter.tsx");
    expect(src).not.toMatch(/`guest-\$/);
    expect(src).toMatch(/`visitor-\$/);
  });

  it("PublicOutlet wires ChatProvider with authUserId=null (no auth user on browse)", () => {
    const root = readSrc("routes/__root.tsx");
    expect(root).toMatch(/username="__public__"/);
    expect(root).toMatch(/authUserId=\{null\}/);
    expect(root).not.toMatch(/GuestAutoSignIn/);
    expect(root).not.toMatch(/loginAsGuest/);
  });

  it("auth-store never marks restored sessions as guests", () => {
    const auth = readSrc("lib/auth-store.tsx");
    expect(auth).toMatch(/isGuest:\s*false/);
    expect(auth).not.toMatch(/isGuest:\s*true/);
    expect(auth).not.toMatch(/signInAnonymously/);
  });

  it("guest-flags stubs keep autoLogin disabled", () => {
    const flags = readSrc("lib/guest-flags.ts");
    expect(flags).toMatch(/autoLogin:\s*false/);
    expect(flags).toMatch(/isGuest:\s*false/);
    expect(flags).toMatch(/enabled:\s*false/);
  });
});

describe("chat-store public browse hardening", () => {
  it("refuses all guest sends without creating local messages", () => {
    const src = readSrc("lib/chat-store.tsx");
    // Early return for isGuest — no partial guest message allowance.
    expect(src).toMatch(/if \(isGuest\) \{\s*[\s\S]*?return;/);
    expect(src).not.toMatch(/Guests can't command bots/);
    expect(src).not.toMatch(/Guests can't post links/);
  });

  it("refuses startDM when guest or missing authUserId", () => {
    const src = readSrc("lib/chat-store.tsx");
    expect(src).toMatch(/if \(isGuest \|\| !authUserId\)/);
    expect(src).not.toMatch(/Guest users not allowed DM/);
  });
});

describe("write actions open AuthGate (not guest account)", () => {
  const cases: Array<{ file: string; mustInclude: RegExp }> = [
    { file: "components/chat/MessageInput.tsx", mustInclude: /useAuthGate|requireAuth/ },
    { file: "components/feed/PollBlock.tsx", mustInclude: /requireAuth/ },
    { file: "components/feed/DiscoveryWidgets.tsx", mustInclude: /requireAuth/ },
    { file: "components/feed/PostCard.tsx", mustInclude: /requireAuth/ },
    { file: "components/feed/ProfilePanel.tsx", mustInclude: /requireAuth/ },
    { file: "components/chat/ProfilePopup.tsx", mustInclude: /requireAuth/ },
    { file: "routes/confessions.tsx", mustInclude: /requireAuth/ },
    { file: "routes/feed.index.tsx", mustInclude: /openSignIn/ },
  ];

  for (const { file, mustInclude } of cases) {
    it(`${file} gates writes via AuthGate`, () => {
      const src = readSrc(file);
      expect(src).toMatch(mustInclude);
      expect(src).not.toMatch(/signInAnonymously|loginAsGuest/);
    });
  }

  it("MessageInput no longer mounts a local AuthDialogs bypass", () => {
    const src = readSrc("components/chat/MessageInput.tsx");
    expect(src).not.toMatch(/AuthDialogs/);
    expect(src).toMatch(/sendAsAuthed|requireAuth/);
  });
});

function GateProbe({ onApi }: { onApi: (api: ReturnType<typeof useAuthGate>) => void }) {
  const api = useAuthGate();
  onApi(api);
  return createElement("span", { "data-testid": "probe" }, api.isAuthenticated ? "in" : "out");
}

describe("AuthGate.requireAuth — logged-out write gate", () => {
  beforeEach(() => {
    setMockUser(null);
  });

  it("does not run the write action when logged out (auth gate)", () => {
    let api: ReturnType<typeof useAuthGate> | null = null;
    const action = vi.fn();
    renderToStaticMarkup(
      createElement(
        AuthGateProvider,
        null,
        createElement(GateProbe, {
          onApi: (a) => {
            api = a;
          },
        }),
      ),
    );
    expect(api).not.toBeNull();
    expect(api!.isAuthenticated).toBe(false);
    const ran = api!.requireAuth(action);
    expect(ran).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it("runs the action immediately when authenticated (no guest user created)", () => {
    setMockUser({ id: "user-1", username: "alice", email: "a@b.c", isGuest: false });
    let api: ReturnType<typeof useAuthGate> | null = null;
    const action = vi.fn();
    renderToStaticMarkup(
      createElement(
        AuthGateProvider,
        null,
        createElement(GateProbe, {
          onApi: (a) => {
            api = a;
          },
        }) as ReactNode,
      ),
    );
    const ran = api!.requireAuth(action);
    expect(ran).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
    expect(api!.isAuthenticated).toBe(true);
  });
});

describe("refresh / route-switch invariants (static)", () => {
  it("opening public paths never calls anonymous sign-in in root AuthGate", () => {
    const root = readSrc("routes/__root.tsx");
    // Public path branch renders PublicOutlet only.
    expect(root).toMatch(/if \(!user && isPublicPath\(path\)\) \{\s*return <PublicOutlet/);
    expect(root).not.toMatch(/signInAnonymously|loginAsGuest|ensureProfile|createProfile/);
  });

  it("no automatic profiles insert bootstrap in public browse client code", () => {
    const guarded = [
      "lib/auth-store.tsx",
      "lib/auth-gate.tsx",
      "lib/guest-flags.ts",
      "lib/guest-config.ts",
      "lib/chat-store.tsx",
      "routes/__root.tsx",
      "components/chat/MessageInput.tsx",
      "routes/feed.index.tsx",
    ];
    for (const rel of guarded) {
      const src = readSrc(rel);
      expect(src).not.toMatch(/\.from\(['"]profiles['"]\)\s*\.(insert|upsert)/);
      expect(src).not.toMatch(/signInAnonymously|loginAsGuest|GuestAutoSignIn/);
    }
  });
});
