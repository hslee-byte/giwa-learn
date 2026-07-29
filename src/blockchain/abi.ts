import type { Abi } from "viem"

export const DOJANG_SCROLL_ABI: Abi = [
  {
    type: "function",
    name: "isVerified",
    stateMutability: "view",
    inputs: [
      { name: "learner", type: "address" },
      { name: "attesterId", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
]

export const REWARDS_ABI: Abi = [
  {
    type: "function",
    name: "claimSigner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
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
]
