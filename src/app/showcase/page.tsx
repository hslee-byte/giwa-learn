import styles from "@/app/showcase/showcase.module.css"
import {
  ActionButton,
  FormField,
  MetricTile,
  QuizOption,
  type RailStep,
  StatusChip,
  VerificationRail,
} from "@/components/primitives"

const RAIL_STEPS: readonly RailStep[] = [
  { label: "학습", detail: "3개 카드 완료", state: "complete" },
  { label: "퀴즈", detail: "현재 3 / 5", state: "current" },
  { label: "KYC 검증", detail: "Dojang 대기", state: "pending" },
  { label: "보상", detail: "검증 후 가능", state: "blocked" },
]

export default function ShowcasePage() {
  return (
    <main className="page-shell" id="main-content">
      <header className={styles["header"]}>
        <div>
          <p className="eyebrow">GIWA LEARN / PRIMITIVE SHOWCASE</p>
          <h1 className="display-text">Verify every step.</h1>
        </div>
        <p>
          GIWA가 운영하는 학습 캠페인의 핵심 상태를 동일한 시각 언어와 접근성 규칙으로 검증하는 내부
          화면입니다.
        </p>
      </header>

      <ShowcaseSection label="01 / ACTION" title="Buttons">
        <div className={styles["buttonRow"]}>
          <ActionButton>학습 시작</ActionButton>
          <ActionButton variant="secondary">캠페인 미리보기</ActionButton>
          <ActionButton variant="verified">보상 받기</ActionButton>
          <ActionButton variant="danger">캠페인 종료</ActionButton>
          <ActionButton disabled>참여 불가</ActionButton>
          <ActionButton loading>검증 중</ActionButton>
        </div>
      </ShowcaseSection>

      <ShowcaseSection label="02 / STATUS" title="Chips">
        <div className={styles["chipRow"]}>
          <StatusChip>GIWA SEPOLIA</StatusChip>
          <StatusChip tone="verified">VERIFIED</StatusChip>
          <StatusChip tone="warning">BUDGET LOW</StatusChip>
          <StatusChip tone="error">NOT VERIFIED</StatusChip>
        </div>
      </ShowcaseSection>

      <ShowcaseSection label="03 / PROGRESS" title="Verification rail">
        <VerificationRail steps={RAIL_STEPS} />
      </ShowcaseSection>

      <ShowcaseSection label="04 / QUIZ" title="Answer states">
        <fieldset className={styles["optionStack"]}>
          <legend className="sr-only">GIWA 체인 종류</legend>
          <QuizOption label="OP Stack 기반 Ethereum Layer 2" name="showcase" value="l2" />
          <QuizOption checked label="Ethereum Mainnet" name="showcase" value="mainnet" />
          <QuizOption checked disabled label="선택 잠김" name="disabled" value="locked" />
          <QuizOption
            checked
            disabled
            label="정답"
            name="correct"
            result="correct"
            value="correct"
          />
          <QuizOption
            checked
            disabled
            label="오답"
            name="incorrect"
            result="incorrect"
            value="incorrect"
          />
        </fieldset>
      </ShowcaseSection>

      <ShowcaseSection label="05 / METRICS" title="Operator metrics">
        <div className={styles["metrics"]}>
          <MetricTile detail="고유 검증 지갑" label="참여자" value="1,284" />
          <MetricTile detail="학습 카드 3개" label="완료율" value="71%" />
          <MetricTile detail="4 / 5 이상" label="합격률" value="62%" />
          <MetricTile detail="204명분 남음" label="잔여 보상" tone="warning" value="2,040" />
        </div>
      </ShowcaseSection>

      <ShowcaseSection label="06 / INPUT" title="Form fields">
        <div className={styles["fields"]}>
          <FormField
            defaultValue="3분 만에 GIWA 배우기"
            helper="사용자에게 보이는 캠페인 이름"
            id="campaign-title"
            label="캠페인 이름"
          />
          <FormField
            error="보상 단가는 1 이상이어야 합니다."
            helper="지갑당 지급량"
            id="reward-amount"
            label="보상 단가"
            readOnly
            value="0"
          />
        </div>
      </ShowcaseSection>
    </main>
  )
}

type ShowcaseSectionProps = {
  readonly label: string
  readonly title: string
  readonly children: React.ReactNode
}

function ShowcaseSection({ label, title, children }: ShowcaseSectionProps) {
  return (
    <section className={styles["section"]}>
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  )
}
