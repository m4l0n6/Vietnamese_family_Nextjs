"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Users, Calendar, Heart, FileText, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { AddMemberModal } from "@/components/add-member-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FamilyTreeHierarchy } from "@/components/family-tree/family-tree-hierarchy"
import { ImprovedTreeVisualization } from "@/components/family-tree/improved-tree-visualization"

interface FamilyTree {
  id: string
  name: string
  description?: string
  origin?: string
  foundingYear?: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface Member {
  id: string
  fullName: string
  gender: string
  birthYear?: string
  birthDate?: string
  birthPlace?: string
  deathDate?: string
  deathPlace?: string
  isAlive?: boolean
  generation?: number
  role?: string
  fatherId?: string
  motherId?: string
  spouseId?: string
  childrenIds?: string[]
}

interface Statistics {
  totalMembers: number
  livingMembers: number
  deceasedMembers: number
  totalEvents: number
}

export default function FamilyTreePage({ params }: { params: { id: string } }) {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("members")
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statistics, setStatistics] = useState<Statistics>({
    totalMembers: 0,
    livingMembers: 0,
    deceasedMembers: 0,
    totalEvents: 0,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch family tree
        const treeResponse = await fetch(`/api/family-trees/${params.id}`)
        if (!treeResponse.ok) {
          throw new Error("Failed to fetch family tree")
        }
        const treeData = await treeResponse.json()
        setFamilyTree(treeData)

        // Fetch members
        const membersResponse = await fetch(`/api/family-trees/${params.id}/members`)
        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          setMembers(membersData)

          // Tính toán thống kê từ dữ liệu thành viên
          const livingMembers = membersData.filter((member: Member) => member.isAlive !== false).length
          const deceasedMembers = membersData.filter((member: Member) => member.isAlive === false).length

          // Fetch số lượng sự kiện
          const eventsResponse = await fetch(`/api/family-trees/${params.id}/events`)
          let totalEvents = 0
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json()
            totalEvents = eventsData.length
          }

          setStatistics({
            totalMembers: membersData.length,
            livingMembers,
            deceasedMembers,
            totalEvents,
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleAddMember = async () => {
    await fetchMembers()
    setIsAddMemberModalOpen(false)
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/family-trees/${params.id}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)

        // Cập nhật thống kê
        const livingMembers = data.filter((member: Member) => member.isAlive !== false).length
        const deceasedMembers = data.filter((member: Member) => member.isAlive === false).length

        setStatistics((prev) => ({
          ...prev,
          totalMembers: data.length,
          livingMembers,
          deceasedMembers,
        }))
      }
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const handleDeleteFamilyTree = async () => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/family-trees/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete family tree")
      }

      toast({
        title: "Thành công",
        description: "Gia phả đã được xóa thành công",
      })

      router.push("/dashboard/family-trees")
    } catch (error) {
      console.error("Error deleting family tree:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa gia phả",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!familyTree) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Không tìm thấy gia phả</p>
        <Button asChild>
          <Link href="/dashboard/family-trees">Quay lại danh sách gia phả</Link>
        </Button>
      </div>
    )
  }

  const isFirstMember = members.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/family-trees">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{familyTree.name}</h1>
            <p className="text-muted-foreground">
              {familyTree.origin ? `Xuất đinh: ${familyTree.origin}` : "Chưa cập nhật xuất đinh"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/family-trees/${params.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Gia phả này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteFamilyTree} disabled={deleteLoading}>
                  {deleteLoading ? "Đang xử lý..." : "Xóa"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tổng số thành viên</p>
                <h3 className="text-3xl font-bold mt-2">{statistics.totalMembers}</h3>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Thành viên còn sống</p>
                <h3 className="text-3xl font-bold mt-2">{statistics.livingMembers}</h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <Heart className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Thành viên đã mất</p>
                <h3 className="text-3xl font-bold mt-2">{statistics.deceasedMembers}</h3>
              </div>
              <div className="bg-gray-500/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tổng số sự kiện</p>
                <h3 className="text-3xl font-bold mt-2">{statistics.totalEvents}</h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="members">Thành viên</TabsTrigger>
            <TabsTrigger value="genealogy">Phả đồ</TabsTrigger>
            <TabsTrigger value="events">Sự kiện</TabsTrigger>
          </TabsList>
        </Tabs>
        {activeTab === "members" && (
          <Button onClick={() => setIsAddMemberModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm thành viên
          </Button>
        )}
        {activeTab === "events" && (
          <Button asChild>
            <Link href={`/dashboard/family-trees/${params.id}/events/create`}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sự kiện
            </Link>
          </Button>
        )}
      </div>

      <TabsContent value="members" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thành viên</CardTitle>
            <CardDescription>Quản lý thông tin các thành viên trong gia phả</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <FamilyTreeHierarchy familyTreeId={params.id} members={members} onMemberUpdated={fetchMembers} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Chưa có thành viên nào trong gia phả</p>
                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thành viên đầu tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="genealogy" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Phả đồ</CardTitle>
            <CardDescription>Biểu diễn trực quan mối quan hệ giữa các thành viên</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <div className="h-[600px] w-full">
                <ImprovedTreeVisualization familyTreeId={params.id} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Chưa có thành viên nào trong gia phả</p>
                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thành viên đầu tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="events" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Sự kiện</CardTitle>
            <CardDescription>Quản lý các sự kiện quan trọng của gia phả</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {statistics.totalEvents > 0
                  ? "Tính năng hiển thị sự kiện đang được phát triển"
                  : "Chưa có sự kiện nào trong gia phả"}
              </p>
              <Button asChild>
                <Link href={`/dashboard/family-trees/${params.id}/events/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sự kiện mới
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        familyTreeId={params.id}
        onSuccess={handleAddMember}
        members={members}
        isFirstMember={isFirstMember}
      />
    </div>
  )
}
