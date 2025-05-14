"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, CalendarDays, Settings, Home, FolderTree, FileText, BookOpen, GitFork } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  familyTreeId?: string
}

export function DashboardSidebar({ className, familyTreeId }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Tổng quan",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Gia phả của tôi",
      icon: FolderTree,
      href: "/dashboard/family-trees",
      active: pathname === "/dashboard/family-trees",
    },
  ]

  const familyTreeRoutes = familyTreeId
    ? [
        {
          label: "Tổng quan",
          icon: BarChart3,
          href: `/dashboard/family-trees/${familyTreeId}`,
          active: pathname === `/dashboard/family-trees/${familyTreeId}`,
        },
        {
          label: "Thành viên",
          icon: Users,
          href: `/dashboard/family-trees/${familyTreeId}/members`,
          active: pathname.includes(`/dashboard/family-trees/${familyTreeId}/members`),
        },
        {
          label: "Phả đồ",
          icon: GitFork,
          href: `/dashboard/family-trees/${familyTreeId}/tree`,
          active: pathname.includes(`/dashboard/family-trees/${familyTreeId}/tree`),
        },
        {
          label: "Phả hệ",
          icon: BookOpen,
          href: `/dashboard/family-trees/${familyTreeId}/genealogy`,
          active: pathname.includes(`/dashboard/family-trees/${familyTreeId}/genealogy`),
        },
        {
          label: "Sự kiện",
          icon: CalendarDays,
          href: `/dashboard/family-trees/${familyTreeId}/events`,
          active: pathname.includes(`/dashboard/family-trees/${familyTreeId}/events`),
        },
        {
          label: "Tài liệu",
          icon: FileText,
          href: `/dashboard/family-trees/${familyTreeId}/documents`,
          active: pathname.includes(`/dashboard/family-trees/${familyTreeId}/documents`),
        },
        {
          label: "Cài đặt",
          icon: Settings,
          href: `/dashboard/family-trees/${familyTreeId}/settings`,
          active: pathname.includes(`/dashboard/family-trees/${familyTreeId}/settings`),
        },
      ]
    : []

  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Bảng điều khiển</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn("w-full justify-start", route.active ? "bg-primary/10 hover:bg-primary/20" : "")}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        {familyTreeId && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Quản lý gia phả</h2>
            <ScrollArea className="h-[300px]">
              <div className="space-y-1 p-2">
                {familyTreeRoutes.map((route) => (
                  <Button
                    key={route.href}
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", route.active ? "bg-primary/10 hover:bg-primary/20" : "")}
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
