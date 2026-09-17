import type { IrcChatAuth } from "./auth";
import { IRC_CHAT_DEFAULT_WS_URL, IRC_CHAT_PRODUCT_ROOM } from "./constants";
import {
  confirmPrivateMessage,
  markPrivateMessageFailed,
  peerAuthorIdForOutgoingPm,
  receivePrivateMessage,
} from "./dm";
import {
  applyPresenceEvent,
  applyRoomNamesSnapshot,
  presenceDedupKey,
  shouldSkipPresenceDedup,
} from "./membership";
import {
  confirmPublicMessage,
  markPublicMessageFailed,
  newMessageId,
  receivePublicMessage,
  shouldAcceptIncomingPublicMessage,
} from "./messages";
import type { ParsedGatewayEvent } from "./protocol";
import { fetchGatewayRooms } from "./rooms";
import { IrcChatTransport } from "./transport";
import {
  createInitialIrcChatState,
  type IrcChatConnectionStatus,
  type IrcChatState,
} from "./types";

export type IrcChatCoreOptions = {
  wsUrl?: string;
  roomsUrl?: string;
  auth: IrcChatAuth;
  transport?: IrcChatTransport;
  fetchImpl?: typeof fetch;
};

export class IrcChatCore {
  private readonly wsUrl: string;
  private readonly roomsUrl: string | null;
  private readonly auth: IrcChatAuth;
  private readonly transport: IrcChatTransport;
  private readonly fetchImpl: typeof fetch;
  private readonly listeners = new Set<(state: IrcChatState) => void>();
  private readonly presenceDedup = new Map<string, number>();

  private state: IrcChatState = createInitialIrcChatState();

  constructor(options: IrcChatCoreOptions) {
    this.wsUrl = options.wsUrl ?? IRC_CHAT_DEFAULT_WS_URL;
    this.roomsUrl = options.roomsUrl ?? null;
    this.auth = options.auth;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.transport =
      options.transport ??
      new IrcChatTransport();
  }

  subscribe(listener: (state: IrcChatState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): IrcChatState {
    return this.state;
  }

  connect(): void {
    this.patchState({ status: "connecting" });
    this.transport.connect(this.wsUrl, this.auth, {
      onStatus: (status, detail) => this.handleTransportStatus(status, detail),
      onEvent: (event) => this.handleGatewayEvent(event),
    });
  }

  disconnect(): void {
    this.transport.disconnect();
    this.patchState({
      status: "closed",
      statusDetail: undefined,
      ircNick: null,
      userId: null,
    });
  }

  async discoverRooms(): Promise<void> {
    if (!this.roomsUrl) return;
    const { rooms } = await fetchGatewayRooms(this.roomsUrl, this.fetchImpl);
    this.transport.setKnownRoomIds(Object.keys(rooms));
    this.patchState({ rooms: { ...this.state.rooms, ...rooms } });
  }

  joinRoom(roomId: string): boolean {
    const normalized = roomId.trim();
    if (!normalized) return false;
    return this.transport.join(normalized);
  }

  sendPublicMessage(text: string, roomId = IRC_CHAT_PRODUCT_ROOM): string | null {
    const trimmed = text.trim();
    if (!trimmed || !this.transport.connected) return null;

    const messageId = newMessageId();
    const nick = this.state.ircNick ?? "";
    const authorId =
      this.state.userId ??
      (this.auth.kind === "guest" ? this.auth.guest.visitorId : "");

    const msg = {
      id: messageId,
      roomId,
      authorId,
      nick,
      text: trimmed,
      ts: Date.now(),
      pending: true,
    };

    this.patchState({
      messages: receivePublicMessage(this.state.messages, roomId, msg),
    });

    if (!this.transport.sendPublic(roomId, messageId, trimmed)) {
      this.patchState({
        messages: markPublicMessageFailed(this.state.messages, roomId, messageId),
      });
      return null;
    }

    return messageId;
  }

  sendPrivateMessage(recipientNick: string, text: string): string | null {
    const trimmed = text.trim();
    const nick = recipientNick.trim();
    if (!trimmed || !nick || !this.transport.connected) return null;

    const messageId = newMessageId();
    const selfNick = this.state.ircNick ?? "";
    const selfUserId = this.state.userId ?? "";
    const authorId = peerAuthorIdForOutgoingPm(selfUserId, selfNick);

    const channelId = `ircpm:${nick}`;
    const msg = {
      id: messageId,
      roomId: channelId,
      authorId,
      nick: selfNick,
      text: trimmed,
      ts: Date.now(),
      pending: true,
    };

    this.patchState({
      privateMessages: receivePrivateMessage(this.state.privateMessages, nick, msg),
    });

    if (!this.transport.sendPm(nick, messageId, trimmed)) {
      this.patchState({
        privateMessages: markPrivateMessageFailed(
          this.state.privateMessages,
          nick,
          messageId,
        ),
      });
      return null;
    }

    return messageId;
  }

  private handleTransportStatus(
    status: IrcChatConnectionStatus,
    detail?: string,
  ): void {
    if (status === "authenticated") {
      const userId = this.transport.authenticatedUserId;
      const ircNick = this.transport.nick;
      this.patchState({
        status: "authenticated",
        statusDetail: detail,
        userId,
        ircNick,
      });
      this.transport.join(IRC_CHAT_PRODUCT_ROOM);
      return;
    }

    this.patchState({ status, statusDetail: detail });
  }

  private handleGatewayEvent(event: ParsedGatewayEvent): void {
    switch (event.kind) {
      case "room_names": {
        const members = applyRoomNamesSnapshot(
          this.state.members[event.room] ?? [],
          event.members,
        );
        this.patchState({
          members: { ...this.state.members, [event.room]: members },
        });
        break;
      }
      case "presence": {
        const fallbackRoom = IRC_CHAT_PRODUCT_ROOM;
        const room = event.event.room || fallbackRoom;
        const key = presenceDedupKey(event.event, room);
        if (shouldSkipPresenceDedup(this.presenceDedup, key)) break;

        const current = this.state.members[room] ?? [];
        const nextMembers = applyPresenceEvent(current, event.event, fallbackRoom);
        this.patchState({
          members: { ...this.state.members, [room]: nextMembers },
        });
        break;
      }
      case "public_message": {
        if (
          !shouldAcceptIncomingPublicMessage(
            this.state.messages,
            event.room,
            event.messageId,
          )
        ) {
          break;
        }
        this.patchState({
          messages: receivePublicMessage(this.state.messages, event.room, {
            id: event.messageId,
            authorId: event.userId,
            nick: event.nick,
            text: event.text,
            ts: Date.now(),
          }),
        });
        break;
      }
      case "public_message_sent": {
        this.patchState({
          messages: confirmPublicMessage(
            this.state.messages,
            event.room,
            event.messageId,
            {
              authorId: event.userId,
              nick: event.nick,
              text: event.text,
            },
          ),
        });
        break;
      }
      case "pm_message": {
        this.patchState({
          privateMessages: receivePrivateMessage(
            this.state.privateMessages,
            event.nick,
            {
              id: event.messageId,
              authorId: `irc:${event.nick}`,
              nick: event.nick,
              text: event.text,
              ts: Date.now(),
            },
          ),
        });
        break;
      }
      case "pm_sent": {
        this.patchState({
          privateMessages: confirmPrivateMessage(
            this.state.privateMessages,
            event.recipientNick,
            event.messageId,
          ),
        });
        break;
      }
      default:
        break;
    }
  }

  private patchState(patch: Partial<IrcChatState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
