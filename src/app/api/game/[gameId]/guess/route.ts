import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitGuessSchema } from "@/lib/validations";
import { submitGuess } from "@/lib/game/game-service";

export async function POST(
  req: Request,
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
    const body = await req.json();
    const parsed = submitGuessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await submitGuess(
      gameId,
      session.user.id,
      parsed.data.lat,
      parsed.data.lng,
      parsed.data.timeSpent
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
