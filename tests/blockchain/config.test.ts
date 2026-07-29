import { describe, expect, it } from "vitest"

import { DOJANG_ATTESTER_ID, DOJANG_ATTESTER_LABEL } from "@/blockchain/config"

describe("GIWA Sepolia Dojang configuration", () => {
  it("uses the official Testnet Faucet attester for the public prototype", () => {
    expect(DOJANG_ATTESTER_ID).toBe(
      "0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678",
    )
    expect(DOJANG_ATTESTER_LABEL).toBe("GIWA Testnet Faucet")
  })
})
