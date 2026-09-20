export const YAARZO_LOGOUT_MESSAGE_TYPE = "YAARZO_LOGOUT" as const;

export function isYaarzoLogoutMessage(
  data: unknown,
  origin: string,
  allowedOrigins: readonly string[],
): boolean {
  if (!allowedOrigins.includes(origin)) return false;
  if (!data || typeof data !== "object") return false;
  const rec = data as Record<string, unknown>;
  return rec.type === YAARZO_LOGOUT_MESSAGE_TYPE && rec.source === "codychat";
}
