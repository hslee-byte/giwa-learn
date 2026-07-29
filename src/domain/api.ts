import { z } from "zod"

export const QuizSubmitResponseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("passed"),
    score: z.number().int().nonnegative(),
    total: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("failed"),
    score: z.number().int().nonnegative(),
    total: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("invalid"),
    message: z.string().min(1),
  }),
])

export type QuizSubmitResponse = z.infer<typeof QuizSubmitResponseSchema>
