import { notImplemented } from "./_shared";

export interface VoiceRoomsService {
  open(channelId: string): Promise<{ roomId: string; token: string }>;
  close(roomId: string): Promise<void>;
  join(roomId: string): Promise<{ token: string }>;
  leave(roomId: string): Promise<void>;
}

export const voiceRoomsService: VoiceRoomsService = {
  open: () => notImplemented("voice_rooms", "open"),
  close: () => notImplemented("voice_rooms", "close"),
  join: () => notImplemented("voice_rooms", "join"),
  leave: () => notImplemented("voice_rooms", "leave"),
};
