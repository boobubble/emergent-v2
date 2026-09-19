import type { IrcChatAuth } from "./auth";
import {
  buildAuthFrame,
  buildJoinFrame,
  buildPartFrame,
  buildPmSendFrame,
  buildPublicSendFrame,
  buildReactionListFrame,
  buildReactionToggleFrame,
  isValidMessageId,
  parseGatewayEvent,
  parseGatewayFrame,
} from "./protocol";
import type { IrcReactionType } from "./reactions";
import { IRC_REACTION_LIST_BATCH_MAX } from "./reactions";
import type { ParsedGatewayEvent } from "./protocol";
import { isIrcChatLiveRoom } from "./rooms";

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 10_000;

export type IrcChatTransportStatus =
  | "connecting"
  | "open"
  | "authenticated"
  | "closed"
  | "error";

export type IrcChatTransportHandlers = {
  onStatus?: (status: IrcChatTransportStatus, detail?: string) => void;
  onEvent?: (event: ParsedGatewayEvent) => void;
};

/**
 * Non-singleton gateway WebSocket client for the IRC-first chat core.
 * Resolves a fresh registered JWT per socket before sending auth.
 */
export class IrcChatTransport {
  private ws: WebSocket | null = null;
  private wsUrl: string | null = null;
  private auth: IrcChatAuth | null = null;
  private handlers: IrcChatTransportHandlers = {};

  private authenticated = false;
  private manualDisconnect = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private socketGeneration = 0;
  private pendingAuthSocket: WebSocket | null = null;
  private knownRoomIds = new Set<string>();

  private ircNick: string | null = null;
  private userId: string | null = null;

