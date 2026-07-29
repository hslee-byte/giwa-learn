import { verifyTypedData } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { describe, expect, it } from "vitest"

import { buildClaimTypedData, issueClaimVoucher } from "@/domain/claim"

describe("issueClaimVoucher", () => {
  it("binds a signed authorization to the learner, campaign, chain, and contract", async () => {
    const account = privateKeyToAccount(generatePrivateKey())
    const input = {
      campaignId: "0xa7d82c9e1f4ac0fc51deaf2ddf6812e5368b4201a54b1bb84b1997a77465d19f",
      learner: "0x1111111111111111111111111111111111111111",
      completionId: "0x977da24e0f0ae8a2913cbdde3026befa61b578ad7ab6069bb2c9fcaaa096a8d8",
      nonce: "0xe1fdac6cfac85aab77ef4ff9309c1ccbc6f9fc82b0951c42a86ad7400a44a577",
      deadline: 1_800_000_000n,
      chainId: 91_342,
      verifyingContract: "0x2222222222222222222222222222222222222222",
    }

    const voucher = await issueClaimVoucher(account, input)
    const valid = await verifyTypedData({
      ...buildClaimTypedData(input),
      address: account.address,
      signature: voucher.signature,
    })

    expect(valid).toBe(true)
    expect(voucher.learner).toBe(input.learner)
    expect(voucher.deadline).toBe(input.deadline)
  })

  it("does not validate when the learner is changed", async () => {
    const account = privateKeyToAccount(generatePrivateKey())
    const input = {
      campaignId: "0xa7d82c9e1f4ac0fc51deaf2ddf6812e5368b4201a54b1bb84b1997a77465d19f",
      learner: "0x1111111111111111111111111111111111111111",
      completionId: "0x977da24e0f0ae8a2913cbdde3026befa61b578ad7ab6069bb2c9fcaaa096a8d8",
      nonce: "0xe1fdac6cfac85aab77ef4ff9309c1ccbc6f9fc82b0951c42a86ad7400a44a577",
      deadline: 1_800_000_000n,
      chainId: 91_342,
      verifyingContract: "0x2222222222222222222222222222222222222222",
    }

    const voucher = await issueClaimVoucher(account, input)
    const valid = await verifyTypedData({
      ...buildClaimTypedData({
        ...input,
        learner: "0x3333333333333333333333333333333333333333",
      }),
      address: account.address,
      signature: voucher.signature,
    })

    expect(valid).toBe(false)
  })
})
