"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function FamilyTreeLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const params = useParams()
  const familyTreeId = params.id as string

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return (
    <div className="h-full">
      <main>{children}</main>
    </div>
  )
}

