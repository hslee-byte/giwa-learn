import { describe, expect, it } from "vitest"

import { createJourneyRecord, type JourneyRecord, parseJourneyRecord } from "@/domain/journey"

const ANSWERS = [
  { questionId: "giwa-kind", choiceId: "ethereum-l2" },
  { questionId: "block-time", choiceId: "one-second" },
]

describe("journey record", () => {
  it("round-trips a passed quiz without losing the submitted answers", () => {
    const record = createJourneyRecord({
      answers: ANSWERS,
      result: { kind: "passed", score: 5, total: 5 },
    })

    expect(parseJourneyRecord(JSON.stringify(record))).toEqual(record)
  })

  it("rejects corrupt browser storage", () => {
    expect(parseJourneyRecord("not-json")).toBeNull()
    expect(parseJourneyRecord('{"result":{"kind":"passed"}}')).toBeNull()
  })

  it("keeps claim state explicit", () => {
    const record: JourneyRecord = createJourneyRecord({
      answers: ANSWERS,
      result: { kind: "failed", score: 2, total: 5 },
    })

    expect(record.claim).toEqual({ kind: "idle" })
  })
})
