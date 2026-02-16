import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { startGame } from "@/lib/game/room-service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await params;
    const result = await startGame(code.toUpperCase(), session.user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    const status =
      message === "Only the host can start the game" ? 403 :
      message === "Need at least 2 players" ? 400 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
