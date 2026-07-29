"use client"

import { useEffect } from "react"

export function DevTools() {
  useEffect(() => {
    const disabled = process.env["NEXT_PUBLIC_DISABLE_REACT_DEVTOOLS"] === "1"
    if (process.env["NODE_ENV"] === "development" && !disabled) {
      void import("react-grab")
      void import("react-scan")
    }
  }, [])

  return null
}
