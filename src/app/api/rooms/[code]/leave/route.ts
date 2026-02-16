import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { leaveRoom } from "@/lib/game/room-service";

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
    const result = await leaveRoom(code.toUpperCase(), session.user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
