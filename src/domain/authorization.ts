import { type Address, type Hex, isAddress, isHex, size } from "viem"
import { z } from "zod"

const AddressSchema = z.custom<Address>(
  (value) => typeof value === "string" && isAddress(value, { strict: true }),
)
const HexSchema = z.custom<Hex>(
  (value) => typeof value === "string" && isHex(value, { strict: true }),
)
const Hex32Schema = z.custom<Hex>(
  (value) => typeof value === "string" && isHex(value, { strict: true }) && size(value) === 32,
)

export const AuthorizationRequestSchema = z.object({
  learner: AddressSchema,
  answers: z.array(z.object({ questionId: z.string().min(1), choiceId: z.string().min(1) })),
})

const LiveAuthorizationSchema = z.object({
  kind: z.literal("live_ready"),
  contractAddress: AddressSchema,
  campaignId: Hex32Schema,
  completionId: Hex32Schema,
  nonce: Hex32Schema,
  deadline: z.string().regex(/^\d+$/),
  signature: HexSchema,
})

export const AuthorizationResponseSchema = z.discriminatedUnion("kind", [
  LiveAuthorizationSchema,
  z.object({ kind: z.literal("unavailable"), message: z.string().min(1) }),
  z.object({ kind: z.literal("not_verified"), message: z.string().min(1) }),
  z.object({ kind: z.literal("invalid"), message: z.string().min(1) }),
])

export type LiveAuthorization = z.infer<typeof LiveAuthorizationSchema>
