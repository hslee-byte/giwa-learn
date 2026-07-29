import type { EIP1193Provider } from "viem"

declare global {
  interface Window {
    readonly ethereum?: EIP1193Provider
  }
}
