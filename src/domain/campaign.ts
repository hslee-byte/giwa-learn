import { z } from "zod"

const LessonSchema = z.object({
  id: z.string().min(1),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  facts: z.array(z.string().min(1)).min(1),
  sourceLabel: z.string().min(1),
  sourceUrl: z.url(),
})

const QuizChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
})

const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  choices: z.array(QuizChoiceSchema).min(2),
  correctChoiceId: z.string().min(1),
  explanation: z.string().min(1),
})

const RewardSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  symbol: z.string().min(1),
  tokenName: z.string().min(1),
})

const CampaignMetricsSchema = z.object({
  learners: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(100),
  passRate: z.number().min(0).max(100),
  claims: z.number().int().nonnegative(),
  remainingRewards: z.number().int().nonnegative(),
})

export const CampaignSchema = z.object({
  id: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  version: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string().min(1),
  audience: z.string().min(1),
  status: z.enum(["draft", "active", "paused", "closed"]),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  estimatedMinutes: z.number().int().positive(),
  passScore: z.number().int().positive(),
  lessons: z.array(LessonSchema).min(1),
  questions: z.array(QuizQuestionSchema).min(1),
  reward: RewardSchema,
  metrics: CampaignMetricsSchema,
})

export type Campaign = z.infer<typeof CampaignSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type QuizChoice = z.infer<typeof QuizChoiceSchema>

export type PublicQuizQuestion = {
  readonly id: string
  readonly prompt: string
  readonly choices: readonly QuizChoice[]
}

export type PublicCampaign = Omit<Campaign, "questions"> & {
  readonly questions: readonly PublicQuizQuestion[]
}

export function toPublicCampaign(campaign: Campaign): PublicCampaign {
  return {
    id: campaign.id,
    slug: campaign.slug,
    version: campaign.version,
    title: campaign.title,
    summary: campaign.summary,
    audience: campaign.audience,
    status: campaign.status,
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
    estimatedMinutes: campaign.estimatedMinutes,
    passScore: campaign.passScore,
    lessons: campaign.lessons,
    questions: campaign.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: question.choices,
    })),
    reward: campaign.reward,
    metrics: campaign.metrics,
  }
}
