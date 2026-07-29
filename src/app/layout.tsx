import type { Metadata } from "next"
import type { ReactNode } from "react"

import "@/app/globals.css"
import { DevTools } from "@/components/dev-tools"

export const metadata: Metadata = {
  title: {
    default: "GIWA Learn",
    template: "%s | GIWA Learn",
  },
  description:
    "Dojang으로 검증된 사용자의 프로젝트 학습을 GIWA 첫 트랜잭션으로 전환하는 GASOK 프로토타입",
}

type RootLayoutProps = {
  readonly children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기
        </a>
        {children}
        <DevTools />
      </body>
    </html>
  )
}
