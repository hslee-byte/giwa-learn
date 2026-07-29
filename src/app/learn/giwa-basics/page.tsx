import type { Metadata } from "next"
import Link from "next/link"

import styles from "@/app/journey.module.css"
import { LessonJourney } from "@/components/lesson-journey"
import { SiteHeader } from "@/components/site-header"
import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"

export const metadata: Metadata = { title: "GIWA 기초 학습" }

export default function LearnPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles["shell"]} id="main-content">
        <div className={styles["topline"]}>
          <Link className={styles["backLink"]} href="/">
            ← 캠페인으로
          </Link>
          <p className="eyebrow">STEP 01 / LEARN</p>
        </div>
        <section className={styles["intro"]}>
          <div>
            <p className="eyebrow">3 CARDS · ABOUT 2 MIN</p>
            <h1>
              GIWA를 알고
              <br />첫 트랜잭션까지.
            </h1>
          </div>
          <p>{"외워야 할 백서 대신, 실제로 보상을 받기 위해 필요한 세\u00a0가지만 익힙니다."}</p>
        </section>
        <LessonJourney lessons={GIWA_BASICS_CAMPAIGN.lessons} />
      </main>
    </>
  )
}
