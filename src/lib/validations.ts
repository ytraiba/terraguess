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

// Multiplayer room schemas
export const createRoomSchema = z.object({
  mode: z.enum(["classic", "no-move"]),
  timeLimit: z.number().int().min(30).max(180).optional().default(90),
});

export const joinRoomSchema = z.object({
  code: z.string().length(6).regex(/^[A-Z0-9]+$/),
});

export const submitRoomGuessSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timeSpent: z.number().int().min(0),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type SubmitRoomGuessInput = z.infer<typeof submitRoomGuessSchema>;
