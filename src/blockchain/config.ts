import { defineChain } from "viem"

export const GIWA_SEPOLIA = defineChain({
  id: 91342,
  name: "GIWA Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia-rpc.giwa.io"] },
  },
  blockExplorers: {
    default: { name: "GIWA Sepolia Explorer", url: "https://sepolia-explorer.giwa.io" },
  },
  testnet: true,
})

export const DOJANG_SCROLL_ADDRESS = "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9"
export const DOJANG_ATTESTER_ID =
  "0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678"
export const DOJANG_ATTESTER_LABEL = "GIWA Testnet Faucet"
