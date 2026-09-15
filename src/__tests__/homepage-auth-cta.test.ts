import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUTH_ENTRY_DESTINATION,
  LEGACY_LOBBY_ROOM_ID,
  YAARZO_GLOBAL_ROOM_ID,
  isGuestDefaultChatRoom,
} from "@/lib/auth-entry";
import { GUEST_LOBBY_CHANNEL_ID, isGuestLobbyChannel } from "@/lib/guest-chat-config";

const src = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

describe("homepage / heropage / login CTA auth entry", () => {
  it("Start Chatting and Join Free share the auth-choice modal, not a standalone signup hop", () => {
    const shell = read("components/home/HomeGuestShell.tsx");
    const seo = read("components/home/HomeSeoContent.tsx");
    expect(shell).toMatch(/onStartChat=\{\(\) => openAuth\("choice"\)\}/);
    expect(shell).toMatch(/onSignup=\{\(\) => openAuth\("choice"\)\}/);
    expect(shell).toMatch(/onLogin=\{\(\) => openAuth\("signin"\)\}/);
    expect(shell).toMatch(/successPath=\{AUTH_ENTRY_DESTINATION\}/);
    expect(seo).toMatch(/const openChatEntry = onStartChat \?\? onSignup/);
    expect(seo).toMatch(/onClick=\{openChatEntry\}/);
    expect(seo).toMatch(/onClick=\{onLogin\}/);
    expect(seo).not.toMatch(/href="\/login"/);
  });

  it("auth-choice modal is one AuthDialogs popup with Login, Guest Login, and Register", () => {
    const dialogs = read("components/auth/AuthDialogs.tsx");
    expect(dialogs).toMatch(/export type AuthPopup = null \| "choice" \| "signin" \| "signup" \| "forgot"/);
    expect(dialogs).toMatch(/function AuthChoiceDialog/);
    expect(dialogs).toMatch(/data-auth-choice-dialog/);
    expect(dialogs).toMatch(/Guest Login/);
    expect(dialogs).toMatch(/Register now/);
    expect(dialogs).toMatch(/>\s*Login\s*</);
    expect(dialogs).toMatch(/successPath/);
    expect(dialogs).toMatch(/void navigate\(\{ to: successPath \}\)/);
  });

  it("login and register success from entry dialogs go to /chatroom", () => {
    expect(AUTH_ENTRY_DESTINATION).toBe("/chatroom");
    const dialogs = read("components/auth/AuthDialogs.tsx");
    expect(dialogs).toMatch(/if \(successPath\) void navigate\(\{ to: successPath \}\)/);
    const screen = read("components/auth/AuthScreen.tsx");
    expect(screen).toMatch(/successPath=\{AUTH_ENTRY_DESTINATION\}/);
  });

  it("guest login reuses the existing nickname session and does not create a profile", () => {
    const btn = read("components/auth/ContinueAsGuestButton.tsx");
    const fns = read("lib/guest-chat.functions.ts");
    expect(btn).toMatch(/navigateToLobby:\s*true/);
    expect(btn).not.toMatch(/signInAnonymously|loginAsGuest/);
    expect(btn).toMatch(/Never creates Supabase anonymous/);
    expect(fns).not.toMatch(/signInAnonymously|loginAsGuest|auth\.admin\.createUser/);
    expect(fns).not.toMatch(/\.from\(["']profiles["']\)\s*\.(insert|upsert)/);
    expect(fns).toMatch(/guest_chat_sessions/);
  });

  it("canonical default room is Yaarzo Global for guests and registered chat entry", () => {
    expect(YAARZO_GLOBAL_ROOM_ID).toBe("yaarzo-global");
    expect(GUEST_LOBBY_CHANNEL_ID).toBe("yaarzo-global");
    expect(isGuestLobbyChannel("yaarzo-global")).toBe(true);
    expect(isGuestLobbyChannel(LEGACY_LOBBY_ROOM_ID)).toBe(true);
    expect(isGuestDefaultChatRoom("games")).toBe(false);
    const store = read("lib/chat-store.tsx");
    expect(store).toMatch(/const MAIN_IRC_ROOM_ID = "yaarzo-global"/);
    expect(store).toMatch(/activeChannel: MAIN_IRC_ROOM_ID/);
  });

  it("authenticated users are not kept on welcome / heropage / login / homepage chat embed", () => {
    const welcome = read("routes/welcome.tsx");
    const hero = read("routes/heropage.tsx");
    const login = read("routes/login.tsx");
    const index = read("routes/index.tsx");
    const root = read("routes/__root.tsx");
    expect(welcome).toMatch(/to:\s*"\/"/);
    expect(hero).toMatch(/Navigate to="\/chatroom"/);
    expect(hero).not.toMatch(/Navigate to="\/"/);
    expect(login).toMatch(/Navigate to=\{landingPathForMode/);
    expect(index).toMatch(/Navigate to="\/chatroom"/);
    expect(index).not.toMatch(/ChatApp/);
    expect(root).toMatch(/path === "\/welcome" \|\| path === "\/heropage" \|\| path === "\/login"/);
    expect(root).toMatch(/Navigate to="\/chatroom"/);
  });

  it("mobile and desktop homepage CTAs use the same openChatEntry handler", () => {
    const seo = read("components/home/HomeSeoContent.tsx");
    const startIdx = seo.indexOf("primaryCtaLabel");
    const slice = seo.slice(Math.max(0, startIdx - 200), startIdx + 400);
    expect(slice).toMatch(/onClick=\{openChatEntry\}/);
    expect(slice).not.toMatch(/sm:hidden[\s\S]{0,80}href="\/login"/);
    expect(seo.match(/onClick=\{openChatEntry\}/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("heropage primary CTAs open the same choice popup", () => {
    const hero = read("components/landing/sections/HeroSection.tsx");
    const header = read("components/landing/LandingHeader.tsx");
    const rooms = read("components/landing/sections/ChatroomsSection.tsx");
    const page = read("routes/heropage.tsx");
    expect(hero).toMatch(/setPopup\("choice"\)/);
    expect(header).toMatch(/setPopup\("choice"\)/);
    expect(rooms).toMatch(/setPopup\("choice"\)/);
    expect(page).toMatch(/successPath="\/chatroom"/);
    expect(header).toMatch(/setPopup\("signin"\)/);
  });
});
