import { z } from "zod"

const JourneyAnswerSchema = z.object({
  questionId: z.string().min(1),
  choiceId: z.string().min(1),
})

const QuizSummarySchema = z.object({
  kind: z.enum(["passed", "failed"]),
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
})

const ClaimStateSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("idle") }),
  z.object({ kind: z.literal("verifying") }),
  z.object({ kind: z.literal("ready"), mode: z.enum(["demo", "live"]) }),
  z.object({ kind: z.literal("claimed"), mode: z.enum(["demo", "live"]), txHash: z.string() }),
  z.object({ kind: z.literal("error"), message: z.string().min(1) }),
])

const JourneyRecordSchema = z.object({
  version: z.literal(1),
  answers: z.array(JourneyAnswerSchema).min(1),
  result: QuizSummarySchema,
  claim: ClaimStateSchema,
  completedAt: z.iso.datetime(),
})

export type JourneyAnswer = {
  readonly questionId: string
  readonly choiceId: string
}

export type QuizSummary = {
  readonly kind: "passed" | "failed"
  readonly score: number
  readonly total: number
}

export type ClaimState =
  | { readonly kind: "idle" }
  | { readonly kind: "verifying" }
  | { readonly kind: "ready"; readonly mode: "demo" | "live" }
  | {
      readonly kind: "claimed"
      readonly mode: "demo" | "live"
      readonly txHash: string
    }
  | { readonly kind: "error"; readonly message: string }

export type JourneyRecord = {
  readonly version: 1
  readonly answers: readonly JourneyAnswer[]
  readonly result: QuizSummary
  readonly claim: ClaimState
  readonly completedAt: string
}

type CreateJourneyInput = {
  readonly answers: readonly JourneyAnswer[]
  readonly result: QuizSummary
}

export function createJourneyRecord(input: CreateJourneyInput): JourneyRecord {
  const record: JourneyRecord = {
    version: 1,
    answers: input.answers,
    result: input.result,
    claim: { kind: "idle" },
    completedAt: new Date().toISOString(),
  }

  JourneyRecordSchema.parse(record)
  return record
}

export function parseJourneyRecord(raw: string): JourneyRecord | null {
  try {
    const decoded: unknown = JSON.parse(raw)
    const parsed = JourneyRecordSchema.safeParse(decoded)
    if (!parsed.success) {
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}
