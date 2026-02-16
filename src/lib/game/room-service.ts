import { prisma } from "@/lib/db";
import { getImageryProvider } from "@/lib/imagery";
import { haversineDistance, calculateScore } from "@/lib/score";
import { GAME_MODE_CONFIG, type GameMode } from "@/types/game";

const ROUNDS_PER_GAME = 5;
const GRACE_PERIOD_SECONDS = 5;

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(
  hostId: string,
  mode: string,
  timeLimit: number = 90
) {
  // Generate unique code (retry on collision)
  let code: string;
  let attempts = 0;
  do {
    code = generateRoomCode();
    const existing = await prisma.gameRoom.findUnique({ where: { code } });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) throw new Error("Could not generate unique room code");

  const room = await prisma.gameRoom.create({
    data: {
      code,
      hostId,
      mode,
      timeLimit,
      status: "waiting",
      currentRound: 0,
      players: {
        create: { userId: hostId },
      },
    },
    include: {
      players: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
    },
  });

  return { roomId: room.id, code: room.code };
}

export async function joinRoom(code: string, userId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { code },
    include: { players: true },
  });

  if (!room) throw new Error("Room not found");
  if (room.status !== "waiting") throw new Error("Game already started");
  if (room.players.length >= room.maxPlayers) throw new Error("Room is full");

  const alreadyIn = room.players.some((p) => p.userId === userId);
  if (alreadyIn) return { roomId: room.id, code: room.code };

  await prisma.playerInRoom.create({
    data: { roomId: room.id, userId },
  });

  return { roomId: room.id, code: room.code };
}

export async function leaveRoom(code: string, userId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { code },
    include: { players: true },
  });

  if (!room) throw new Error("Room not found");
  if (room.status === "playing") throw new Error("Cannot leave during a game");

  const player = room.players.find((p) => p.userId === userId);
  if (!player) throw new Error("Not in this room");

  await prisma.playerInRoom.delete({ where: { id: player.id } });

  // If host leaves, transfer to next player or delete room
  if (room.hostId === userId) {
    const remaining = room.players.filter((p) => p.userId !== userId);
    if (remaining.length === 0) {
      await prisma.gameRoom.delete({ where: { id: room.id } });
      return { deleted: true };
    }
    await prisma.gameRoom.update({
      where: { id: room.id },
      data: { hostId: remaining[0].userId },
    });
  }

  return { deleted: false };
}

export async function startGame(code: string, userId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { code },
    include: { players: true },
  });

  if (!room) throw new Error("Room not found");
  if (room.hostId !== userId) throw new Error("Only the host can start the game");
  if (room.status !== "waiting") throw new Error("Game already started");
  if (room.players.length < 2) throw new Error("Need at least 2 players");

  // Get 5 random locations
  const provider = getImageryProvider("mapillary");
  const locations = await provider.getRandomLocations(ROUNDS_PER_GAME);

  if (locations.length < ROUNDS_PER_GAME) {
    throw new Error("Not enough locations available");
  }

  const now = new Date();

  await prisma.gameRoom.update({
    where: { id: room.id },
    data: {
      status: "playing",
      currentRound: 1,
      roundStartedAt: now,
      rounds: {
        create: locations.map((loc, i) => ({
          roundNumber: i + 1,
          actualLat: loc.lat,
          actualLng: loc.lng,
          imageId: loc.imageId,
        })),
      },
    },
  });

  return { started: true };
}

export async function submitRoomGuess(
  code: string,
  userId: string,
  guessLat: number,
  guessLng: number,
  timeSpent: number
) {
  const room = await prisma.gameRoom.findUnique({
    where: { code },
    include: {
      players: { include: { guesses: true } },
      rounds: { orderBy: { roundNumber: "asc" } },
    },
  });

  if (!room) throw new Error("Room not found");
  if (room.status !== "playing") throw new Error("Game is not in progress");

  const player = room.players.find((p) => p.userId === userId);
  if (!player) throw new Error("Not in this room");

  const currentRound = room.rounds.find((r) => r.roundNumber === room.currentRound);
  if (!currentRound) throw new Error("Round not found");

  // Check if already guessed this round
  const existingGuess = player.guesses.find((g) => g.roundId === currentRound.id);
  if (existingGuess) throw new Error("Already guessed this round");

  // Check server-side timer enforcement
  if (room.roundStartedAt) {
    const elapsed = (Date.now() - room.roundStartedAt.getTime()) / 1000;
    if (elapsed > room.timeLimit + GRACE_PERIOD_SECONDS) {
      throw new Error("Time expired for this round");
    }
  }

  const distance = haversineDistance(
    currentRound.actualLat,
    currentRound.actualLng,
    guessLat,
    guessLng
  );
  const score = calculateScore(distance);

  await prisma.roomGuess.create({
    data: {
      roundId: currentRound.id,
      playerId: player.id,
      guessLat,
      guessLng,
      distance,
      score,
      timeSpent,
    },
  });

  // Update player's total score
  await prisma.playerInRoom.update({
    where: { id: player.id },
    data: { totalScore: player.totalScore + score },
  });

  // Check if all players have guessed
  const totalPlayers = room.players.length;
  const guessesThisRound = await prisma.roomGuess.count({
    where: { roundId: currentRound.id },
  });

  if (guessesThisRound >= totalPlayers) {
    await advanceRound(room.id);
  }

  return { score, distance };
}

