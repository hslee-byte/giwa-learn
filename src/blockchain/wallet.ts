import { type Address, createPublicClient, createWalletClient, custom, type Hex, http } from "viem"
import { z } from "zod"

import { DOJANG_SCROLL_ABI, REWARDS_ABI } from "@/blockchain/abi"
import { DOJANG_ATTESTER_ID, DOJANG_SCROLL_ADDRESS, GIWA_SEPOLIA } from "@/blockchain/config"
import type { LiveAuthorization } from "@/domain/authorization"

export async function connectInjectedWallet(): Promise<Address> {
  const provider = window.ethereum
  if (provider === undefined) {
    throw new Error("MetaMask 등 EVM 지갑이 필요합니다.")
  }

  const client = createWalletClient({ chain: GIWA_SEPOLIA, transport: custom(provider) })
  const addresses = await client.requestAddresses()
  const address = addresses[0]
  if (address === undefined) {
    throw new Error("연결된 지갑 주소를 찾지 못했습니다.")
  }

  const chainId = await client.getChainId()
  if (chainId !== GIWA_SEPOLIA.id) {
    await client.switchChain({ id: GIWA_SEPOLIA.id })
  }
  return address
}

export async function checkVerifiedAddress(address: Address): Promise<boolean> {
  const client = createPublicClient({ chain: GIWA_SEPOLIA, transport: http() })
  const result = await client.readContract({
    address: DOJANG_SCROLL_ADDRESS,
    abi: DOJANG_SCROLL_ABI,
    functionName: "isVerified",
    args: [address, DOJANG_ATTESTER_ID],
  })
  return z.boolean().parse(result)
}

export async function claimLiveReward(
  learner: Address,
  authorization: LiveAuthorization,
): Promise<Hex> {
  const provider = window.ethereum
  if (provider === undefined) {
    throw new Error("연결된 EVM 지갑을 찾지 못했습니다.")
  }
  const client = createWalletClient({ chain: GIWA_SEPOLIA, transport: custom(provider) })
  return client.writeContract({
    account: learner,
    address: authorization.contractAddress,
    abi: REWARDS_ABI,
    functionName: "claim",
    args: [
      authorization.campaignId,
      authorization.completionId,
      authorization.nonce,
      BigInt(authorization.deadline),
      authorization.signature,
    ],
  })
}
