import { prisma } from "@/lib/db";
import { getImageryProvider } from "@/lib/imagery";
import { haversineDistance, calculateScore } from "@/lib/score";
import { GAME_MODE_CONFIG, type GameMode, type RoundClientData } from "@/types/game";

const ROUNDS_PER_GAME = 5;

export async function createGame(userId: string, mode: GameMode) {
  const provider = getImageryProvider("mapillary");
  const locations = await provider.getRandomLocations(ROUNDS_PER_GAME);

  if (locations.length < ROUNDS_PER_GAME) {
    throw new Error("Not enough locations available");
  }

  const game = await prisma.game.create({
    data: {
      userId,
      mode,
      status: "in_progress",
      currentRound: 1,
      rounds: {
        create: locations.map((loc, i) => ({
          roundNumber: i + 1,
          actualLat: loc.lat,
          actualLng: loc.lng,
          imageId: loc.imageId,
        })),
      },
    },
    include: { rounds: true },
  });

  const firstRound = game.rounds.find((r) => r.roundNumber === 1)!;
  const config = GAME_MODE_CONFIG[mode];

  const roundData: RoundClientData = {
    roundNumber: 1,
    imageId: firstRound.imageId,
    provider: "mapillary",
    totalRounds: ROUNDS_PER_GAME,
    timeLimit: config.defaultTimeLimit,
  };

  return { gameId: game.id, mode, firstRound: roundData };
}

export async function getCurrentRound(gameId: string, userId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { rounds: true },
  });

  if (!game) throw new Error("Game not found");
  if (game.userId !== userId) throw new Error("Not your game");
  if (game.status !== "in_progress") throw new Error("Game is not in progress");

  const round = game.rounds.find((r) => r.roundNumber === game.currentRound);
  if (!round) throw new Error("Round not found");

  const config = GAME_MODE_CONFIG[game.mode as GameMode];

  const roundData: RoundClientData = {
    roundNumber: round.roundNumber,
    imageId: round.imageId,
    provider: "mapillary",
    totalRounds: ROUNDS_PER_GAME,
    timeLimit: config.defaultTimeLimit,
  };

  return roundData;
}

export async function submitGuess(
  gameId: string,
  userId: string,
  guessLat: number,
  guessLng: number,
  timeSpent: number
) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { rounds: { orderBy: { roundNumber: "asc" } } },
  });

  if (!game) throw new Error("Game not found");
  if (game.userId !== userId) throw new Error("Not your game");
  if (game.status !== "in_progress") throw new Error("Game is not in progress");

  const round = game.rounds.find((r) => r.roundNumber === game.currentRound);
  if (!round) throw new Error("Round not found");
  if (round.guessLat !== null) throw new Error("Already guessed this round");

  const distance = haversineDistance(
    round.actualLat,
    round.actualLng,
    guessLat,
    guessLng
  );
  const score = calculateScore(distance);

  await prisma.round.update({
    where: { id: round.id },
    data: {
      guessLat,
      guessLng,
      distance,
      score,
      timeSpent,
      guessedAt: new Date(),
    },
  });

  const newTotalScore = game.totalScore + score;
  const isLastRound = game.currentRound >= ROUNDS_PER_GAME;

  if (isLastRound) {
    const now = new Date();

    await prisma.game.update({
      where: { id: gameId },
      data: {
        totalScore: newTotalScore,
        status: "completed",
        completedAt: now,
      },
    });

    // Update user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { highScore: true, currentStreak: true, longestStreak: true, lastPlayedAt: true, totalGames: true },
    });

    if (user) {
      // Check if streak continues (played within 48 hours) or resets
      const hoursAgo = user.lastPlayedAt
        ? (now.getTime() - user.lastPlayedAt.getTime()) / (1000 * 60 * 60)
        : Infinity;

      const newStreak = hoursAgo <= 48 ? user.currentStreak + 1 : 1;
      const newLongestStreak = Math.max(newStreak, user.longestStreak);

      await prisma.user.update({
        where: { id: userId },
        data: {
          highScore: Math.max(user.highScore, newTotalScore),
          totalGames: user.totalGames + 1,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastPlayedAt: now,
        },
      });
    }

    return {
      roundResult: {
        roundNumber: round.roundNumber,
        guessLat,
        guessLng,
        actualLat: round.actualLat,
        actualLng: round.actualLng,
        distance,
        score,
        timeSpent,
      },
      nextRound: null,
      gameComplete: true,
      totalScore: newTotalScore,
    };
  }

  const nextRoundNumber = game.currentRound + 1;
  await prisma.game.update({
    where: { id: gameId },
    data: {
      totalScore: newTotalScore,
      currentRound: nextRoundNumber,
    },
  });

  const nextRound = game.rounds.find((r) => r.roundNumber === nextRoundNumber)!;
  const config = GAME_MODE_CONFIG[game.mode as GameMode];

  return {
    roundResult: {
      roundNumber: round.roundNumber,
      guessLat,
      guessLng,
      actualLat: round.actualLat,
      actualLng: round.actualLng,
      distance,
      score,
      timeSpent,
    },
    nextRound: {
      roundNumber: nextRound.roundNumber,
      imageId: nextRound.imageId,
      provider: "mapillary",
      totalRounds: ROUNDS_PER_GAME,
      timeLimit: config.defaultTimeLimit,
    } as RoundClientData,
    gameComplete: false,
    totalScore: newTotalScore,
  };
}

export async function getGameResults(gameId: string, userId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { rounds: { orderBy: { roundNumber: "asc" } } },
  });

  if (!game) throw new Error("Game not found");
  if (game.userId !== userId) throw new Error("Not your game");
  if (game.status !== "completed") throw new Error("Game is not completed");

  return {
    gameId: game.id,
    mode: game.mode as GameMode,
    totalScore: game.totalScore,
    maxPossibleScore: ROUNDS_PER_GAME * 5000,
    rounds: game.rounds.map((r) => ({
      roundNumber: r.roundNumber,
      guessLat: r.guessLat!,
      guessLng: r.guessLng!,
      actualLat: r.actualLat,
      actualLng: r.actualLng,
      distance: r.distance!,
      score: r.score!,
      timeSpent: r.timeSpent || 0,
    })),
    completedAt: game.completedAt?.toISOString() || "",
  };
}
