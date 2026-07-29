"use client"

import {
  CheckCircledIcon,
  LightningBoltIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons"
import { useState } from "react"

import styles from "@/app/operator/operator.module.css"
import { ActionButton, MetricTile, StatusChip } from "@/components/primitives"
import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"

const PIPELINE = [
  { label: "콘텐츠", detail: "3개 카드 승인", status: "준비" },
  { label: "퀴즈", detail: "서버 채점", status: "운영 중" },
  { label: "Dojang", detail: "청구 시 재확인", status: "운영 중" },
  { label: "서명", detail: "15분 권한", status: "자동" },
  { label: "보상", detail: "지갑당 1회", status: "온체인" },
]

const RULES = [
  ["정답 비공개", "브라우저에는 질문과 선택지만 전달"],
  ["검증 지갑 한정", "공개 테스트는 GIWA Testnet Faucet, 실운영은 Upbit Korea 발급자를 조회"],
  ["예산 초과 방지", "컨트랙트에 예치된 수량만 지급 가능"],
  ["이중 청구 방지", "캠페인·지갑·일회용 번호를 모두 검사"],
]

export function OperatorConsole() {
  const [paused, setPaused] = useState(false)
  const campaign = GIWA_BASICS_CAMPAIGN

  return (
    <>
      <section className={styles["stateSummary"]} aria-label="현재 운영 상태">
        <div>
          <span>지금 할 일</span>
          <strong>{paused ? "캠페인 중지됨" : "지금 할 일 없음"}</strong>
          <small>
            {paused ? "검토 후 캠페인을 재개하세요." : "자동 집행이 정상 동작 중입니다."}
          </small>
        </div>
        <ActionButton onClick={() => setPaused(!paused)} variant={paused ? "verified" : "danger"}>
          {paused ? "캠페인 재개" : "긴급 중지"}
        </ActionButton>
      </section>

      <div className={styles["metricHeader"]}>
        <h2>시연용 캠페인 지표</h2>
        <span>실운영 시 컨트랙트 이벤트로 자동 집계</span>
      </div>
      <section className={styles["metrics"]} aria-label="시연용 캠페인 핵심 지표">
        <MetricTile
          detail="고유 검증 지갑"
          label="참여자"
          value={campaign.metrics.learners.toLocaleString()}
        />
        <MetricTile
          detail="학습 카드 3개"
          label="완료율"
          value={`${campaign.metrics.completionRate}%`}
        />
        <MetricTile
          detail={`${campaign.passScore} / ${campaign.questions.length} 이상`}
          label="합격률"
          value={`${campaign.metrics.passRate}%`}
        />
        <MetricTile
          detail={`${campaign.metrics.remainingRewards}명분 남음`}
          label="보상 청구"
          tone="warning"
          value={campaign.metrics.claims.toLocaleString()}
        />
      </section>

      <div className={styles["panelGrid"]}>
        <section className={styles["panel"]}>
          <div className={styles["panelHeader"]}>
            <h2>활성 캠페인</h2>
            <StatusChip tone={paused ? "warning" : "verified"}>
              {paused ? "중지" : "운영 중"}
            </StatusChip>
          </div>
          <div className={styles["campaignHeader"]}>
            <div>
              <h3>{campaign.title}</h3>
              <p>
                GIWA Basics · v{campaign.version} · {campaign.reward.amount}{" "}
                {campaign.reward.symbol} / 지갑
              </p>
            </div>
          </div>
          <ol className={styles["pipeline"]}>
            {PIPELINE.map((step, index) => (
              <li key={step.label}>
                <StatusChip tone={paused && index > 1 ? "warning" : "verified"}>
                  {paused && index > 1 ? "대기" : step.status}
                </StatusChip>
                <strong>{step.label}</strong>
                <span>{step.detail}</span>
              </li>
            ))}
          </ol>
          <div className={styles["budget"]}>
            <div className={styles["budgetHeader"]}>
              <div>
                <p>보상 풀 사용량</p>
                <strong>7,960 / 10,000 gLEARN</strong>
              </div>
              <StatusChip tone="warning">204명분 남음</StatusChip>
            </div>
            <div
              aria-label="보상 예산 사용량"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={79.6}
              className={styles["budgetBar"]}
              role="progressbar"
            >
              <span />
            </div>
          </div>
          <div className={styles["automation"]}>
            <AutomationRow
              detail="콘텐츠 승인 이후 자동 게시"
              icon="person"
              label="사람이 확인"
              status="승인 1회"
            />
            <AutomationRow
              detail="채점·검증·서명·청구"
              icon="bolt"
              label="자동 처리"
              status="4단계 자동"
            />
            <AutomationRow
              detail="컨트랙트 이벤트 기준 집계"
              icon="lock"
              label="감사 가능"
              status="온체인"
            />
          </div>
        </section>

        <aside className={styles["panel"]}>
          <div className={styles["panelHeader"]}>
            <h2>집행 규칙</h2>
            <StatusChip>컨트랙트 고정</StatusChip>
          </div>
          <ul className={styles["ruleList"]}>
            {RULES.map(([title, detail]) => (
              <li key={title}>
                <CheckCircledIcon />
                <div>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <p className={styles["notice"]}>
        <strong>운영 범위:</strong> 범용 SaaS가 아니라, 업비트/GIWA 내부 캠페인팀이 프로젝트 학습
        캠페인을 직접 발행·중지·감사하는 전용 콘솔입니다.
      </p>
    </>
  )
}

type AutomationRowProps = {
  readonly label: string
  readonly detail: string
  readonly status: string
  readonly icon: "person" | "bolt" | "lock"
}

function AutomationRow({ label, detail, status, icon }: AutomationRowProps) {
  return (
    <div className={styles["row"]}>
      <div>
        {iconFor(icon)}
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <StatusChip>{status}</StatusChip>
    </div>
  )
}

function iconFor(icon: AutomationRowProps["icon"]) {
  if (icon === "person") return <PersonIcon aria-hidden="true" />
  if (icon === "bolt") return <LightningBoltIcon aria-hidden="true" />
  return <LockClosedIcon aria-hidden="true" />
}
