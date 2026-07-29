import { NextResponse } from "next/server"

import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"
import { gradeQuiz } from "@/domain/quiz"

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { kind: "invalid", message: "답안 형식을 확인해 주세요." },
      { status: 400 },
    )
  }

  const result = gradeQuiz(GIWA_BASICS_CAMPAIGN, payload)
  if (result.kind === "invalid") {
    return NextResponse.json(
      { kind: "invalid", message: "모든 질문에 한 번씩 답해 주세요." },
      { status: 400 },
    )
  }

  return NextResponse.json({ kind: result.kind, score: result.score, total: result.total })
}
