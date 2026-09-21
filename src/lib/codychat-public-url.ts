const DEFAULT_CODYCHAT_PUBLIC_BASE = "https://chat.yaarzo.com";

/** Public CodyChat origin (no SSO path). Shared default with server SSO handler. */
export function getCodyChatPublicBaseUrl(): string {
  const fromVite =
    typeof import.meta !== "undefined"
      ? String(import.meta.env.VITE_CODYCHAT_PUBLIC_URL ?? "").trim()
      : "";
  if (fromVite) return fromVite.replace(/\/+$/, "");

  const fromProcess =
    typeof process !== "undefined" ? String(process.env.CODYCHAT_PUBLIC_URL ?? "").trim() : "";
  if (fromProcess) return fromProcess.replace(/\/+$/, "");

  return DEFAULT_CODYCHAT_PUBLIC_BASE;
}

/** Signed-out native CodyChat guest login entry (iframe loads CodyChat login + Guest login). */
export function getCodyChatNativeGuestEntryUrl(): string {
  return `${getCodyChatPublicBaseUrl()}/?guest=1`;
}

