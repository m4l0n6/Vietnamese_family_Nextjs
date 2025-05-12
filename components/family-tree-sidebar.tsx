"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronRight, Download, Users, BookOpen, GitBranch } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Member {
  id: string
  fullName: string
  gender?: string
  birthDate?: string
  deathDate?: string
  occupation?: string
  spouseId?: string
  spouseName?: string
  parentId?: string
  childrenIds?: string[]
  generation: number
}

interface FamilyTreeSidebarProps {
  familyTreeId: string
}

export function FamilyTreeSidebar({ familyTreeId }: FamilyTreeSidebarProps) {
  const [activeTab, setActiveTab] = useState("genealogy")
  const [members, setMembers] = useState<Member[]>([])
  const [expandedNodes, setExpandedNodes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [jsonData, setJsonData] = useState("")
  const params = useParams()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/family-trees/${familyTreeId}/members/hierarchy`)

        if (!response.ok) {
          throw new Error("Failed to fetch family tree hierarchy")
        }

        const data = await response.json()
        setMembers(data)

        // Mặc định mở rộng thế hệ đầu tiên
        const rootMembers = data.filter((m: Member) => m.generation === 1).map((m: Member) => m.id)
        setExpandedNodes(rootMembers)

        // Chuẩn bị dữ liệu JSON cho phả đồ
        const treeData = prepareTreeData(data)
        setJsonData(JSON.stringify(treeData, null, 2))
      } catch (error) {
        console.error("Error fetching members:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [familyTreeId, toast])

  const prepareTreeData = (members: Member[]) => {
    // Tìm thành viên gốc (thế hệ 1)
    const rootMembers = members.filter((m) => m.generation === 1)

    // Hàm đệ quy để xây dựng cây
    const buildTree = (member: Member) => {
      const children = members.filter((m) => m.parentId === member.id)

      return {
        id: member.id,
        name: member.fullName,
        gender: member.gender,
        birthDate: member.birthDate ? new Date(member.birthDate).getFullYear() : null,
        deathDate: member.deathDate ? new Date(member.deathDate).getFullYear() : null,
        occupation: member.occupation,
        spouse: member.spouseName,
        children: children.map((child) => buildTree(child)),
      }
    }

    return rootMembers.map((root) => buildTree(root))
  }

  const toggleNode = (id: string) => {
    if (expandedNodes.includes(id)) {
      setExpandedNodes(expandedNodes.filter((nodeId) => nodeId !== id))
    } else {
      setExpandedNodes([...expandedNodes, id])
    }
  }

  const downloadJson = () => {
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "family-tree-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Thành công",
      description: "Đã tải xuống dữ liệu JSON",
    })
  }

  // Sắp xếp thành viên theo thế hệ và thứ tự
  const sortedMembers = [...members].sort((a, b) => {
    if (a.generation !== b.generation) {
      return a.generation - b.generation
    }
    return a.fullName.localeCompare(b.fullName)
  })

  // Lọc thành viên theo thế hệ
  const getChildrenOfMember = (parentId: string) => {
    return sortedMembers.filter((member) => member.parentId === parentId)
  }

  // Lấy thành viên thế hệ đầu tiên (không có parentId)
  const rootMembers = sortedMembers.filter((member) => !member.parentId)

  const renderMemberItem = (member: Member, level = 0) => {
    const children = getChildrenOfMember(member.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.includes(member.id)
    const isActive = params.memberId === member.id

    return (
      <div key={member.id} className="mb-1">
        <div className="flex items-start">
          <div className="flex items-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full"
                onClick={() => toggleNode(member.id)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          <Link
            href={`/dashboard/family-trees/${familyTreeId}/members/${member.id}`}
            className={cn(
              "flex-1 flex flex-col py-1 px-2 rounded-md hover:bg-muted/50 transition-colors",
              isActive && "bg-muted",
            )}
          >
            <div className="font-medium">{member.fullName}</div>
            <div className="text-xs text-muted-foreground">
              {member.birthDate && new Date(member.birthDate).getFullYear()}
              {member.birthDate && member.deathDate && " - "}
              {member.deathDate && new Date(member.deathDate).getFullYear()}
              {member.occupation && ` • ${member.occupation}`}
            </div>
            {member.spouseName && (
              <div className="text-xs text-muted-foreground mt-1">Vợ/Chồng: {member.spouseName}</div>
            )}
          </Link>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-6 pl-2 border-l border-dashed border-muted-foreground/30">
            {children.map((child) => renderMemberItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Kiểm tra xem đường dẫn hiện tại có phải là trang cây gia phả không
  const isTreePage = pathname.includes("/tree")

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2">
        <h2 className="text-lg font-semibold tracking-tight">Gia phả</h2>
        <p className="text-sm text-muted-foreground">Xem thông tin chi tiết về các thành viên</p>
      </div>
      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-3 py-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="genealogy">Phả hệ</TabsTrigger>
            <TabsTrigger value="diagram">Phả đồ</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <ScrollArea className="flex-1">
        {activeTab === "genealogy" ? (
          <div className="px-3 py-2">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            ) : rootMembers.length > 0 ? (
              <div className="space-y-1">{rootMembers.map((member) => renderMemberItem(member))}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium text-sm">Chưa có thành viên</h3>
                <p className="text-xs text-muted-foreground mt-1">Hãy thêm thành viên vào gia phả</p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2">
            <Link href={`/dashboard/family-trees/${familyTreeId}/tree`} className="block mb-4">
              <Button variant={isTreePage ? "default" : "outline"} className="w-full justify-start gap-2">
                <GitBranch className="h-4 w-4" />
                <span>Xem cây gia phả</span>
              </Button>
            </Link>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Dữ liệu JSON</h3>
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={downloadJson}>
                <Download className="h-3.5 w-3.5" />
                <span className="text-xs">Tải xuống</span>
              </Button>
            </div>
            <div className="bg-muted rounded-md p-2 overflow-auto max-h-[300px]">
              <pre className="text-xs whitespace-pre-wrap">{jsonData || "Không có dữ liệu"}</pre>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="px-3 py-2 mt-auto">
        <Link href={`/dashboard/family-trees/${familyTreeId}`}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Quay lại tổng quan</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
