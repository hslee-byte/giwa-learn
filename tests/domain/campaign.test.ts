import { describe, expect, it } from "vitest"

import { GIWA_BASICS_CAMPAIGN } from "@/data/giwa-basics"
import { toPublicCampaign } from "@/domain/campaign"

describe("toPublicCampaign", () => {
  it("removes answer keys from the learner-facing campaign", () => {
    const campaign = toPublicCampaign(GIWA_BASICS_CAMPAIGN)

    expect(campaign.questions).toHaveLength(5)
    for (const question of campaign.questions) {
      expect(question).not.toHaveProperty("correctChoiceId")
    }
  })

  it("preserves the campaign pass score and reward details", () => {
    const campaign = toPublicCampaign(GIWA_BASICS_CAMPAIGN)

    expect(campaign.passScore).toBe(4)
    expect(campaign.reward.amount).toBe("10")
    expect(campaign.reward.symbol).toBe("gLEARN")
  })
})
