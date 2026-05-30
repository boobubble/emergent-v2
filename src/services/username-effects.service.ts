import { notImplemented } from "./_shared";

export interface UsernameEffectsService {
  list(): Promise<unknown[]>;
  equip(effectId: string): Promise<void>;
}

export const usernameEffectsService: UsernameEffectsService = {
  list: () => notImplemented("username_effects", "list"),
  equip: () => notImplemented("username_effects", "equip"),
};
