import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitRoomGuessSchema } from "@/lib/validations";
import { submitRoomGuess } from "@/lib/game/room-service";

export async function POST(
  req: Request,
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

    const body = await req.json();
    const parsed = submitRoomGuessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code } = await params;
    const result = await submitRoomGuess(
      code.toUpperCase(),
      session.user.id,
      parsed.data.lat,
      parsed.data.lng,
      parsed.data.timeSpent
    );
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    const status =
      message === "Already guessed this round" ? 409 :
      message === "Time expired for this round" ? 410 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
