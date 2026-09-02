/**
 * Chatroom browser notifications — one module for message + join/leave.
 * Reuses the existing chat realtime path (chat-store INSERT / PresenceFeed).
 * Does NOT insert into the notifications table (that is the feed/friends bell).
 */

import { useEffect, useState } from "react";
import { isLocalBotPeerId } from "./dm-utils";

export const OPEN_CHAT_ROOM_EVENT = "palrgo:open-chat-room";
export const CHAT_INAPP_ALERT_EVENT = "palrgo:chat-inapp-alert";
export const CHAT_NOTIF_PERMISSION_EVENT = "palrgo:chat-notif-permission";
export const OPEN_CHAT_ROOM_STORAGE_KEY = "yaarzo:open-chat-room";
/** Unhashed public/ asset — dedicated chat notification icon (not the tab favicon). */
export const CHAT_NOTIFICATION_ICON_PATH = "/notification-icon.png";
/** Narrow-scope worker used only so Chrome/Edge Windows can paint icon+image. */
export const CHAT_NOTIFICATION_SW_URL = "/chat-notifications/sw.js";
export const CHAT_NOTIFICATION_CLICK_MESSAGE = "yaarzo:open-chat-room";
const DEDUPE_PREFIX = "yaarzo:chat-notif:";
const DEDUPE_MS = 12_000;
const BC_NAME = "yaarzo-chat-notif";

export type ChatNotifKind = "message" | "join" | "leave";

export type ChatBrowserNotifInput = {
  eventId: string;
  kind: ChatNotifKind;
  channelId: string;
  roomName: string;
  actorName: string;
  preview?: string;
};

export type ChatInAppAlert = {
  title: string;
  body: string;
  channelId: string;
};

const seenIds = new Set<string>();
let bc: BroadcastChannel | null = null;

function ensureBroadcast(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (bc) return bc;
  try {
    bc = new BroadcastChannel(BC_NAME);
    bc.onmessage = (ev) => {
      const id = (ev.data as { id?: string } | null)?.id;
      if (id) seenIds.add(id);
    };
  } catch {
    bc = null;
  }
  return bc;
}

export function roomDisplayName(channelId: string, roomName?: string | null): string {
  const raw = (roomName || channelId || "room").trim();
  return raw.replace(/^#/, "");
}

export function formatChatNotifTitle(kind: ChatNotifKind, roomName: string): string {
  const room = roomDisplayName("", roomName);
  if (kind === "join") return `${room} presence`;
  if (kind === "leave") return `${room} presence`;
  return `New message in #${room}`;
}

export function formatChatNotifBody(input: ChatBrowserNotifInput): string {
  const room = roomDisplayName(input.channelId, input.roomName);
  if (input.kind === "join") return `${input.actorName} joined #${room}`;
  if (input.kind === "leave") return `${input.actorName} left #${room}`;
  const preview = (input.preview || "").replace(/\s+/g, " ").trim();
  const clip = preview.length > 80 ? `${preview.slice(0, 77)}…` : preview;
  return clip ? `${input.actorName}: ${clip}` : input.actorName;
}

export function isBotChatAuthor(authorId: string): boolean {
  return isLocalBotPeerId(authorId) || authorId === "system" || authorId === "me";
}

export function shouldNotifyChatMessage(opts: {
  authorId: string;
  channelId: string;
  kind?: string;
  authUserId: string | null;
}): boolean {
  if (!opts.authUserId) return false;
  if (opts.channelId.startsWith("dm:")) return false;
  if (opts.authorId === "me") return false;
  if (isBotChatAuthor(opts.authorId)) return false;
  if (opts.kind === "system") return false;
  return true;
}

export function shouldNotifyPresence(opts: {
  userName: string;
  channelId: string;
  authUserId: string | null;
}): boolean {
  if (!opts.authUserId) return false;
  if (opts.channelId.startsWith("dm:")) return false;
  const name = opts.userName.trim();
  return name.length > 0;
}

/**
 * Absolute URL for Notification.icon / badge / image.
 * Resolves against origin at notify time so `/notification-icon.png` works from any path
 * (e.g. https://yaarzo.com/chatroom → https://yaarzo.com/notification-icon.png).
 */
export function chatNotificationIconUrl(origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return CHAT_NOTIFICATION_ICON_PATH;
  return new URL(CHAT_NOTIFICATION_ICON_PATH, base).href;
}

/**
 * Exact NotificationOptions passed at runtime.
 * Chrome/Edge on Windows ignore `badge` (Android-only) and often keep the browser
 * logo as the toast identity. `image` is the Windows Action Center hero slot that
 * Chromium actually paints; `icon` remains the square content thumbnail.
 */
export function buildChatNotificationOptions(
  input: ChatBrowserNotifInput,
  origin?: string,
): NotificationOptions {
  const icon = chatNotificationIconUrl(origin);
  const body = input.kind === "message" ? formatChatNotifBody(input) : "";
  return {
    body: body || undefined,
    tag: input.eventId,
    icon,
    badge: icon,
    image: icon,
    data: { channelId: input.channelId, kind: input.kind },
  };
}

export function chatNotificationTitle(input: ChatBrowserNotifInput): string {
  return input.kind === "message"
    ? formatChatNotifTitle("message", input.roomName)
    : formatChatNotifBody(input);
}

let swClickListenerInstalled = false;

function ensureServiceWorkerClickListener() {
  if (swClickListenerInstalled || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  swClickListenerInstalled = true;
  navigator.serviceWorker.addEventListener("message", (event: MessageEvent) => {
    const data = event.data as { type?: string; channelId?: string } | null;
    if (data?.type === CHAT_NOTIFICATION_CLICK_MESSAGE && data.channelId) {
      navigateToChatRoom(data.channelId);
    }
  });
}

function canUseServiceWorkerNotifications(): boolean {
  return typeof navigator !== "undefined"
    && !!navigator.serviceWorker
    && typeof navigator.serviceWorker.register === "function";
}

let cachedSwRegistration: Promise<ServiceWorkerRegistration> | null = null;

function chatNotificationWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!cachedSwRegistration) {
    cachedSwRegistration = navigator.serviceWorker.register(CHAT_NOTIFICATION_SW_URL);
  }
  return cachedSwRegistration;
}

