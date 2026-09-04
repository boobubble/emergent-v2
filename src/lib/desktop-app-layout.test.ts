import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { shouldLoadAppSurfaceStyles } from "@/lib/app-surface-css";
import {
  chatroomSidebarClassName,
  chatroomSidebarStyle,
  chatroomSidebarToggleVisible,
  chatroomSidebarBackdropVisible,
  readChatroomShellLayout,
  chatShellVisualViewportHeightPx,
  bindChatShellToVisualViewport,
} from "@/components/chat/chatroom-shell";

const src = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

describe("desktop app layout CSS split", () => {
  const feed = read("routes/feed.index.tsx");
  const chat = read("components/chat/ChatApp.tsx");
  const chatShell = read("components/chat/chatroom-shell.ts");
  const surfaces = read("styles/app-surfaces.css");
  const guest = read("styles.css");
  const root = read("routes/__root.tsx");

  it("does not load app-surfaces.css on guest homepage", () => {
    expect(shouldLoadAppSurfaceStyles("/")).toBe(false);
    expect(shouldLoadAppSurfaceStyles("/feed")).toBe(true);
    expect(shouldLoadAppSurfaceStyles("/chatroom")).toBe(true);
    expect(root).toContain("isGuestHome ? null : <link rel=\"stylesheet\" href={appSurfacesCss}");
    expect(guest).not.toContain("gaming_arena");
    expect(guest).toContain('@source not "./components/feed"');
    expect(guest).toContain('@source not "./components/chat"');
  });

  it("desktop feed layout utilities live with later app-surface base utilities", () => {
    expect(feed).toContain("lg:grid-cols-[260px_minmax(0,1fr)_320px]");
    expect(feed).toContain('aside className="hidden lg:block"');
    expect(feed).toContain('nav className="fixed bottom-0 left-0 right-0 z-30 flex items-end feed-glass border-t border-border lg:hidden');
    expect(surfaces).toContain('@source ".."');
    expect(surfaces).toContain("feed-card");
  });

  it("desktop chatroom shell uses md: static sidebar classes sourced by app-surfaces", () => {
    expect(chat).toContain("readChatroomShellLayout");
    expect(chat).toContain("data-chatroom-sidebar");
    expect(chatShell).toContain("md:static");
    expect(chat).toContain("md:hidden");
    expect(surfaces).toContain('@source ".."');
    expect(read("components/app/app-shells.tsx")).toContain('import "@/styles/app-surfaces.css"');
  });

  it("chatroom left menu is a closed mobile drawer and an always-open desktop column", () => {
    expect(chat).toContain("const [sidebarOpen, setSidebarOpen] = useState(false)");
    expect(chat).toContain("useState(readChatroomShellLayout)");
    expect(chat).not.toContain("readSidebarOpenPreference");
    expect(chatShell).toContain("md:translate-x-0");
    expect(chatShell).toContain("-translate-x-full");
    expect(chatShell).not.toContain("md:w-0");
    expect(chatShell).not.toContain("md:opacity-0");
    expect(chat).not.toContain("readSidebarOpenPreference");
    expect(chat).toContain("md:hidden");
    const sidebar = read("components/chat/Sidebar.tsx");
    expect(sidebar).toContain("md:hidden");
    expect(sidebar).toContain("onCollapse?.()");
  });

  it("post-login client mount uses matchMedia, not a later CSS/hydration pass", () => {
    expect(chatShell).toContain("if (!mq) return SSR_LAYOUT");

    const mqFor = (width: number) => (query: string) => {
      const min = Number(/min-width:\s*(\d+)/.exec(query)?.[1] ?? 0);
      return { matches: width >= min };
    };

    const desktop = readChatroomShellLayout(mqFor(1280));
    expect(desktop.clientMounted).toBe(true);
    expect(desktop.isDesktop).toBe(true);
    expect(desktop.isLargeDesktop).toBe(true);
    expect(chatroomSidebarToggleVisible(desktop, false)).toBe(false);
    expect(chatroomSidebarBackdropVisible(desktop, true)).toBe(false);
    expect(chatroomSidebarClassName(desktop, false)).not.toContain("-translate-x-full");
    expect(chatroomSidebarStyle(desktop)).toMatchObject({
      position: "static",
      width: 272,
      transform: "none",
    });

    const tablet = readChatroomShellLayout(mqFor(800));
    expect(tablet.isDesktop).toBe(true);
    expect(tablet.isLargeDesktop).toBe(false);

    const mobile = readChatroomShellLayout(mqFor(375));
    expect(mobile.clientMounted).toBe(true);
    expect(mobile.isDesktop).toBe(false);
    expect(chatroomSidebarToggleVisible(mobile, false)).toBe(true);
    expect(chatroomSidebarClassName(mobile, false)).toContain("-translate-x-full");
    expect(chatroomSidebarStyle(mobile)).toMatchObject({
      position: "fixed",
      transform: "translateX(-100%)",
    });
  });

  it("mobile feed still declares the bottom nav for small screens", () => {
    expect(feed).toContain("lg:hidden pb-[env(safe-area-inset-bottom)]");
    expect(feed).toContain("pb-24 lg:pb-0");
  });
});

