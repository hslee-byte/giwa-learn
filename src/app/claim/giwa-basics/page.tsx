import type { Metadata } from "next"
import Link from "next/link"

import styles from "@/app/journey.module.css"
import { ClaimJourney } from "@/components/claim-journey"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = { title: "검증과 보상" }

export default function ClaimPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles["shell"]} id="main-content">
        <div className={styles["topline"]}>
          <Link className={styles["backLink"]} href="/quiz/giwa-basics">
            ← 퀴즈로
          </Link>
          <p className="eyebrow">STEP 03 / VERIFY & CLAIM</p>
        </div>
        <section className={styles["intro"]}>
          <div>
            <p className="eyebrow">DOJANG + GIWA SEPOLIA</p>
            <h1>
              학습을 통과한 지갑만
              <br />
              보상받습니다.
            </h1>
          </div>
          <p>
            {
              "개인정보는 드러내지 않고 검증\u00a0상태만 확인한\u00a0뒤, 지갑당\u00a0한\u00a0번 보상합니다."
            }
          </p>
        </section>
        <ClaimJourney />
      </main>
    </>
  )
}
