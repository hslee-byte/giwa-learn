"use client"

import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useState } from "react"

import styles from "@/app/journey.module.css"
import { ActionButton, QuizOption, type RailStep, VerificationRail } from "@/components/primitives"
import { QuizSubmitResponseSchema } from "@/domain/api"
import type { PublicQuizQuestion } from "@/domain/campaign"
import { createJourneyRecord, type JourneyAnswer } from "@/domain/journey"
import { saveJourney } from "@/lib/journey-storage"

type QuizFormProps = {
  readonly questions: readonly PublicQuizQuestion[]
  readonly passScore: number
}

const STEPS: readonly RailStep[] = [
  { label: "학습", detail: "3개 카드 완료", state: "complete" },
  { label: "퀴즈", detail: "이해도 확인", state: "current" },
  { label: "KYC 검증", detail: "Dojang 조회", state: "pending" },
  { label: "보상", detail: "지갑당 1회", state: "pending" },
]

export function QuizForm({ questions, passScore }: QuizFormProps) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Readonly<Record<string, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const question = questions[index]

  if (question === undefined) {
    return <p role="alert">퀴즈를 불러오지 못했습니다.</p>
  }

  const selected = answers[question.id]
  const isLast = index === questions.length - 1

  async function submitQuiz(): Promise<void> {
    setSubmitting(true)
    setError(null)
    const submitted: readonly JourneyAnswer[] = questions.map((item) => ({
      questionId: item.id,
      choiceId: answers[item.id] ?? "",
    }))

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submitted),
      })
      const payload: unknown = await response.json()
      const parsed = QuizSubmitResponseSchema.parse(payload)
      if (parsed.kind === "invalid") {
        setError(parsed.message)
        return
      }

      saveJourney(createJourneyRecord({ answers: submitted, result: parsed }))
      router.push("/claim/giwa-basics")
    } catch {
      setError("채점 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <VerificationRail steps={STEPS} />
      <div className={styles["quizLayout"]}>
        <section className={styles["quizCard"]} aria-live="polite">
          <span className={styles["questionCount"]}>
            QUESTION {index + 1} / {questions.length}
          </span>
          <h2>{question.prompt}</h2>
          <fieldset className={styles["options"]}>
            <legend className="sr-only">답을 하나 선택하세요</legend>
            {question.choices.map((choice) => (
              <QuizOption
                checked={selected === choice.id}
                key={choice.id}
                label={choice.label}
                name={question.id}
                onChange={() => setAnswers({ ...answers, [question.id]: choice.id })}
                value={choice.id}
              />
            ))}
          </fieldset>
          {error === null ? null : (
            <p className={styles["errorMessage"]} role="alert">
              {error}
            </p>
          )}
          <div className={styles["quizActions"]}>
            {index > 0 ? (
              <ActionButton onClick={() => setIndex(index - 1)} variant="secondary">
                <ArrowLeftIcon aria-hidden="true" /> 이전
              </ActionButton>
            ) : null}
            <ActionButton
              disabled={selected === undefined}
              loading={submitting}
              onClick={() => (isLast ? void submitQuiz() : setIndex(index + 1))}
            >
              {isLast ? "결과 확인" : "다음"} <ArrowRightIcon aria-hidden="true" />
            </ActionButton>
          </div>
        </section>
        <aside className={styles["sidePanel"]}>
          <h2>
            합격 기준 {passScore} / {questions.length}
          </h2>
          <p>정답은 서버에서만 채점됩니다. 틀려도 다시 도전할 수 있습니다.</p>
          <ul>
            <li>정답 데이터 브라우저 비노출</li>
            <li>지갑 연결 전 학습 가능</li>
            <li>합격 후에만 보상 권한 생성</li>
          </ul>
        </aside>
      </div>
    </>
  )
}