describe("mobile chat composer viewport", () => {
  const chat = read("components/chat/ChatApp.tsx");
  const shell = read("components/chat/chatroom-shell.ts");
  const input = read("components/chat/MessageInput.tsx");

  it("does not size the chat shell with 100vh / h-screen", () => {
    expect(chat).not.toMatch(/\bh-screen\b/);
    expect(chat).toContain("h-dvh");
    expect(chat).toContain("bindChatShellToVisualViewport");
    expect(shell).toContain("visualViewport");
  });

  it("keeps the composer in flex flow instead of sticky-to-layout-viewport", () => {
    expect(chat).toContain('style={{ position: "relative", bottom: "auto" }}');
    expect(input).toContain("transition-[border-color,box-shadow]");
    expect(input).not.toMatch(/chat-composer-glow[^\n]*transition-all/);
  });

  it("uses visual viewport height on mobile and leaves desktop to CSS", () => {
    expect(chatShellVisualViewportHeightPx({ isDesktop: true, innerHeight: 900 })).toBeNull();
    expect(chatShellVisualViewportHeightPx({
      isDesktop: false,
      visualViewportHeight: 412.4,
      innerHeight: 800,
    })).toBe(412);
    expect(chatShellVisualViewportHeightPx({
      isDesktop: false,
      innerHeight: 720,
    })).toBe(720);
  });

  it("bindChatShellToVisualViewport resizes the shell when the keyboard covers the visual viewport", () => {
    const g = globalThis as typeof globalThis & {
      visualViewport?: VisualViewport | null;
    };
    const orig = {
      matchMedia: g.matchMedia,
      visualViewport: g.visualViewport,
      innerHeight: Object.getOwnPropertyDescriptor(g, "innerHeight"),
      addEventListener: g.addEventListener,
      removeEventListener: g.removeEventListener,
      raf: g.requestAnimationFrame,
      caf: g.cancelAnimationFrame,
    };

    const resizeHandlers: Array<() => void> = [];
    let vvHeight = 480;
    const vv = {
      get height() {
        return vvHeight;
      },
      addEventListener(_type: string, fn: EventListenerOrEventListenerObject) {
        if (typeof fn === "function") resizeHandlers.push(fn as () => void);
      },
      removeEventListener(_type: string, fn: EventListenerOrEventListenerObject) {
        const i = resizeHandlers.indexOf(fn as () => void);
        if (i >= 0) resizeHandlers.splice(i, 1);
      },
    };

    g.matchMedia = ((query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener() {},
        removeEventListener() {},
      })) as typeof matchMedia;
    g.visualViewport = vv as unknown as VisualViewport;
    Object.defineProperty(g, "innerHeight", { configurable: true, value: 844 });
    g.addEventListener = (() => {}) as typeof addEventListener;
    g.removeEventListener = (() => {}) as typeof removeEventListener;
    g.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof requestAnimationFrame;
    g.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;

    const style: { height: string; maxHeight: string } = { height: "", maxHeight: "" };
    const el = {
      style: {
        get height() {
          return style.height;
        },
        set height(v: string) {
          style.height = v;
        },
        get maxHeight() {
          return style.maxHeight;
        },
        set maxHeight(v: string) {
          style.maxHeight = v;
        },
        removeProperty(name: string) {
          if (name === "height") style.height = "";
          if (name === "max-height") style.maxHeight = "";
          return "";
        },
      },
    };

    try {
      const unbind = bindChatShellToVisualViewport(el as unknown as HTMLElement);
      expect(style.height).toBe("480px");
      expect(style.maxHeight).toBe("480px");

      vvHeight = 360;
      resizeHandlers.forEach((fn) => fn());
      expect(style.height).toBe("360px");

      unbind();
      expect(style.height).toBe("");
      expect(style.maxHeight).toBe("");
    } finally {
      g.matchMedia = orig.matchMedia;
      g.visualViewport = orig.visualViewport;
      if (orig.innerHeight) Object.defineProperty(g, "innerHeight", orig.innerHeight);
      else delete (g as { innerHeight?: number }).innerHeight;
      g.addEventListener = orig.addEventListener;
      g.removeEventListener = orig.removeEventListener;
      g.requestAnimationFrame = orig.raf;
      g.cancelAnimationFrame = orig.caf;
    }
  });
});
