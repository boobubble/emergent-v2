import { notImplemented } from "./_shared";

export interface TournamentCreateInput { name: string; gameType: string; startsAt: string; maxPlayers: number }
export interface TournamentsService {
  create(input: TournamentCreateInput): Promise<{ id: string }>;
  enter(tournamentId: string): Promise<void>;
  bracket(tournamentId: string): Promise<unknown>;
}

export const tournamentsService: TournamentsService = {
  create: () => notImplemented("tournaments", "create"),
  enter: () => notImplemented("tournaments", "enter"),
  bracket: () => notImplemented("tournaments", "bracket"),
};
