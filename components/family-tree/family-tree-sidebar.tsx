import Link from "next/link"
import { TreesIcon as TreeStructure } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function FamilyTreeSidebar() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Phả đồ</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/family-tree">
                  <TreeStructure className="h-4 w-4" />
                  <span>Sơ đồ phả hệ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

