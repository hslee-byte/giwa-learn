import type { Metadata } from "next"
import Link from "next/link"

import styles from "@/app/journey.module.css"
import { QuizForm } from "@/components/quiz-form"
import { SiteHeader } from "@/components/site-header"
import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"
import { toPublicCampaign } from "@/domain/campaign"

export const metadata: Metadata = { title: "GIWA 이해도 퀴즈" }

export default function QuizPage() {
  const campaign = toPublicCampaign(GIWA_BASICS_CAMPAIGN)
  return (
    <>
      <SiteHeader />
      <main className={styles["shell"]} id="main-content">
        <div className={styles["topline"]}>
          <Link className={styles["backLink"]} href="/learn/giwa-basics">
            ← 학습으로
          </Link>
          <p className="eyebrow">STEP 02 / PROVE KNOWLEDGE</p>
        </div>
        <section className={styles["intro"]}>
          <div>
            <p className="eyebrow">5 QUESTIONS · ABOUT 1 MIN</p>
            <h1>
              클릭이 아니라
              <br />
              학습 내용을 확인하세요.
            </h1>
          </div>
          <p>{"지갑을 연결하기 전에 승인된 핵심\u00a0내용을 학습했는지 먼저\u00a0확인합니다."}</p>
        </section>
        <QuizForm passScore={campaign.passScore} questions={campaign.questions} />
      </main>
    </>
  )
}
