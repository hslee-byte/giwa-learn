"use client"

import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useSyncExternalStore } from "react"

import styles from "@/app/journey.module.css"
import { ActionButton, StatusChip } from "@/components/primitives"
import type { Campaign } from "@/domain/campaign"
import {
  completedLessonsSnapshot,
  emptyLessonsSnapshot,
  parseCompletedLessonsSnapshot,
  saveCompletedLessons,
  subscribeCompletedLessons,
} from "@/lib/journey-storage"

type LessonJourneyProps = {
  readonly lessons: Campaign["lessons"]
}

export function LessonJourney({ lessons }: LessonJourneyProps) {
  const snapshot = useSyncExternalStore(
    subscribeCompletedLessons,
    completedLessonsSnapshot,
    emptyLessonsSnapshot,
  )
  const completed = parseCompletedLessonsSnapshot(snapshot)
  const completedSet = new Set(completed)

  function toggleLesson(id: string): void {
    const next = completedSet.has(id)
      ? completed.filter((lessonId) => lessonId !== id)
      : [...completed, id]
    saveCompletedLessons(next)
  }

  const complete = lessons.every((lesson) => completedSet.has(lesson.id))

  return (
    <>
      <div className={styles["lessonGrid"]}>
        {lessons.map((lesson) => {
          const checked = completedSet.has(lesson.id)
          return (
            <article className={styles["lessonCard"]} key={lesson.id}>
              <p className="eyebrow">{lesson.eyebrow}</p>
              <h2>{lesson.title}</h2>
              <p>{lesson.body}</p>
              <ul className={styles["facts"]}>
                {lesson.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
              <div className={styles["cardFooter"]}>
                <a
                  className={styles["sourceLink"]}
                  href={lesson.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {lesson.sourceLabel}
                </a>
                <ActionButton
                  onClick={() => toggleLesson(lesson.id)}
                  variant={checked ? "verified" : "secondary"}
                >
                  {checked ? (
                    <>
                      <CheckIcon aria-hidden="true" /> 완료
                    </>
                  ) : (
                    "읽었어요"
                  )}
                </ActionButton>
              </div>
            </article>
          )
        })}
      </div>
      <div className={styles["footerAction"]}>
        <div>
          <StatusChip tone={complete ? "verified" : "neutral"}>
            {completed.length} / {lessons.length} COMPLETE
          </StatusChip>
          <p>
            {complete
              ? "학습 증명이 준비됐습니다. 이제 이해도를 확인합니다."
              : "각 카드를 읽고 완료해 주세요."}
          </p>
        </div>
        {complete ? (
          <Link className={styles["ctaLink"]} href="/quiz/giwa-basics">
            퀴즈 시작 <ArrowRightIcon aria-hidden="true" />
          </Link>
        ) : (
          <ActionButton disabled>퀴즈 잠김</ActionButton>
        )}
      </div>
    </>
  )
}
