import { NextResponse } from "next/server"
import {
  type Address,
  createPublicClient,
  type Hex,
  http,
  isAddress,
  isHex,
  keccak256,
  size,
  toBytes,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { z } from "zod"

import { DOJANG_SCROLL_ABI, REWARDS_ABI } from "@/blockchain/abi"
import { DOJANG_ATTESTER_ID, DOJANG_SCROLL_ADDRESS, GIWA_SEPOLIA } from "@/blockchain/config"
import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"
import { AuthorizationRequestSchema } from "@/domain/authorization"
import { issueClaimVoucher } from "@/domain/claim"
import { gradeQuiz } from "@/domain/quiz"

const PrivateKeySchema = z.custom<Hex>(
  (value) => typeof value === "string" && isHex(value, { strict: true }) && size(value) === 32,
)

const ContractAddressSchema = z.custom<Address>(
  (value) => typeof value === "string" && isAddress(value, { strict: true }),
)
const LiveEnvironmentSchema = z.object({
  privateKey: PrivateKeySchema,
  contractAddress: ContractAddressSchema,
})

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { kind: "invalid", message: "요청 형식을 확인해 주세요." },
      { status: 400 },
    )
  }

  const parsed = AuthorizationRequestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { kind: "invalid", message: "지갑과 답안을 확인해 주세요." },
      { status: 400 },
    )
  }

  const grade = gradeQuiz(GIWA_BASICS_CAMPAIGN, parsed.data.answers)
  if (grade.kind !== "passed") {
    return NextResponse.json(
      { kind: "invalid", message: "합격한 답안만 보상받을 수 있습니다." },
      { status: 403 },
    )
  }

  const environment = LiveEnvironmentSchema.safeParse({
    privateKey: process.env["CLAIM_SIGNER_PRIVATE_KEY"],
    contractAddress: process.env["REWARDS_CONTRACT_ADDRESS"],
  })
  if (!environment.success) {
    return NextResponse.json({
      kind: "unavailable",
      message: "현재 빌드는 안전한 데모 모드입니다.",
    })
  }

  const publicClient = createPublicClient({ chain: GIWA_SEPOLIA, transport: http() })
  const signer = privateKeyToAccount(environment.data.privateKey)
  let verification: boolean
  let configuredSigner: string
  try {
    const [rawVerification, rawSigner] = await Promise.all([
      publicClient.readContract({
        address: DOJANG_SCROLL_ADDRESS,
        abi: DOJANG_SCROLL_ABI,
        functionName: "isVerified",
        args: [parsed.data.learner, DOJANG_ATTESTER_ID],
      }),
      publicClient.readContract({
        address: environment.data.contractAddress,
        abi: REWARDS_ABI,
        functionName: "claimSigner",
      }),
    ])
    verification = z.boolean().parse(rawVerification)
    configuredSigner = ContractAddressSchema.parse(rawSigner)
  } catch {
    return NextResponse.json(
      { kind: "unavailable", message: "GIWA 검증 서비스에 잠시 연결할 수 없습니다." },
      { status: 503 },
    )
  }
  if (verification !== true) {
    return NextResponse.json({
      kind: "not_verified",
      message: "Dojang에서 검증되지 않은 지갑입니다.",
    })
  }
  if (configuredSigner.toLowerCase() !== signer.address.toLowerCase()) {
    return NextResponse.json(
      { kind: "unavailable", message: "보상 서명자 설정을 확인하고 있습니다." },
      { status: 503 },
    )
  }

  const completionId = keccak256(toBytes(JSON.stringify(parsed.data.answers)))
  const nonce = keccak256(toBytes(crypto.randomUUID()))
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60)
  const voucher = await issueClaimVoucher(signer, {
    campaignId: GIWA_BASICS_CAMPAIGN.id,
    learner: parsed.data.learner,
    completionId,
    nonce,
    deadline,
    chainId: GIWA_SEPOLIA.id,
    verifyingContract: environment.data.contractAddress,
  })

  return NextResponse.json({
    kind: "live_ready",
    contractAddress: voucher.verifyingContract,
    campaignId: voucher.campaignId,
    completionId: voucher.completionId,
    nonce: voucher.nonce,
    deadline: voucher.deadline.toString(),
    signature: voucher.signature,
  })
}
