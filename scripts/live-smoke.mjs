import {
  createPublicClient,
  decodeErrorResult,
  decodeEventLog,
  encodeFunctionData,
  http,
} from "viem"

const liveUrl = "https://giwa-learn-gasok.vercel.app"
const rpcUrl = "https://sepolia-rpc.giwa.io"
const rewardsAddress = "0x22acb03CaB80Caaff541B39b1eEeBF374E02C9Ca"
const claimant = "0x985E8D68cF4B02d5c476191D446f1dB8a1D0c71E"
const unverifiedLearner = "0x000000000000000000000000000000000000dEaD"
const campaignId = "0xa7d82c9e1f4ac0fc51deaf2ddf6812e5368b4201a54b1bb84b1997a77465d19f"
const claimTransaction = "0xf143b3d6242532d77c7f37fa66b51f28314b167fc521b8910552c48202abf1de"

const answers = [
  { questionId: "giwa-kind", choiceId: "ethereum-l2" },
  { questionId: "block-time", choiceId: "one-second" },
  { questionId: "verified-address", choiceId: "kyc-status" },
  { questionId: "dojang-purpose", choiceId: "verified-claim" },
  { questionId: "gas-asset", choiceId: "eth" },
]

const abi = [
  {
    type: "function",
    name: "hasClaimed",
    stateMutability: "view",
    inputs: [
      { name: "campaignId", type: "bytes32" },
      { name: "learner", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "bytes32" },
      { name: "completionId", type: "bytes32" },
      { name: "nonce", type: "bytes32" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  { type: "error", name: "NotVerified", inputs: [] },
  { type: "error", name: "AlreadyClaimed", inputs: [] },
  {
    type: "event",
    name: "LearningRewardClaimed",
    inputs: [
      { name: "campaignId", type: "bytes32", indexed: true },
      { name: "learner", type: "address", indexed: true },
      { name: "completionId", type: "bytes32", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
]

const publicClient = createPublicClient({ transport: http(rpcUrl) })
const zeroBytes32 = `0x${"00".repeat(32)}`
const zeroSignature = `0x${"00".repeat(65)}`
const deadline = BigInt(Math.floor(Date.now() / 1000) + 900)

const authorizationResponse = await fetch(`${liveUrl}/api/claim/authorize`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ learner: unverifiedLearner, answers }),
})
const authorizationResult = await authorizationResponse.json()
if (authorizationResult.kind !== "not_verified") {
  throw new Error(`Expected not_verified, received ${authorizationResult.kind}`)
}

const hasClaimed = await publicClient.readContract({
  address: rewardsAddress,
  abi,
  functionName: "hasClaimed",
  args: [campaignId, claimant],
})
if (hasClaimed !== true) {
  throw new Error("Expected the verified claimant to have claimed already")
}

async function expectClaimError(account, expectedError) {
  const data = encodeFunctionData({
    abi,
    functionName: "claim",
    args: [campaignId, zeroBytes32, zeroBytes32, deadline, zeroSignature],
  })

  try {
    await publicClient.call({ account, to: rewardsAddress, data })
  } catch (error) {
    const revertError =
      typeof error.walk === "function"
        ? error.walk(
            (candidate) => typeof candidate.data === "string" && candidate.data.startsWith("0x"),
          )
        : error
    const revertData = revertError?.data
    if (!revertData) throw new Error(`Missing revert data for ${expectedError}`)
    const decoded = decodeErrorResult({ abi, data: revertData })
    if (decoded.errorName === expectedError) return
    throw new Error(`Expected ${expectedError}, received ${decoded.errorName}`)
  }
  throw new Error(`Expected ${expectedError}, but the call did not revert`)
}

await expectClaimError(unverifiedLearner, "NotVerified")
await expectClaimError(claimant, "AlreadyClaimed")

const receipt = await publicClient.getTransactionReceipt({ hash: claimTransaction })
if (receipt.status !== "success") throw new Error("Claim transaction was not successful")

const claimLog = receipt.logs
  .filter((log) => log.address.toLowerCase() === rewardsAddress.toLowerCase())
  .map((log) => {
    try {
      return decodeEventLog({ abi, data: log.data, topics: log.topics })
    } catch {
      return null
    }
  })
  .find((log) => log?.eventName === "LearningRewardClaimed")
if (!claimLog) throw new Error("LearningRewardClaimed event was not found")

console.log(
  JSON.stringify(
    {
      liveAuthorization: authorizationResult.kind,
      contractUnverifiedRejection: "NotVerified",
      verifiedClaimRecorded: hasClaimed,
      duplicateClaimRejection: "AlreadyClaimed",
      claimTransactionStatus: receipt.status,
      claimEvent: claimLog.eventName,
    },
    null,
    2,
  ),
)