async function showViaServiceWorker(title: string, options: NotificationOptions): Promise<boolean> {
  if (!canUseServiceWorkerNotifications()) return false;
  try {
    ensureServiceWorkerClickListener();
    const reg = await chatNotificationWorkerRegistration();
    if (typeof reg.showNotification !== "function") return false;
    await reg.showNotification(title, options);
    return true;
  } catch {
    cachedSwRegistration = null;
    return false;
  }
}

function showViaNotificationConstructor(title: string, options: NotificationOptions, channelId: string) {
  const n = new Notification(title, options);
  n.onclick = () => {
    try { window.focus(); } catch { /* ignore */ }
    navigateToChatRoom(channelId);
    n.close();
  };
}

async function displayChatBrowserNotification(
  title: string,
  options: NotificationOptions,
  channelId: string,
): Promise<void> {
  const viaSw = await showViaServiceWorker(title, options);
  if (viaSw) return;
  showViaNotificationConstructor(title, options, channelId);
}

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isBrowserNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/** User-gesture only. Never call from page-load effects. */
export async function requestChatNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isBrowserNotificationSupported()) return "unsupported";
  if (Notification.permission !== "default") {
    emitPermissionChange();
    return Notification.permission;
  }
  const result = await Notification.requestPermission();
  emitPermissionChange();
  return result;
}

function emitPermissionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHAT_NOTIF_PERMISSION_EVENT));
}

export function claimChatNotifEvent(eventId: string, now = Date.now()): boolean {
  if (!eventId || seenIds.has(eventId)) return false;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(DEDUPE_PREFIX + eventId);
      if (raw && now - Number(raw) < DEDUPE_MS) {
        seenIds.add(eventId);
        return false;
      }
      localStorage.setItem(DEDUPE_PREFIX + eventId, String(now));
    } catch {
      /* private mode */
    }
  }
  seenIds.add(eventId);
  try {
    ensureBroadcast()?.postMessage({ id: eventId });
  } catch {
    /* ignore */
  }
  return true;
}

export function navigateToChatRoom(channelId: string) {
  if (typeof window === "undefined" || !channelId) return;
  try {
    sessionStorage.setItem(OPEN_CHAT_ROOM_STORAGE_KEY, channelId);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_ROOM_EVENT, { detail: { channelId } }));
}

function showInAppFallback(alert: ChatInAppAlert) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_INAPP_ALERT_EVENT, { detail: alert }));
}

export function showChatBrowserNotification(input: ChatBrowserNotifInput): boolean {
  if (!claimChatNotifEvent(input.eventId)) return false;
  const title = chatNotificationTitle(input);
  const options = buildChatNotificationOptions(input);
  const perm = getNotificationPermission();

  if (perm === "granted") {
    if (canUseServiceWorkerNotifications()) {
      void displayChatBrowserNotification(title, options, input.channelId);
      return true;
    }
    try {
      showViaNotificationConstructor(title, options, input.channelId);
      return true;
    } catch {
      /* fall through */
    }
  }

  if (perm === "unsupported") {
    showInAppFallback({
      title,
      body: (options.body as string | undefined) || title,
      channelId: input.channelId,
    });
    return true;
  }

  return false;
}

export function peekPendingOpenChatRoom(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(OPEN_CHAT_ROOM_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function consumePendingOpenChatRoom(): string | null {
  const id = peekPendingOpenChatRoom();
  if (!id) return null;
  try {
    sessionStorage.removeItem(OPEN_CHAT_ROOM_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return id;
}

/** Reset in-memory dedupe (tests only). */
export function resetChatNotifDedupeForTests() {
  seenIds.clear();
  cachedSwRegistration = null;
  swClickListenerInstalled = false;
}

export function useChatNotificationPermission(): NotificationPermission | "unsupported" {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(() =>
    typeof window === "undefined" ? "default" : getNotificationPermission(),
  );
  useEffect(() => {
    const sync = () => setPerm(getNotificationPermission());
    sync();
    window.addEventListener(CHAT_NOTIF_PERMISSION_EVENT, sync);
    return () => window.removeEventListener(CHAT_NOTIF_PERMISSION_EVENT, sync);
  }, []);
  return perm;
}
