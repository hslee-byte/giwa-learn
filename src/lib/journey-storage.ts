import { type JourneyRecord, parseJourneyRecord } from "@/domain/journey"

const JOURNEY_KEY = "giwa-learn:journey:v1"
const LESSON_KEY = "giwa-learn:lessons:v1"
const lessonSubscribers = new Set<() => void>()

export function saveJourney(record: JourneyRecord): void {
  window.sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(record))
}

export function loadJourney(): JourneyRecord | null {
  const raw = window.sessionStorage.getItem(JOURNEY_KEY)
  return raw === null ? null : parseJourneyRecord(raw)
}

export function saveCompletedLessons(ids: readonly string[]): void {
  window.sessionStorage.setItem(LESSON_KEY, JSON.stringify(ids))
  for (const subscriber of lessonSubscribers) {
    subscriber()
  }
}

export function completedLessonsSnapshot(): string {
  return window.sessionStorage.getItem(LESSON_KEY) ?? "[]"
}

export function emptyLessonsSnapshot(): string {
  return "[]"
}

export function subscribeCompletedLessons(subscriber: () => void): () => void {
  lessonSubscribers.add(subscriber)
  return () => lessonSubscribers.delete(subscriber)
}

export function parseCompletedLessonsSnapshot(raw: string): readonly string[] {
  try {
    const decoded: unknown = JSON.parse(raw)
    if (!Array.isArray(decoded) || decoded.some((value) => typeof value !== "string")) {
      return []
    }
    return decoded.filter((value): value is string => typeof value === "string")
  } catch {
    return []
  }
}
