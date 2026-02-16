import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRoomSchema } from "@/lib/validations";
import { createRoom } from "@/lib/game/room-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await createRoom(
      session.user.id,
      parsed.data.mode,
      parsed.data.timeLimit
    );
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
