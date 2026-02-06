export type GameMode = "classic" | "timed" | "no-move";
export type GameStatus = "in_progress" | "completed" | "abandoned";

export const GAME_MODE_CONFIG: Record<
  GameMode,
  {
    label: string;
    description: string;
    allowMovement: boolean;
    defaultTimeLimit: number | null;
  }
> = {
  classic: {
    label: "Classic",
    description: "Unlimited time. Move freely to explore.",
    allowMovement: true,
    defaultTimeLimit: null,
  },
  timed: {
    label: "Timed",
    description: "Race against the clock. 2 minutes per round.",
    allowMovement: true,
    defaultTimeLimit: 120,
  },
  "no-move": {
    label: "No Move",
    description: "Locked position. Use only what you can see.",
    allowMovement: false,
    defaultTimeLimit: null,
  },
};

export interface RoundClientData {
  roundNumber: number;
  imageId: string;
  provider: string;
  totalRounds: number;
  timeLimit: number | null;
}

export interface RoundResult {
  roundNumber: number;
  guessLat: number;
  guessLng: number;
  actualLat: number;
  actualLng: number;
  distance: number;
  score: number;
  timeSpent: number;
}

export interface GameResult {
  gameId: string;
  mode: GameMode;
  totalScore: number;
  maxPossibleScore: number;
  rounds: RoundResult[];
  completedAt: string;
}
