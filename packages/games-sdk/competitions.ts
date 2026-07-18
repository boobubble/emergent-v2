import type { Paginated, SDKResult } from "./types";

export interface CompetitionSummary {
  id: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  joined?: boolean;
}

export interface CompetitionsAdapter {
  listCompetitions(): Promise<SDKResult<Paginated<CompetitionSummary>>>;
  joinCompetition(competitionId: string): Promise<SDKResult<void>>;
  leaveCompetition(competitionId: string): Promise<SDKResult<void>>;
}
