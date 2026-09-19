import type { IrcChatAuth } from "./auth";
import { IRC_CHAT_DEFAULT_WS_URL, IRC_CHAT_PRODUCT_ROOM } from "./constants";
import {
  defaultIrcChatSoundPlayer,
  playIncomingPmSoundEffect,
  playJoinSoundEffect,
  playPublicMessageSoundEffects,
  type IrcChatSoundPlayer,
} from "./irc-sounds";
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
import { isValidMessageId, parseOptionalReplyToMessageId, type ParsedGatewayEvent } from "./protocol";
import {
  applyOptimisticReactionToggle,
  IRC_REACTION_LIST_BATCH_MAX,
  mergeMessageReactions,
  type IrcReactionType,
  type IrcRoomReactionsState,
} from "./reactions";
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
  soundPlayer?: IrcChatSoundPlayer;
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

  /** IRC-confirmed public channel membership (single active room). */
  private joinedPublicRoom: string | null = null;
  /** Latest UI/core switch target; used to ignore stale room.joined acks. */
  private desiredPublicRoom: string | null = null;
  /** Client-side acceptance of incoming native IRC PMs (does not disconnect IRC). */
  private incomingPmEnabled = true;
  /** UI-selected room for public/join sounds (null when viewing a DM). */
  private soundActiveRoom: string | null = IRC_CHAT_PRODUCT_ROOM;
  /** Skip join sounds until first NAMES snapshot after room join (avoids bootstrap storms). */
  private joinSoundSuppressedRooms = new Set<string>();
  private readonly soundPlayer: IrcChatSoundPlayer;
  private reactionHydrateTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingReactionSnapshots = new Map<
    string,
    IrcRoomReactionsState[string] | undefined
  >();

  constructor(options: IrcChatCoreOptions) {
    this.wsUrl = options.wsUrl ?? IRC_CHAT_DEFAULT_WS_URL;
    this.roomsUrl = options.roomsUrl ?? null;
    this.auth = options.auth;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.soundPlayer = options.soundPlayer ?? defaultIrcChatSoundPlayer;
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

  /** Yaarzo client policy: when false, incoming `pm_message` events are not stored. */
  setIncomingPmEnabled(enabled: boolean): void {
    this.incomingPmEnabled = enabled;
  }

  /** Which public room the user is viewing (for message/join sounds). Pass null in DM view. */
  setSoundActiveRoom(roomId: string | null): void {
    const trimmed = roomId?.trim();
    this.soundActiveRoom = trimmed || null;
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
    this.resetPublicRoomSwitchState();
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

    this.desiredPublicRoom = normalized;
    if (normalized === this.joinedPublicRoom) {
      return true;
    }
    return this.transport.join(normalized);
  }

  sendPublicMessage(
    text: string,
    roomId = IRC_CHAT_PRODUCT_ROOM,
    options?: { replyToMessageId?: string },
  ): string | null {
    const trimmed = text.trim();
    if (!trimmed || !this.transport.connected) return null;

    const messageId = newMessageId();
    const nick = this.state.ircNick ?? "";
    const authorId =
      this.state.userId ??
      (this.auth.kind === "guest" ? this.auth.guest.visitorId : "");

    const replyToMessageId = parseOptionalReplyToMessageId(options?.replyToMessageId);

    const msg = {
      id: messageId,
      roomId,
      authorId,
      nick,
      text: trimmed,
      ts: Date.now(),
      pending: true,
      ...(replyToMessageId ? { replyToMessageId } : {}),
    };

    this.patchState({
      messages: receivePublicMessage(this.state.messages, roomId, msg),
    });

    if (!this.transport.sendPublic(roomId, messageId, trimmed, replyToMessageId)) {
      this.patchState({
        messages: markPublicMessageFailed(this.state.messages, roomId, messageId),
      });
      return null;
    }

    this.scheduleReactionHydration(roomId);
    return messageId;
  }

  toggleReaction(
    roomId: string,
    messageId: string,
    reactionType: IrcReactionType,
  ): { ok: true } | { ok: false; code: "AUTH_REQUIRED" | "TRANSPORT_ERROR" } {
    if (this.auth.kind !== "registered") {
      return { ok: false, code: "AUTH_REQUIRED" };
    }
    const room = roomId.trim();
    if (!room || !isValidMessageId(messageId) || !this.transport.connected) {
      return { ok: false, code: "TRANSPORT_ERROR" };
    }

    const roomReactions = this.state.reactions[room] ?? {};
    const previous = roomReactions[messageId];
    const optimistic = applyOptimisticReactionToggle(previous, reactionType);
    const pendingKey = `${room}|${messageId}|${reactionType}`;
    this.pendingReactionSnapshots.set(pendingKey, previous);

    this.patchState({
      reactions: {
        ...this.state.reactions,
        [room]: {
          ...roomReactions,
          [messageId]: optimistic,
        },
      },
    });

    if (!this.transport.sendReactionToggle(room, messageId, reactionType)) {
      this.pendingReactionSnapshots.delete(pendingKey);
      const revertedRoom = { ...roomReactions };
      if (previous) {
        revertedRoom[messageId] = previous;
      } else {
        delete revertedRoom[messageId];
      }
      this.patchState({
        reactions: {
          ...this.state.reactions,
          [room]: revertedRoom,
        },
      });
      return { ok: false, code: "TRANSPORT_ERROR" };
    }

    return { ok: true };
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
      this.resetPublicRoomSwitchState();
      this.patchState({
        status: "authenticated",
        statusDetail: detail,
        userId,
        ircNick,
        members: {},
      });
      this.joinRoom(IRC_CHAT_PRODUCT_ROOM);
      return;
    }

    if (status === "closed" || status === "error") {
      this.resetPublicRoomSwitchState();
      this.patchState({ status, statusDetail: detail, members: {} });
      return;
    }

    this.patchState({ status, statusDetail: detail });
  }

  private handleGatewayEvent(event: ParsedGatewayEvent): void {
    switch (event.kind) {
      case "error": {
        if (event.code === "REACTION_FAILED") {
          for (const key of [...this.pendingReactionSnapshots.keys()]) {
            const [roomFromKey, messageId] = key.split("|");
            if (!roomFromKey || !messageId) continue;
            this.handleReactionMutationError("REACTION_FAILED", messageId, roomFromKey);
          }
        }
        break;
      }
      case "room_joined": {
        this.handleRoomJoined(event.room);
        break;
      }
      case "room_parted": {
        this.handleRoomParted(event.room);
        break;
      }
      case "room_names": {
        const members = applyRoomNamesSnapshot(
          this.state.members[event.room] ?? [],
          event.members,
        );
        this.joinSoundSuppressedRooms.delete(event.room.trim());
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

        if (event.event.event === "join") {
          playJoinSoundEffect({
            room,
            activeSoundRoom: this.soundActiveRoom,
            joinNick: event.event.nick,
            selfNick: this.state.ircNick,
            suppressJoinSoundsForRoom: this.joinSoundSuppressedRooms.has(room.trim()),
            player: this.soundPlayer,
          });
        }

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
            ...(event.replyToMessageId
              ? { replyToMessageId: event.replyToMessageId }
              : {}),
          }),
        });
        this.scheduleReactionHydration(event.room);
        playPublicMessageSoundEffects({
          roomId: event.room,
          activeSoundRoom: this.soundActiveRoom,
          authorNick: event.nick,
          text: event.text,
          selfNick: this.state.ircNick,
          player: this.soundPlayer,
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
              ...(event.replyToMessageId
                ? { replyToMessageId: event.replyToMessageId }
                : {}),
            },
          ),
        });
        this.scheduleReactionHydration(event.room);
        break;
      }
      case "pm_message": {
        if (!this.incomingPmEnabled) {
          break;
        }
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
        playIncomingPmSoundEffect({
          incomingAccepted: true,
          player: this.soundPlayer,
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
      case "reaction_updated": {
        this.applyAuthoritativeReaction(event.room, event.messageId, event.reactions);
        break;
      }
      case "reaction_list": {
        this.applyReactionList(event.room, event.items);
        break;
      }
      default:
        break;
    }
  }

  private applyAuthoritativeReaction(
    room: string,
    messageId: string,
    reactions: import("./reactions").IrcMessageReactions,
  ): void {
    for (const key of this.pendingReactionSnapshots.keys()) {
      if (key.startsWith(`${room}|${messageId}|`)) {
        this.pendingReactionSnapshots.delete(key);
      }
    }
    const roomReactions = this.state.reactions[room] ?? {};
    this.patchState({
      reactions: {
        ...this.state.reactions,
        [room]: {
          ...roomReactions,
          [messageId]: mergeMessageReactions(roomReactions[messageId], reactions),
        },
      },
    });
  }

  private applyReactionList(
    room: string,
    items: Array<{ messageId: string; reactions: import("./reactions").IrcMessageReactions }>,
  ): void {
    if (!items.length) return;
    const roomReactions = { ...(this.state.reactions[room] ?? {}) };
    for (const item of items) {
      roomReactions[item.messageId] = mergeMessageReactions(
        roomReactions[item.messageId],
        item.reactions,
      );
    }
    this.patchState({
      reactions: {
        ...this.state.reactions,
        [room]: roomReactions,
      },
    });
  }

  private scheduleReactionHydration(roomId: string): void {
    const room = roomId.trim();
    if (!room || !this.transport.connected) return;
    if (this.reactionHydrateTimer) {
      clearTimeout(this.reactionHydrateTimer);
    }
    this.reactionHydrateTimer = setTimeout(() => {
      this.reactionHydrateTimer = null;
      const msgs = this.state.messages[room] ?? [];
      const ids = msgs.map((m) => m.id).slice(-IRC_REACTION_LIST_BATCH_MAX);
      if (ids.length) {
        this.transport.sendReactionList(room, ids);
      }
    }, 80);
  }

  private handleReactionMutationError(code: string, messageId?: string, roomId?: string): void {
    if (code !== "REACTION_FAILED" || !messageId || !roomId) return;
    const room = roomId.trim();
    const roomReactions = { ...(this.state.reactions[room] ?? {}) };
    let changed = false;
    for (const [key, snapshot] of this.pendingReactionSnapshots) {
      if (!key.startsWith(`${room}|${messageId}|`)) continue;
      this.pendingReactionSnapshots.delete(key);
      if (snapshot) {
        roomReactions[messageId] = snapshot;
      } else {
        delete roomReactions[messageId];
      }
      changed = true;
    }
    if (changed) {
      this.patchState({
        reactions: {
          ...this.state.reactions,
          [room]: roomReactions,
        },
      });
    }
  }

  private handleRoomJoined(room: string): void {
    const normalized = room.trim();
    if (!normalized) return;

    if (this.desiredPublicRoom && normalized !== this.desiredPublicRoom) {
      this.transport.part(normalized);
      return;
    }

    const previous = this.joinedPublicRoom;
    this.joinedPublicRoom = normalized;
    this.joinSoundSuppressedRooms.add(normalized);

    if (previous && previous !== normalized) {
      this.transport.part(previous);
      this.clearLiveMembersForRoom(previous);
    }

    this.scheduleReactionHydration(normalized);
  }

  private handleRoomParted(room: string): void {
    const normalized = room.trim();
    if (!normalized) return;
    this.clearLiveMembersForRoom(normalized);
    if (this.joinedPublicRoom === normalized) {
      this.joinedPublicRoom = null;
    }
  }

  private clearLiveMembersForRoom(roomId: string): void {
    if (!this.state.members[roomId]) return;
    const nextMembers = { ...this.state.members };
    delete nextMembers[roomId];
    this.patchState({ members: nextMembers });
  }

  private resetPublicRoomSwitchState(): void {
    this.joinedPublicRoom = null;
    this.desiredPublicRoom = null;
    this.presenceDedup.clear();
    this.joinSoundSuppressedRooms.clear();
  }

  private patchState(patch: Partial<IrcChatState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
