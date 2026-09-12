/** Gateway room name (wire protocol). Normalized to {@link LOBBY_IRC_CHANNEL} for app consumers. */
const GATEWAY_ROOM = "global";

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 10_000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): boolean {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export const LOBBY_IRC_CHANNEL = "lobby";

export function usesLobbyIrcLive(channelId: string): boolean {
  return channelId === LOBBY_IRC_CHANNEL;
}

export type LobbyIrcIncomingMessage = {
  room: typeof LOBBY_IRC_CHANNEL;
  messageId: string;
  nick: string;
  userId: string;
  text: string;
};

export type LobbyIrcStatus = "connecting" | "open" | "authenticated" | "closed" | "error";

export type LobbyIrcStatusHandler = (status: LobbyIrcStatus, detail?: string) => void;

type GatewayOutgoingAuth = { type: "auth"; token: string };
type GatewayOutgoingSend = { type: "message.send"; room: string; messageId: string; text: string };

type GatewayFrame = {
  type?: string;
  event?: string;
  room?: string;
  messageId?: string;
  nick?: string;
  userId?: string;
  text?: string;
  message?: string;
  error?: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function safeJsonParse(raw: string): GatewayFrame | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as GatewayFrame) : null;
  } catch {
    return null;
  }
}

function asNonEmptyString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Browser-safe WebSocket client for the Yaarzo lobby IRC gateway.
 * Singleton export avoids duplicate sockets across React remounts.
 */
export class LobbyIrcTransport {
  private ws: WebSocket | null = null;
  private wsUrl: string | null = null;
  private token: string | null = null;
  private onMessage: ((message: LobbyIrcIncomingMessage) => void) | null = null;
  private onStatus: LobbyIrcStatusHandler | null = null;

  private authenticated = false;
  private manualDisconnect = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lifecycleBound = false;

  /** WebSocket is open (may still be awaiting gateway auth). */
  get open(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /** Gateway accepted auth — safe to send lobby messages. */
  get connected(): boolean {
    return this.open && this.authenticated;
  }

  connect(
    url: string,
    token: string,
    onMessage: (message: LobbyIrcIncomingMessage) => void,
    onStatus?: LobbyIrcStatusHandler,
  ): void {
    if (!url.startsWith("wss://")) {
      this.emitStatus("error", "Lobby IRC transport requires a wss:// URL");
      return;
    }
    if (!token) {
      this.emitStatus("error", "Lobby IRC transport requires an auth token");
      return;
    }

    this.manualDisconnect = false;
    this.wsUrl = url;
    this.token = token;
    this.onMessage = onMessage;
    this.onStatus = onStatus ?? null;

    this.bindLifecycleListeners();

    if (this.ws) {
      const state = this.ws.readyState;
      if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
        if (state === WebSocket.OPEN && !this.authenticated) {
          this.sendAuth();
        }
        return;
      }
      this.clearSocket();
    }

    this.openSocket();
  }

  disconnect(): void {
    this.manualDisconnect = true;
    this.clearReconnectTimer();
    this.authenticated = false;
    this.clearSocket();
    this.unbindLifecycleListeners();
    this.emitStatus("closed");
  }

  send(messageId: string, text: string, room = GATEWAY_ROOM): boolean {
    if (!isValidUuid(messageId)) return false;
    const trimmed = text.trim();
    const normalizedRoom = room.trim();
    if (!trimmed || !normalizedRoom || !this.connected || !this.ws) return false;

    const frame: GatewayOutgoingSend = {
      type: "message.send",
      room: normalizedRoom,
      messageId: messageId.trim(),
      text: trimmed,
    };
    try {
      this.ws.send(JSON.stringify(frame));
      return true;
    } catch {
      this.emitStatus("error", "Failed to send lobby message");
      return false;
    }
  }

  private openSocket(): void {
    if (!this.wsUrl || !this.token || this.manualDisconnect) return;
    if (typeof WebSocket === "undefined") {
      this.emitStatus("error", "WebSocket is not available in this environment");
      return;
    }

    this.clearReconnectTimer();
    this.authenticated = false;
    this.emitStatus("connecting");

    try {
      this.ws = new WebSocket(this.wsUrl);
    } catch {
      this.emitStatus("error", "Failed to open lobby WebSocket");
      this.scheduleReconnect();
      return;
    }

    this.ws.addEventListener("open", this.handleOpen);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
    this.ws.addEventListener("error", this.handleError);
  }

