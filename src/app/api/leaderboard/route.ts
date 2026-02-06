import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "all";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("pageSize") || "20"))
    );

    const where = {
      status: "completed",
      ...(mode !== "all" ? { mode } : {}),
    };

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        orderBy: { totalScore: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.game.count({ where }),
    ]);

    const entries = games.map((game, i) => ({
      rank: (page - 1) * pageSize + i + 1,
      userId: game.user.id,
      userName: game.user.name || game.user.email || "Anonymous",
      totalScore: game.totalScore,
      mode: game.mode,
      completedAt: game.completedAt?.toISOString() || "",
    }));

    return NextResponse.json({
      success: true,
      data: { entries, total, page, pageSize },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
