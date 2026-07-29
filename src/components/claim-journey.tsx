"use client"

import { ReloadIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { type Address, keccak256, toBytes } from "viem"

import styles from "@/app/journey.module.css"
import { checkVerifiedAddress, claimLiveReward, connectInjectedWallet } from "@/blockchain/wallet"
import {
  FailedResult,
  MissingResult,
  ProtocolPanel,
  TransactionSuccess,
} from "@/components/claim-result-panels"
import { ActionButton, type RailStep, StatusChip, VerificationRail } from "@/components/primitives"
import { AuthorizationResponseSchema } from "@/domain/authorization"
import type { ClaimState, JourneyRecord } from "@/domain/journey"
import { loadJourney, saveJourney } from "@/lib/journey-storage"

const DEMO_ADDRESS: Address = "0x8A7Bf3d5f12D4A4c7707C67dEbEA3f0aC3A2C001"

type WalletState =
  | { readonly kind: "idle" }
  | { readonly kind: "checking" }
  | {
      readonly kind: "connected"
      readonly address: Address
      readonly mode: "demo" | "live"
      readonly verified: boolean
    }
  | { readonly kind: "error"; readonly message: string }

export function ClaimJourney() {
  const [record, setRecord] = useState<JourneyRecord | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [wallet, setWallet] = useState<WalletState>({ kind: "idle" })
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    setRecord(loadJourney())
    setLoaded(true)
  }, [])

  function persistClaim(claim: ClaimState): void {
    if (record === null) {
      return
    }
    const next: JourneyRecord = { ...record, claim }
    setRecord(next)
    saveJourney(next)
  }

  async function connectLive(): Promise<void> {
    setWallet({ kind: "checking" })
    try {
      const address = await connectInjectedWallet()
      const verified = await checkVerifiedAddress(address)
      setWallet({ kind: "connected", address, mode: "live", verified })
    } catch (error) {
      setWallet({ kind: "error", message: errorMessage(error) })
    }
  }

  function connectDemo(): void {
    setWallet({ kind: "connected", address: DEMO_ADDRESS, mode: "demo", verified: true })
  }

  async function claimReward(): Promise<void> {
    if (record === null || wallet.kind !== "connected" || !wallet.verified) {
      return
    }
    setClaiming(true)
    persistClaim({ kind: "verifying" })

    try {
      if (wallet.mode === "demo") {
        const txHash = keccak256(toBytes(`${wallet.address}:${record.completedAt}`))
        persistClaim({ kind: "claimed", mode: "demo", txHash })
        return
      }

      const response = await fetch("/api/claim/authorize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ learner: wallet.address, answers: record.answers }),
      })
      const payload: unknown = await response.json()
      const authorization = AuthorizationResponseSchema.parse(payload)
      if (authorization.kind !== "live_ready") {
        persistClaim({ kind: "error", message: authorization.message })
        return
      }
      const txHash = await claimLiveReward(wallet.address, authorization)
      persistClaim({ kind: "claimed", mode: "live", txHash })
    } catch (error) {
      persistClaim({ kind: "error", message: errorMessage(error) })
    } finally {
      setClaiming(false)
    }
  }

  if (!loaded) {
    return <p>학습 기록을 확인하고 있습니다.</p>
  }
  if (record === null) {
    return <MissingResult />
  }
  if (record.result.kind === "failed") {
    return <FailedResult record={record} />
  }

  const claimed = record.claim.kind === "claimed"
  const verified = wallet.kind === "connected" && wallet.verified
  const steps = claimSteps(verified, claimed)

  return (
    <>
      <VerificationRail steps={steps} />
      <div className={styles["claimLayout"]}>
        <section className={styles["claimCard"]}>
          <StatusChip tone="verified">QUIZ PASSED</StatusChip>
          <div className={styles["score"]}>
            <strong>{record.result.score}</strong>
            <span>/ {record.result.total}</span>
          </div>
          <h2>
            이제 검증된 학습자로
            <br />
            {"첫\u00a0GIWA\u00a0행동까지"}
            <br />
            완료했습니다.
          </h2>
          <div className={styles["walletBox"]}>
            <div className={styles["walletHeader"]}>
              <h3>Dojang Verified Address</h3>
              {walletBadge(wallet)}
            </div>
            {wallet.kind === "idle" ? (
              <>
                <p>
                  심사용 데모는 지갑 설치 없이 완주할 수 있습니다. 실제 지갑은 GIWA Sepolia에서
                  조회합니다.
                </p>
                <div className={styles["walletActions"]}>
                  <ActionButton onClick={connectDemo}>데모 지갑으로 체험</ActionButton>
                  <ActionButton onClick={() => void connectLive()} variant="secondary">
                    실제 지갑 연결
                  </ActionButton>
                </div>
              </>
            ) : null}
            {wallet.kind === "checking" ? (
              <p>
                <ReloadIcon /> GIWA Sepolia와 Dojang을 확인 중입니다.
              </p>
            ) : null}
            {wallet.kind === "connected" ? (
              <p className={styles["address"]} title={wallet.address}>
                <span aria-hidden="true">{shortAddress(wallet.address)}</span>
                <span className="sr-only">연결된 지갑 {wallet.address}</span>
              </p>
            ) : null}
            {wallet.kind === "error" ? (
              <p className={styles["errorMessage"]} role="alert">
                {wallet.message}
              </p>
            ) : null}
            {wallet.kind === "connected" && !wallet.verified ? (
              <p className={styles["errorMessage"]}>
                이 지갑은 GIWA Testnet Faucet attester의 검증 기록이 없습니다.
              </p>
            ) : null}
            {verified && !claimed ? (
              <div className={styles["claimAction"]}>
                <ActionButton
                  loading={claiming}
                  onClick={() => void claimReward()}
                  variant="verified"
                >
                  {wallet.mode === "demo" ? "10 gLEARN 데모 청구" : "10 gLEARN 온체인 청구"}
                </ActionButton>
              </div>
            ) : null}
          </div>
          {record.claim.kind === "error" ? (
            <p className={styles["errorMessage"]} role="alert">
              {record.claim.message}
            </p>
          ) : null}
          {record.claim.kind === "claimed" ? <TransactionSuccess claim={record.claim} /> : null}
        </section>
        <ProtocolPanel />
      </div>
    </>
  )
}

function walletBadge(wallet: WalletState) {
  if (wallet.kind === "connected" && wallet.verified) {
    return (
      <StatusChip tone="verified">
        {wallet.mode === "demo" ? "DEMO VERIFIED" : "VERIFIED"}
      </StatusChip>
    )
  }
  if (wallet.kind === "connected") {
    return <StatusChip tone="error">NOT VERIFIED</StatusChip>
  }
  return <StatusChip>NOT CONNECTED</StatusChip>
}

function claimSteps(verified: boolean, claimed: boolean): readonly RailStep[] {
  return [
    { label: "학습", detail: "3개 카드 완료", state: "complete" },
    { label: "퀴즈", detail: "합격", state: "complete" },
    {
      label: "KYC 검증",
      detail: verified ? "Dojang 완료" : "지갑 대기",
      state: verified ? "complete" : "current",
    },
    {
      label: "보상",
      detail: claimed ? "청구 완료" : "지갑당 1회",
      state: claimed ? "complete" : "pending",
    },
  ]
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "예상하지 못한 오류가 발생했습니다."
}

function shortAddress(address: Address): string {
  return `${address.slice(0, 8)}…${address.slice(-6)}`
}
