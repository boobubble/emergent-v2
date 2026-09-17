import type { IrcChatConnectionStatus } from "./types";

export type IrcConnectionLabel =
  | "Connecting"
  | "Connected"
  | "Reconnecting"
  | "Disconnected";

export function ircConnectionLabel(
  status: IrcChatConnectionStatus,
  hadAuthenticated: boolean,
): IrcConnectionLabel {
  if (status === "authenticated") return "Connected";
  if (status === "connecting" || status === "open") {
    return hadAuthenticated ? "Reconnecting" : "Connecting";
  }
  return "Disconnected";
}