  get open(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connected(): boolean {
    return this.open && this.authenticated;
  }

  get nick(): string | null {
    return this.ircNick;
  }

  get authenticatedUserId(): string | null {
    return this.userId;
  }

  setKnownRoomIds(ids: Iterable<string>): void {
    this.knownRoomIds = new Set(ids);
  }

  connect(url: string, auth: IrcChatAuth, handlers: IrcChatTransportHandlers = {}): void {
    if (!url.startsWith("wss://")) {
      this.emitStatus("error", "IRC transport requires a wss:// URL");
      return;
    }

    if (auth.kind === "registered" && typeof auth.resolveToken !== "function") {
      this.emitStatus("error", "Registered auth requires resolveToken");
      return;
    }

    if (auth.kind === "guest" && (!auth.guest.token || !auth.guest.visitorId)) {
      this.emitStatus("error", "Guest auth requires gateway token");
      return;
    }

    this.manualDisconnect = false;
    this.wsUrl = url;
    this.auth = auth;
    this.handlers = handlers;

    if (this.ws) {
      const state = this.ws.readyState;
      if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
        if (state === WebSocket.OPEN && !this.authenticated) {
          void this.sendAuth();
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
    this.ircNick = null;
    this.userId = null;
    this.clearSocket();
    this.emitStatus("closed");
  }

  join(room: string): boolean {
    const normalizedRoom = room.trim();
    if (!normalizedRoom || !this.connected || !this.ws) return false;
    if (!isIrcChatLiveRoom(normalizedRoom, this.knownRoomIds)) return false;
    try {
      this.ws.send(JSON.stringify(buildJoinFrame(normalizedRoom)));
      return true;
    } catch {
      return false;
    }
  }

  part(room: string): boolean {
    const normalizedRoom = room.trim();
    if (!normalizedRoom || !this.connected || !this.ws) return false;
    if (!isIrcChatLiveRoom(normalizedRoom, this.knownRoomIds)) return false;
    try {
      this.ws.send(JSON.stringify(buildPartFrame(normalizedRoom)));
      return true;
    } catch {
      return false;
    }
  }

  sendPublic(
    room: string,
    messageId: string,
    text: string,
    replyToMessageId?: string,
  ): boolean {
    if (!isValidMessageId(messageId)) return false;
    const trimmed = text.trim();
    const normalizedRoom = room.trim();
    if (!trimmed || !normalizedRoom || !this.connected || !this.ws) return false;
    if (!isIrcChatLiveRoom(normalizedRoom, this.knownRoomIds)) return false;
    try {
      this.ws.send(
        JSON.stringify(
          buildPublicSendFrame(normalizedRoom, messageId, trimmed, replyToMessageId),
        ),
      );
      return true;
    } catch {
      this.emitStatus("error", "Failed to send IRC message");
      return false;
    }
  }

  sendReactionToggle(
    room: string,
    messageId: string,
    reactionType: IrcReactionType,
  ): boolean {
    if (!isValidMessageId(messageId)) return false;
    const normalizedRoom = room.trim();
    if (!normalizedRoom || !this.connected || !this.ws) return false;
    if (!isIrcChatLiveRoom(normalizedRoom, this.knownRoomIds)) return false;
    try {
      this.ws.send(
        JSON.stringify(buildReactionToggleFrame(normalizedRoom, messageId, reactionType)),
      );
      return true;
    } catch {
      return false;
    }
  }

  sendReactionList(room: string, messageIds: string[]): boolean {
    const normalizedRoom = room.trim();
    if (!normalizedRoom || !this.connected || !this.ws) return false;
    if (!isIrcChatLiveRoom(normalizedRoom, this.knownRoomIds)) return false;
    const ids = messageIds
      .map((id) => id.trim())
      .filter((id) => isValidMessageId(id))
      .slice(0, IRC_REACTION_LIST_BATCH_MAX);
    if (!ids.length) return false;
    try {
      this.ws.send(JSON.stringify(buildReactionListFrame(normalizedRoom, ids)));
      return true;
    } catch {
      return false;
    }
  }

  sendPm(recipientNick: string, messageId: string, text: string): boolean {
    if (!isValidMessageId(messageId)) return false;
    const trimmed = text.trim();
    const nick = recipientNick.trim();
    if (!trimmed || !nick || !this.connected || !this.ws) return false;
    try {
      this.ws.send(JSON.stringify(buildPmSendFrame(nick, messageId, trimmed)));
      return true;
    } catch {
      return false;
    }
  }

  /** Test helper: inject a raw gateway frame. */
  ingestRawFrame(raw: string): void {
    const frame = parseGatewayFrame(raw);
    if (!frame?.type) return;
    this.dispatchFrame(frame);
  }

  private openSocket(): void {
    if (!this.wsUrl || !this.auth || this.manualDisconnect) return;

    if (typeof WebSocket === "undefined") {
      this.emitStatus("error", "WebSocket is not available");
      return;
    }

    this.clearReconnectTimer();
    this.authenticated = false;
    this.pendingAuthSocket = null;
    this.socketGeneration += 1;
    this.emitStatus("connecting");

    try {
      this.ws = new WebSocket(this.wsUrl);
    } catch {
      this.emitStatus("error", "Failed to open IRC WebSocket");
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
    void this.sendAuth();
  };

  private readonly handleMessage = (event: MessageEvent<string>): void => {
    const frame = parseGatewayFrame(
      typeof event.data === "string" ? event.data : String(event.data),
    );
    if (!frame?.type) return;
    this.dispatchFrame(frame);
  };

  private dispatchFrame(frame: import("./protocol").GatewayFrame): void {
    const parsed = parseGatewayEvent(frame);
    if (!parsed) return;

    if (parsed.kind === "authenticated") {
      this.authenticated = true;
      this.reconnectAttempt = 0;
      this.ircNick = parsed.ircNick;
      this.userId = parsed.userId;
      this.emitStatus("authenticated");
    }

    if (parsed.kind === "error") {
      this.emitStatus("error", parsed.message);
      if (
        parsed.code === "AUTH_INVALID" ||
        parsed.code === "AUTH_REQUIRED" ||
        parsed.code === "IRC_SESSION_FAILED"
      ) {
        this.closeSocketAndReconnect();
      }
    }

    this.handlers.onEvent?.(parsed);
  }

  private readonly handleClose = (): void => {
    const wasManual = this.manualDisconnect;
    this.authenticated = false;
    this.ircNick = null;
    this.userId = null;
    this.clearSocket();
    this.emitStatus("closed");
    if (!wasManual) this.scheduleReconnect();
  };

  private readonly handleError = (): void => {
    this.emitStatus("error", "IRC WebSocket error");
  };

  private async sendAuth(): Promise<void> {
    const socket = this.ws;
    const auth = this.auth;
    if (!socket || socket.readyState !== WebSocket.OPEN || !auth) return;

    const generation = this.socketGeneration;

    if (auth.kind === "guest") {
      try {
        socket.send(JSON.stringify(buildAuthFrame(auth, "")));
      } catch {
        this.emitStatus("error", "Failed to authenticate IRC connection");
      }
      return;
    }

    if (this.pendingAuthSocket === socket) return;
    this.pendingAuthSocket = socket;

    let token: string | null = null;
    try {
      token = await auth.resolveToken();
    } catch {
      token = null;
    } finally {
      if (this.pendingAuthSocket === socket) {
        this.pendingAuthSocket = null;
      }
    }

    if (
      this.manualDisconnect ||
      this.ws !== socket ||
      this.socketGeneration !== generation ||
      socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    if (!token) {
      this.emitStatus("error", "IRC authentication unavailable");
      this.closeSocketAndReconnect();
      return;
    }

    try {
      socket.send(JSON.stringify(buildAuthFrame(auth, token)));
    } catch {
      this.emitStatus("error", "Failed to authenticate IRC connection");
    }
  }

  private closeSocketAndReconnect(): void {
    const wasManual = this.manualDisconnect;
    this.clearSocket();
    this.emitStatus("closed");
    if (!wasManual) this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.manualDisconnect || !this.wsUrl || !this.auth) return;
    if (this.reconnectTimer) return;

    const delay = Math.min(
      MAX_BACKOFF_MS,
      INITIAL_BACKOFF_MS * 2 ** this.reconnectAttempt,
    );
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
        /* ignore */
      }
    }

    this.ws = null;
    this.authenticated = false;
    if (this.pendingAuthSocket === socket) {
      this.pendingAuthSocket = null;
    }
  }

  private emitStatus(status: IrcChatTransportStatus, detail?: string): void {
    try {
      this.handlers.onStatus?.(status, detail);
    } catch {
      /* never throw into React */
    }
  }
}
