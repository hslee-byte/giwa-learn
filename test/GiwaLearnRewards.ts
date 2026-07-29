import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type {} from "@nomicfoundation/hardhat-toolbox-viem"
import { network } from "hardhat"
import { keccak256, parseEther, toBytes } from "viem"

const CAMPAIGN_ID = keccak256(toBytes("giwa-basics-v1"))
const CONTENT_HASH = keccak256(toBytes("giwa-basics-content-v1"))
const COMPLETION_ID = keccak256(toBytes("attempt-001"))
const NONCE = keccak256(toBytes("nonce-001"))
const ATTESTER_ID = keccak256(toBytes("dojang.dojangattesterids.upbitkorea"))
const REWARD = parseEther("10")
const BUDGET = parseEther("100")

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

async function deployFixture() {
  const connection = await network.create()
  const wallets = await connection.viem.getWalletClients()
  const admin = wallets[0]
  const operator = wallets[1]
  const signer = wallets[2]
  const learner = wallets[3]
  const outsider = wallets[4]

  if (
    admin === undefined ||
    operator === undefined ||
    signer === undefined ||
    learner === undefined ||
    outsider === undefined
  ) {
    throw new Error("Hardhat test wallets are unavailable")
  }

  const dojang = await connection.viem.deployContract("MockDojangScroll")
  const token = await connection.viem.deployContract("LearnRewardToken", [admin.account.address])
  const rewards = await connection.viem.deployContract("GiwaLearnRewards", [
    admin.account.address,
    operator.account.address,
    signer.account.address,
    dojang.address,
    ATTESTER_ID,
  ])
  const publicClient = await connection.viem.getPublicClient()
  const block = await publicClient.getBlock()
  const startsAt = block.timestamp - 60n
  const endsAt = block.timestamp + 3_600n

  await rewards.write.createCampaign(
    [CAMPAIGN_ID, token.address, REWARD, startsAt, endsAt, CONTENT_HASH],
    { account: operator.account },
  )
  await token.write.transfer([operator.account.address, BUDGET])
  await token.write.approve([rewards.address, BUDGET], { account: operator.account })
  await rewards.write.fundCampaign([CAMPAIGN_ID, BUDGET], { account: operator.account })

  return {
    connection,
    admin,
    operator,
    signer,
    learner,
    outsider,
    dojang,
    token,
    rewards,
    publicClient,
    endsAt,
  }
}

async function signClaim(
  fixture: Awaited<ReturnType<typeof deployFixture>>,
  learner: `0x${string}`,
  deadline: bigint,
) {
  const chainId = await fixture.publicClient.getChainId()
  return fixture.signer.signTypedData({
    account: fixture.signer.account,
    domain: {
      name: "GIWA Learn",
      version: "1",
      chainId,
      verifyingContract: fixture.rewards.address,
    },
    types: CLAIM_TYPES,
    primaryType: "Claim",
    message: {
      campaignId: CAMPAIGN_ID,
      learner,
      completionId: COMPLETION_ID,
      nonce: NONCE,
      deadline,
    },
  })
}

