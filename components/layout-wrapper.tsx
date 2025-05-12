"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { SiteHeader } from "./site-header"
import { SiteFooter } from "./site-footer"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isDashboard && <SiteHeader />}
      <main className="flex-1">{children}</main>
      {!isDashboard && <SiteFooter />}
    </div>
  )
}