async function advanceRound(roomId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) return;

  if (room.currentRound >= ROUNDS_PER_GAME) {
    await prisma.gameRoom.update({
      where: { id: roomId },
      data: { status: "finished", roundStartedAt: null },
    });
  } else {
    await prisma.gameRoom.update({
      where: { id: roomId },
      data: {
        currentRound: room.currentRound + 1,
        roundStartedAt: new Date(),
      },
    });
  }
}

export async function getRoomState(code: string, userId: string) {
  const room = await prisma.gameRoom.findUnique({
    where: { code },
    include: {
      players: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          guesses: true,
        },
      },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: { guesses: { include: { player: { include: { user: { select: { name: true, email: true } } } } } } },
      },
    },
  });

  if (!room) throw new Error("Room not found");

  // Check if player is in this room
  const isInRoom = room.players.some((p) => p.userId === userId);
  if (!isInRoom) throw new Error("Not in this room");

  const currentRound = room.rounds.find((r) => r.roundNumber === room.currentRound);

  // Server-side timer expiry check: force-advance if time is up
  if (
    room.status === "playing" &&
    room.roundStartedAt &&
    currentRound
  ) {
    const elapsed = (Date.now() - room.roundStartedAt.getTime()) / 1000;
    if (elapsed > room.timeLimit + GRACE_PERIOD_SECONDS) {
      // Fill 0-score for players who didn't guess
      const playersWhoGuessed = new Set(
        currentRound.guesses.map((g) => g.playerId)
      );
      const missedPlayers = room.players.filter(
        (p) => !playersWhoGuessed.has(p.id)
      );

      for (const mp of missedPlayers) {
        await prisma.roomGuess.create({
          data: {
            roundId: currentRound.id,
            playerId: mp.id,
            guessLat: 0,
            guessLng: 0,
            distance: -1,
            score: 0,
            timeSpent: room.timeLimit,
          },
        });
      }

      await advanceRound(room.id);

      // Re-fetch after advancing
      return getRoomState(code, userId);
    }
  }

  // Determine if all players have guessed the current round
  const allGuessed =
    currentRound && room.status === "playing"
      ? currentRound.guesses.length >= room.players.length
      : false;

  // Build previous round result (if current round just started or all guessed previous)
  let roundResult = null;
  const prevRoundNum = allGuessed ? room.currentRound : room.currentRound - 1;
  const prevRound = prevRoundNum > 0
    ? room.rounds.find((r) => r.roundNumber === prevRoundNum)
    : null;

  if (prevRound && prevRound.guesses.length > 0) {
    // Only show round result if all players have guessed that round
    if (prevRound.guesses.length >= room.players.length) {
      roundResult = {
        roundNumber: prevRound.roundNumber,
        actualLat: prevRound.actualLat,
        actualLng: prevRound.actualLng,
        guesses: prevRound.guesses.map((g) => ({
          playerName: g.player.user.name || g.player.user.email || "Anonymous",
          guessLat: g.guessLat,
          guessLng: g.guessLng,
          distance: g.distance,
          score: g.score,
        })),
      };
    }
  }

  // Build response
  const players = room.players.map((p) => ({
    id: p.id,
    userId: p.user.id,
    name: p.user.name || p.user.email || "Anonymous",
    image: p.user.image,
    totalScore: p.totalScore,
    hasGuessedCurrentRound: currentRound
      ? p.guesses.some((g) => g.roundId === currentRound.id)
      : false,
  }));

  const allowMovement = room.mode === "classic" || room.mode === "timed";

  const response: RoomPollResponse = {
    status: room.status as "waiting" | "playing" | "finished",
    mode: room.mode,
    code: room.code,
    hostId: room.hostId,
    players,
    currentRound: room.currentRound,
    roundStartedAt: room.roundStartedAt?.toISOString() || null,
    timeLimit: room.timeLimit,
    maxPlayers: room.maxPlayers,
    allowMovement,
  };

  // Include current round data when playing and not all guessed yet
  if (room.status === "playing" && currentRound && !allGuessed) {
    response.round = {
      roundNumber: currentRound.roundNumber,
      imageId: currentRound.imageId,
      totalRounds: ROUNDS_PER_GAME,
    };
  }

  // Include round result when all have guessed
  if (allGuessed && roundResult) {
    response.roundResult = roundResult;
  }

  // For finished games, include all round results
  if (room.status === "finished") {
    response.allRoundResults = room.rounds
      .filter((r) => r.guesses.length > 0)
      .map((r) => ({
        roundNumber: r.roundNumber,
        actualLat: r.actualLat,
        actualLng: r.actualLng,
        guesses: r.guesses.map((g) => ({
          playerName: g.player.user.name || g.player.user.email || "Anonymous",
          guessLat: g.guessLat,
          guessLng: g.guessLng,
          distance: g.distance,
          score: g.score,
        })),
      }));
  }

  return response;
}

// Types for poll response
export interface RoomPlayerGuess {
  playerName: string;
  guessLat: number;
  guessLng: number;
  distance: number;
  score: number;
}

export interface RoomRoundResult {
  roundNumber: number;
  actualLat: number;
  actualLng: number;
  guesses: RoomPlayerGuess[];
}

export interface RoomPollPlayer {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  totalScore: number;
  hasGuessedCurrentRound: boolean;
}

export interface RoomPollResponse {
  status: "waiting" | "playing" | "finished";
  mode: string;
  code: string;
  hostId: string;
  players: RoomPollPlayer[];
  currentRound: number;
  roundStartedAt: string | null;
  timeLimit: number;
  maxPlayers: number;
  allowMovement: boolean;
  round?: {
    roundNumber: number;
    imageId: string;
    totalRounds: number;
  };
  roundResult?: RoomRoundResult;
  allRoundResults?: RoomRoundResult[];
}
