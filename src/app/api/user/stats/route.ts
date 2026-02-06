import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      highScore: true,
      totalGames: true,
      currentStreak: true,
      longestStreak: true,
      lastPlayedAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  // Calculate additional stats from completed games
  const gameStats = await prisma.game.aggregate({
    where: {
      userId: session.user.id,
      status: "completed",
    },
    _avg: { totalScore: true },
    _max: { totalScore: true },
    _count: { id: true },
  });

  // Get recent games
  const recentGames = await prisma.game.findMany({
    where: {
      userId: session.user.id,
      status: "completed",
    },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: {
      id: true,
      mode: true,
      totalScore: true,
      completedAt: true,
    },
  });

  // Get best scores by mode
  const bestByMode = await prisma.game.groupBy({
    by: ["mode"],
    where: {
      userId: session.user.id,
      status: "completed",
    },
    _max: { totalScore: true },
    _count: { id: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      highScore: user.highScore,
      totalGames: user.totalGames,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastPlayedAt: user.lastPlayedAt,
      memberSince: user.createdAt,
      averageScore: Math.round(gameStats._avg.totalScore || 0),
      completedGames: gameStats._count.id,
      recentGames,
      bestByMode: bestByMode.reduce((acc, item) => {
        acc[item.mode] = {
          highScore: item._max.totalScore || 0,
          gamesPlayed: item._count.id,
        };
        return acc;
      }, {} as Record<string, { highScore: number; gamesPlayed: number }>),
    },
  });
}
