import { z } from "zod";

export const createGameSchema = z.object({
  mode: z.enum(["classic", "timed", "no-move"]),
});

export const submitGuessSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timeSpent: z.number().int().min(0),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type SubmitGuessInput = z.infer<typeof submitGuessSchema>;
