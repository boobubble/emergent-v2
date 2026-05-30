import { notImplemented } from "./_shared";

export interface AvatarFramesService {
  list(): Promise<unknown[]>;
  equip(frameId: string): Promise<void>;
}

export const avatarFramesService: AvatarFramesService = {
  list: () => notImplemented("avatar_frames", "list"),
  equip: () => notImplemented("avatar_frames", "equip"),
};
