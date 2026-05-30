import { notImplemented } from "./_shared";

export interface ClanCreateInput { name: string; tag: string; description?: string }
export interface ClansService {
  create(input: ClanCreateInput): Promise<{ id: string }>;
  join(clanId: string): Promise<void>;
  leave(clanId: string): Promise<void>;
  list(query?: string): Promise<unknown[]>;
}

export const clansService: ClansService = {
  create: () => notImplemented("clans", "create"),
  join: () => notImplemented("clans", "join"),
  leave: () => notImplemented("clans", "leave"),
  list: () => notImplemented("clans", "list"),
};
