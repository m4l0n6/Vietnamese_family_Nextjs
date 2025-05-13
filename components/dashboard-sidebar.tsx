"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, ChevronDown, Home, LogOut, Settings, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { signOut } from "next-auth/react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  familyTreeId?: string
}

export function DashboardSidebar({ className, familyTreeId }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-lg font-semibold tracking-tight">Gia Phả Việt Nam</h2>
          </Link>
          <div className="mt-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            <Link href="/dashboard" prefetch={false}>
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Home className="mr-2 h-4 w-4" />
                Tổng quan
              </Button>
            </Link>
            <Link href="/dashboard/family-trees" prefetch={false}>
              <Button
                variant={pathname === "/dashboard/family-trees" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Gia phả
              </Button>
            </Link>
            <Link href="/dashboard/members" prefetch={false}>
              <Button
                variant={pathname === "/dashboard/members" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <User className="mr-2 h-4 w-4" />
                Thành viên
              </Button>
            </Link>
            <Link href="/dashboard/profile" prefetch={false}>
              <Button
                variant={pathname === "/dashboard/profile" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </Button>
            </Link>
            <Link href="/dashboard/settings" prefetch={false}>
              <Button
                variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
        {familyTreeId && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Quản lý gia phả</h2>
            <div className="space-y-1">
              <Link href={`/dashboard/family-trees/${familyTreeId}`} prefetch={false}>
                <Button
                  variant={pathname === `/dashboard/family-trees/${familyTreeId}` ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Tổng quan
                </Button>
              </Link>
              <Link href={`/dashboard/family-trees/${familyTreeId}/members`} prefetch={false}>
                <Button
                  variant={pathname === `/dashboard/family-trees/${familyTreeId}/members` ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Thành viên
                </Button>
              </Link>
              <Collapsible open={open} onOpenChange={setOpen} className="w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Phả hệ</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1">
                  <Link href={`/dashboard/family-trees/${familyTreeId}/genealogy`} prefetch={false}>
                    <Button
                      variant={pathname === `/dashboard/family-trees/${familyTreeId}/genealogy` ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      Phả đồ
                    </Button>
                  </Link>
                  <Link href={`/dashboard/family-trees/${familyTreeId}/events`} prefetch={false}>
                    <Button
                      variant={pathname === `/dashboard/family-trees/${familyTreeId}/events` ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      Sự kiện
                    </Button>
                  </Link>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MobileSidebar({ familyTreeId }: { familyTreeId?: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Users className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <ScrollArea className="h-full">
          <DashboardSidebar familyTreeId={familyTreeId} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
