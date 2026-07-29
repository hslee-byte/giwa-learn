import { CheckIcon, ExternalLinkIcon } from "@radix-ui/react-icons"
import Link from "next/link"

import styles from "@/app/journey.module.css"
import { StatusChip } from "@/components/primitives"
import type { ClaimState, JourneyRecord } from "@/domain/journey"

export function MissingResult() {
  return (
    <section className={styles["resultPanel"]}>
      <h2>아직 제출된 퀴즈가 없습니다.</h2>
      <Link className={styles["ctaLink"]} href="/learn/giwa-basics">
        학습 시작
      </Link>
    </section>
  )
}

export function FailedResult({ record }: { readonly record: JourneyRecord }) {
  return (
    <section className={styles["resultPanel"]}>
      <StatusChip tone="warning">RETRY NEEDED</StatusChip>
      <div className={styles["score"]}>
        <strong>{record.result.score}</strong>
        <span>/ {record.result.total}</span>
      </div>
      <h2>한 번 더 보면 충분합니다.</h2>
      <p>4문제 이상 맞히면 Dojang 검증 단계가 열립니다.</p>
      <Link className={styles["ctaLink"]} href="/quiz/giwa-basics">
        퀴즈 다시 풀기
      </Link>
    </section>
  )
}

export function ProtocolPanel() {
  return (
    <aside className={styles["sidePanel"]}>
      <h2>보상 안전장치</h2>
      <ul className={styles["protocolList"]}>
        <li>
          <CheckIcon />
          <div>
            <strong>Live KYC check</strong>
            <span>청구 시 Dojang 재확인</span>
          </div>
        </li>
        <li>
          <CheckIcon />
          <div>
            <strong>Campaign-bound</strong>
            <span>EIP-712 서명 권한</span>
          </div>
        </li>
        <li>
          <CheckIcon />
          <div>
            <strong>One wallet, once</strong>
            <span>지갑당 캠페인 1회</span>
          </div>
        </li>
        <li>
          <CheckIcon />
          <div>
            <strong>Fixed budget</strong>
            <span>예치 보상 이상 지급 불가</span>
          </div>
        </li>
      </ul>
    </aside>
  )
}

export function TransactionSuccess({
  claim,
}: {
  readonly claim: Extract<ClaimState, { kind: "claimed" }>
}) {
  const shortHash = `${claim.txHash.slice(0, 10)}…${claim.txHash.slice(-8)}`
  return (
    <div className={styles["transactionRow"]} role="status">
      <div>
        <strong>10 gLEARN 청구 완료</strong>
        <span>{claim.mode === "demo" ? "DEMO TRANSACTION" : shortHash}</span>
      </div>
      {claim.mode === "live" ? (
        <a
          href={`https://sepolia-explorer.giwa.io/tx/${claim.txHash}`}
          rel="noreferrer"
          target="_blank"
        >
          Explorer <ExternalLinkIcon />
        </a>
      ) : (
        <StatusChip tone="verified">DEMO</StatusChip>
      )}
    </div>
  )
}
