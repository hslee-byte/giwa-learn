import type { Metadata } from "next"

import styles from "@/app/operator/operator.module.css"
import { OperatorConsole } from "@/components/operator-console"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = { title: "GIWA 운영 콘솔" }

export default function OperatorPage() {
  return (
    <>
      <SiteHeader operator />
      <main className={styles["shell"]} id="main-content">
        <section className={styles["hero"]}>
          <div>
            <p className={styles["sampleBadge"]}>GASOK PROTOTYPE · SAMPLE DATA</p>
            <p className="eyebrow">GIWA CAMPAIGN OPERATIONS</p>
            <h1>
              한 번 승인하고,
              <br />
              나머지는 자동으로.
            </h1>
          </div>
          <aside>
            <p>
              <strong>사람이 하는 일:</strong> 내용 승인, 예산 입력, 긴급 중지.
              <br />
              <strong>시스템이 하는 일:</strong> 채점, KYC 확인, 서명, 중복 차단, 보상, 집계.
            </p>
          </aside>
        </section>
        <OperatorConsole />
      </main>
    </>
  )
}
