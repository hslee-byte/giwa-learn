import { describe, expect, it } from "vitest"

import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"
import { gradeQuiz } from "@/domain/quiz"

const passingAnswers = [
  { questionId: "giwa-kind", choiceId: "ethereum-l2" },
  { questionId: "block-time", choiceId: "one-second" },
  { questionId: "verified-address", choiceId: "kyc-status" },
  { questionId: "dojang-purpose", choiceId: "verified-claim" },
  { questionId: "gas-asset", choiceId: "btc" },
]

describe("gradeQuiz", () => {
  it("passes a learner with four correct answers out of five", () => {
    const result = gradeQuiz(GIWA_BASICS_CAMPAIGN, passingAnswers)

    expect(result.kind).toBe("passed")
    expect(result.score).toBe(4)
    expect(result.total).toBe(5)
  })

  it("fails a learner below the campaign pass score", () => {
    const result = gradeQuiz(
      GIWA_BASICS_CAMPAIGN,
      passingAnswers.map((answer) => ({ ...answer, choiceId: "wrong" })),
    )

    expect(result.kind).toBe("failed")
    expect(result.score).toBe(0)
  })

  it("rejects submissions with a missing question", () => {
    const result = gradeQuiz(GIWA_BASICS_CAMPAIGN, passingAnswers.slice(0, 4))

    expect(result.kind).toBe("invalid")
    expect(result.reason).toBe("answer_count")
  })

  it("rejects duplicate answers for one question", () => {
    const first = passingAnswers[0]
    if (first === undefined) {
      throw new Error("quiz fixture is empty")
    }

    const result = gradeQuiz(GIWA_BASICS_CAMPAIGN, [first, first, ...passingAnswers.slice(2)])

    expect(result.kind).toBe("invalid")
    expect(result.reason).toBe("duplicate_question")
  })
})
