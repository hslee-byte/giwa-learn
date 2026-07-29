import { ArrowRightIcon, CheckCircledIcon, ClockIcon, PersonIcon } from "@radix-ui/react-icons"
import Link from "next/link"

import styles from "@/app/home.module.css"
import { SiteHeader } from "@/components/site-header"
import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"

export default function HomePage() {
  const campaign = GIWA_BASICS_CAMPAIGN
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className={styles["hero"]}>
          <div className={styles["heroCopy"]}>
            <p className="eyebrow">LEARN. VERIFY. CLAIM.</p>
            <h1 className="display-text">
              에어드랍을
              <br />
              학습 인프라로.
            </h1>
          </div>
          <div className={styles["heroAside"]}>
            <p>
              프로젝트 핵심 학습을 통과한 검증 지갑만 보상받고, 그 완료가 GIWA의 첫 온체인 행동으로
              이어집니다.
            </p>
            <Link className={styles["heroLink"]} href="/learn/giwa-basics">
              바로 체험하기 <ArrowRightIcon aria-hidden="true" />
            </Link>
            <p className={styles["prototypeNote"]}>
              업비트/GIWA가 직접 운영할 수 있도록 설계된 GASOK Prototype
            </p>
          </div>
        </section>

        <section aria-labelledby="campaign-title" className={styles["campaign"]}>
          <div className={styles["campaignMeta"]}>
            <p className="eyebrow">GASOK DEMO CAMPAIGN / 01</p>
            <div className={styles["metaRow"]}>
              <span>
                <ClockIcon aria-hidden="true" /> 약 {campaign.estimatedMinutes}분
              </span>
              <span>
                <PersonIcon aria-hidden="true" /> {campaign.audience}
              </span>
            </div>
          </div>
          <div className={styles["campaignBody"]}>
            <div>
              <h2 id="campaign-title">{campaign.title}</h2>
              <p>{campaign.summary}</p>
            </div>
            <div className={styles["reward"]}>
              <span>완주 보상</span>
              <strong>
                {campaign.reward.amount} {campaign.reward.symbol}
              </strong>
              <small>GIWA Sepolia 테스트 보상</small>
            </div>
          </div>
          <div className={styles["campaignAction"]}>
            <ul>
              <li>
                <CheckCircledIcon /> 3개 학습 카드
              </li>
              <li>
                <CheckCircledIcon /> 5문제 중 {campaign.passScore}문제 통과
              </li>
              <li>
                <CheckCircledIcon /> Dojang 검증 후 지갑당 1회
              </li>
            </ul>
            <Link className={styles["primaryLink"]} href="/learn/giwa-basics">
              3분 체험 시작 <ArrowRightIcon aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={styles["proof"]}>
          <div>
            <strong>10K+</strong>
            <span>유사 캠페인 참여 경험</span>
          </div>
          <div>
            <strong>1,100%</strong>
            <span>지갑 연결 성장 레퍼런스</span>
          </div>
          <div>
            <strong>1 TX</strong>
            <span>학습에서 첫 GIWA 행동까지</span>
          </div>
          <p>INF CryptoLab의 Web3 캠페인 운영 경험을 GIWA 네이티브 구조로 전환했습니다.</p>
        </section>
      </main>
    </>
  )
}