  private readonly handleOpen = (): void => {
    this.emitStatus("open");
    this.sendAuth();
  };

  private readonly handleMessage = (event: MessageEvent<string>): void => {
    const frame = safeJsonParse(typeof event.data === "string" ? event.data : String(event.data));
    if (!frame?.type) return;

    if (frame.type === "gateway" && frame.event === "authenticated") {
      this.authenticated = true;
      this.reconnectAttempt = 0;
      this.emitStatus("authenticated");
      return;
    }

    if (frame.type === "message") {
      if (frame.room !== GATEWAY_ROOM) return;
      const messageId = typeof frame.messageId === "string" ? frame.messageId.trim() : "";
      if (!isValidUuid(messageId)) {
        this.emitStatus("error", "Ignored lobby message with invalid messageId");
        return;
      }
      const nick = asNonEmptyString(frame.nick);
      const userId = asNonEmptyString(frame.userId);
      if (typeof frame.text !== "string" || !nick || !userId) return;
      const text = frame.text.trim();
      if (!text) return;

      this.onMessage?.({
        room: LOBBY_IRC_CHANNEL,
        messageId,
        nick,
        userId,
        text,
      });
      return;
    }

    if (frame.type === "message.sent") {
      return;
    }

    if (frame.type === "error") {
      const detail = asNonEmptyString(frame.message) || asNonEmptyString(frame.error) || "Gateway error";
      this.emitStatus("error", detail);
    }
  };

  private readonly handleClose = (): void => {
    const wasManual = this.manualDisconnect;
    this.authenticated = false;
    this.clearSocket();
    if (wasManual) {
      this.emitStatus("closed");
      return;
    }
    this.emitStatus("closed");
    this.scheduleReconnect();
  };

  private readonly handleError = (): void => {
    this.emitStatus("error", "Lobby WebSocket error");
  };

  private sendAuth(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.token) return;
    const frame: GatewayOutgoingAuth = { type: "auth", token: this.token };
    try {
      this.ws.send(JSON.stringify(frame));
    } catch {
      this.emitStatus("error", "Failed to authenticate lobby connection");
    }
  }

  private scheduleReconnect(): void {
    if (this.manualDisconnect || !this.wsUrl || !this.token) return;
    if (this.reconnectTimer) return;

    const delay = Math.min(MAX_BACKOFF_MS, INITIAL_BACKOFF_MS * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.manualDisconnect) return;
      this.openSocket();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) return;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private clearSocket(): void {
    const socket = this.ws;
    if (!socket) return;
    socket.removeEventListener("open", this.handleOpen);
    socket.removeEventListener("message", this.handleMessage);
    socket.removeEventListener("close", this.handleClose);
    socket.removeEventListener("error", this.handleError);
    if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
      try {
        socket.close();
      } catch {
        /* ignore close errors */
      }
    }
    this.ws = null;
    this.authenticated = false;
  }

  private bindLifecycleListeners(): void {
    if (!isBrowser() || this.lifecycleBound) return;
    window.addEventListener("online", this.handleOnline);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.lifecycleBound = true;
  }

  private unbindLifecycleListeners(): void {
    if (!isBrowser() || !this.lifecycleBound) return;
    window.removeEventListener("online", this.handleOnline);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.lifecycleBound = false;
  }

  private readonly handleOnline = (): void => {
    if (this.manualDisconnect || !this.wsUrl || !this.token) return;
    if (this.connected) return;
    this.clearReconnectTimer();
    this.reconnectAttempt = 0;
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.openSocket();
    }
  };

  private readonly handleVisibility = (): void => {
    if (document.visibilityState !== "visible") return;
    this.handleOnline();
  };

  private emitStatus(status: LobbyIrcStatus, detail?: string): void {
    try {
      this.onStatus?.(status, detail);
    } catch {
      /* never throw into React render */
    }
  }
}

export const lobbyIrcTransport = new LobbyIrcTransport();
