import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import { keccak256, parseEther, toBytes } from "viem"

const DOJANG_SCROLL = "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9"
const TESTNET_FAUCET_ATTESTER = "0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678"
const CAMPAIGN_ID = "0xa7d82c9e1f4ac0fc51deaf2ddf6812e5368b4201a54b1bb84b1997a77465d19f"
const CONTENT_HASH = keccak256(toBytes("giwa-learn:giwa-basics:v1"))
const STARTS_AT = 1_783_954_800n
const ENDS_AT = 1_788_155_999n
const REWARD_PER_CLAIM = parseEther("10")
const CAMPAIGN_BUDGET = parseEther("10000")

export default buildModule("GiwaLearnModule", (m) => {
  const deployer = m.getAccount(0)
  const token = m.contract("LearnRewardToken", [deployer])
  const rewards = m.contract("GiwaLearnRewards", [
    deployer,
    deployer,
    deployer,
    DOJANG_SCROLL,
    TESTNET_FAUCET_ATTESTER,
  ])
  const campaign = m.call(rewards, "createCampaign", [
    CAMPAIGN_ID,
    token,
    REWARD_PER_CLAIM,
    STARTS_AT,
    ENDS_AT,
    CONTENT_HASH,
  ])
  const approval = m.call(token, "approve", [rewards, CAMPAIGN_BUDGET])
  m.call(rewards, "fundCampaign", [CAMPAIGN_ID, CAMPAIGN_BUDGET], {
    after: [campaign, approval],
  })

  return { rewards, token }
})
