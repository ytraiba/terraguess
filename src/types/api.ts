import type { GameMode, RoundClientData, RoundResult } from "./game";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateGameResponse {
  gameId: string;
  mode: GameMode;
  firstRound: RoundClientData;
}

export interface SubmitGuessResponse {
  roundResult: RoundResult;
  nextRound: RoundClientData | null;
  gameComplete: boolean;
  totalScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalScore: number;
  mode: GameMode;
  completedAt: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  pageSize: number;
}
