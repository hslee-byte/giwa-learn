import { type Address, type Hex, isAddress, isHex, size } from "viem"
import type { PrivateKeyAccount } from "viem/accounts"
import { z } from "zod"

const AddressSchema = z.custom<Address>(
  (value) => typeof value === "string" && isAddress(value, { strict: true }),
)

const Hex32Schema = z.custom<Hex>(
  (value) => typeof value === "string" && isHex(value, { strict: true }) && size(value) === 32,
)

const ClaimVoucherInputSchema = z.object({
  campaignId: Hex32Schema,
  learner: AddressSchema,
  completionId: Hex32Schema,
  nonce: Hex32Schema,
  deadline: z.bigint().positive(),
  chainId: z.number().int().positive(),
  verifyingContract: AddressSchema,
})

type ClaimTypes = {
  readonly Claim: readonly [
    { readonly name: "campaignId"; readonly type: "bytes32" },
    { readonly name: "learner"; readonly type: "address" },
    { readonly name: "completionId"; readonly type: "bytes32" },
    { readonly name: "nonce"; readonly type: "bytes32" },
    { readonly name: "deadline"; readonly type: "uint256" },
  ]
}

const CLAIM_TYPES: ClaimTypes = {
  Claim: [
    { name: "campaignId", type: "bytes32" },
    { name: "learner", type: "address" },
    { name: "completionId", type: "bytes32" },
    { name: "nonce", type: "bytes32" },
    { name: "deadline", type: "uint256" },
  ],
}

type ClaimTypedData = {
  readonly domain: {
    readonly name: "GIWA Learn"
    readonly version: "1"
    readonly chainId: number
    readonly verifyingContract: Address
  }
  readonly types: ClaimTypes
  readonly primaryType: "Claim"
  readonly message: {
    readonly campaignId: Hex
    readonly learner: Address
    readonly completionId: Hex
    readonly nonce: Hex
    readonly deadline: bigint
  }
}

export type ClaimVoucher = z.infer<typeof ClaimVoucherInputSchema> & {
  readonly signature: Hex
}

export function buildClaimTypedData(rawInput: unknown): ClaimTypedData {
  const input = ClaimVoucherInputSchema.parse(rawInput)

  return {
    domain: {
      name: "GIWA Learn",
      version: "1",
      chainId: input.chainId,
      verifyingContract: input.verifyingContract,
    },
    types: CLAIM_TYPES,
    primaryType: "Claim",
    message: {
      campaignId: input.campaignId,
      learner: input.learner,
      completionId: input.completionId,
      nonce: input.nonce,
      deadline: input.deadline,
    },
  }
}

export async function issueClaimVoucher(
  account: PrivateKeyAccount,
  rawInput: unknown,
): Promise<ClaimVoucher> {
  const input = ClaimVoucherInputSchema.parse(rawInput)
  const signature = await account.signTypedData(buildClaimTypedData(input))

  return { ...input, signature }
}
