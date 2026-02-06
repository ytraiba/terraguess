import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGameResults } from "@/lib/game/game-service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { gameId } = await params;
    const result = await getGameResults(gameId, session.user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    const status = message.includes("not found") ? 404 : message.includes("Not your") ? 403 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