describe("GiwaLearnRewards", () => {
  it("rewards a verified learner with a valid campaign-bound authorization", async () => {
    const fixture = await deployFixture()
    const deadline = fixture.endsAt - 60n
    await fixture.dojang.write.setVerified([fixture.learner.account.address, ATTESTER_ID, true])
    const signature = await signClaim(fixture, fixture.learner.account.address, deadline)

    await fixture.rewards.write.claim([CAMPAIGN_ID, COMPLETION_ID, NONCE, deadline, signature], {
      account: fixture.learner.account,
    })

    assert.equal(await fixture.token.read.balanceOf([fixture.learner.account.address]), REWARD)
    assert.equal(
      await fixture.rewards.read.hasClaimed([CAMPAIGN_ID, fixture.learner.account.address]),
      true,
    )
    const campaign = await fixture.rewards.read.campaigns([CAMPAIGN_ID])
    assert.equal(campaign[2], BUDGET - REWARD)
    assert.equal(campaign[8], 1n)
  })

  it("rejects an unverified wallet even when the authorization is valid", async () => {
    const fixture = await deployFixture()
    const deadline = fixture.endsAt - 60n
    const signature = await signClaim(fixture, fixture.learner.account.address, deadline)

    await fixture.connection.viem.assertions.revertWithCustomError(
      fixture.rewards.write.claim([CAMPAIGN_ID, COMPLETION_ID, NONCE, deadline, signature], {
        account: fixture.learner.account,
      }),
      fixture.rewards,
      "NotVerified",
    )
  })

  it("rejects a second claim even with a fresh nonce", async () => {
    const fixture = await deployFixture()
    const deadline = fixture.endsAt - 60n
    await fixture.dojang.write.setVerified([fixture.learner.account.address, ATTESTER_ID, true])
    const firstSignature = await signClaim(fixture, fixture.learner.account.address, deadline)
    await fixture.rewards.write.claim(
      [CAMPAIGN_ID, COMPLETION_ID, NONCE, deadline, firstSignature],
      { account: fixture.learner.account },
    )

    const secondNonce = keccak256(toBytes("nonce-002"))
    const chainId = await fixture.publicClient.getChainId()
    const secondSignature = await fixture.signer.signTypedData({
      account: fixture.signer.account,
      domain: {
        name: "GIWA Learn",
        version: "1",
        chainId,
        verifyingContract: fixture.rewards.address,
      },
      types: CLAIM_TYPES,
      primaryType: "Claim",
      message: {
        campaignId: CAMPAIGN_ID,
        learner: fixture.learner.account.address,
        completionId: COMPLETION_ID,
        nonce: secondNonce,
        deadline,
      },
    })

    await fixture.connection.viem.assertions.revertWithCustomError(
      fixture.rewards.write.claim(
        [CAMPAIGN_ID, COMPLETION_ID, secondNonce, deadline, secondSignature],
        { account: fixture.learner.account },
      ),
      fixture.rewards,
      "AlreadyClaimed",
    )
  })

  it("rejects a signature used by a different verified wallet", async () => {
    const fixture = await deployFixture()
    const deadline = fixture.endsAt - 60n
    await fixture.dojang.write.setVerified([fixture.outsider.account.address, ATTESTER_ID, true])
    const signature = await signClaim(fixture, fixture.learner.account.address, deadline)

    await fixture.connection.viem.assertions.revertWithCustomError(
      fixture.rewards.write.claim([CAMPAIGN_ID, COMPLETION_ID, NONCE, deadline, signature], {
        account: fixture.outsider.account,
      }),
      fixture.rewards,
      "InvalidClaimSignature",
    )
  })

  it("prevents active campaign funds from being withdrawn", async () => {
    const fixture = await deployFixture()

    await fixture.connection.viem.assertions.revertWithCustomError(
      fixture.rewards.write.withdrawRemainder([CAMPAIGN_ID, fixture.operator.account.address], {
        account: fixture.operator.account,
      }),
      fixture.rewards,
      "CampaignStillActive",
    )
  })

  it("blocks claims when the campaign is paused", async () => {
    const fixture = await deployFixture()
    const deadline = fixture.endsAt - 60n
    await fixture.dojang.write.setVerified([fixture.learner.account.address, ATTESTER_ID, true])
    await fixture.rewards.write.setCampaignPaused([CAMPAIGN_ID, true], {
      account: fixture.operator.account,
    })
    const signature = await signClaim(fixture, fixture.learner.account.address, deadline)

    await fixture.connection.viem.assertions.revertWithCustomError(
      fixture.rewards.write.claim([CAMPAIGN_ID, COMPLETION_ID, NONCE, deadline, signature], {
        account: fixture.learner.account,
      }),
      fixture.rewards,
      "CampaignUnavailable",
    )
  })
})
