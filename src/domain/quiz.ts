import { z } from "zod"

import type { Campaign } from "@/domain/campaign"

const AnswerSchema = z.object({
  questionId: z.string().min(1),
  choiceId: z.string().min(1),
})

const AnswersSchema = z.array(AnswerSchema)

type AnswerFeedback = {
  readonly questionId: string
  readonly correct: boolean
  readonly explanation: string
}

type InvalidReason = "schema" | "answer_count" | "duplicate_question" | "unknown_question"

export type GradeResult =
  | {
      readonly kind: "passed"
      readonly score: number
      readonly total: number
      readonly reason: null
      readonly feedback: readonly AnswerFeedback[]
    }
  | {
      readonly kind: "failed"
      readonly score: number
      readonly total: number
      readonly reason: null
      readonly feedback: readonly AnswerFeedback[]
    }
  | {
      readonly kind: "invalid"
      readonly score: 0
      readonly total: number
      readonly reason: InvalidReason
      readonly feedback: readonly []
    }

export function gradeQuiz(campaign: Campaign, rawAnswers: unknown): GradeResult {
  const parsed = AnswersSchema.safeParse(rawAnswers)
  const total = campaign.questions.length

  if (!parsed.success) {
    return { kind: "invalid", score: 0, total, reason: "schema", feedback: [] }
  }

  if (parsed.data.length !== total) {
    return { kind: "invalid", score: 0, total, reason: "answer_count", feedback: [] }
  }

  const uniqueQuestions = new Set(parsed.data.map((answer) => answer.questionId))
  if (uniqueQuestions.size !== parsed.data.length) {
    return { kind: "invalid", score: 0, total, reason: "duplicate_question", feedback: [] }
  }

  const questions = new Map(campaign.questions.map((question) => [question.id, question]))
  if (parsed.data.some((answer) => !questions.has(answer.questionId))) {
    return { kind: "invalid", score: 0, total, reason: "unknown_question", feedback: [] }
  }

  const feedback = parsed.data.map((answer): AnswerFeedback => {
    const question = questions.get(answer.questionId)
    if (question === undefined) {
      throw new Error(`Question disappeared while grading: ${answer.questionId}`)
    }

    return {
      questionId: answer.questionId,
      correct: answer.choiceId === question.correctChoiceId,
      explanation: question.explanation,
    }
  })
  const score = feedback.filter((item) => item.correct).length

  if (score >= campaign.passScore) {
    return { kind: "passed", score, total, reason: null, feedback }
  }

  return { kind: "failed", score, total, reason: null, feedback }
}
