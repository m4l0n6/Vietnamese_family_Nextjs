"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Users, GitBranch, CalendarDays } from "lucide-react"
import { AddMemberModal } from "@/components/add-member-modal"

interface FamilyTree {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

interface Member {
  id: string
  fullName: string
  gender: string
  birthYear?: string
  generation?: number
}

interface Statistics {
  totalMembers: number
  livingMembers: number
  deceasedMembers: number
  maleMembers: number
  femaleMembers: number
  generations: number
  events: number
}

export default function FamilyTreeDetailPage({ params }: { params: { id: string } }) {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch family tree details
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
        }

        // Fetch statistics
        const statsResponse = await fetch(`/api/family-trees/${params.id}/statistics`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStatistics(statsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleAddMemberSuccess = () => {
    // Refresh members list
    fetch(`/api/family-trees/${params.id}/members`)
      .then((response) => {
        if (response.ok) return response.json()
        throw new Error("Failed to fetch members")
      })
      .then((data) => {
        setMembers(data)
      })
      .catch((error) => {
        console.error("Error refreshing members:", error)
      })

    // Refresh statistics
    fetch(`/api/family-trees/${params.id}/statistics`)
      .then((response) => {
        if (response.ok) return response.json()
        throw new Error("Failed to fetch statistics")
      })
      .then((data) => {
        setStatistics(data)
      })
      .catch((error) => {
        console.error("Error refreshing statistics:", error)
      })
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
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Không tìm thấy gia phả</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/family-trees">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{familyTree.name}</h1>
            <p className="text-muted-foreground">{familyTree.description}</p>
          </div>
        </div>
        <Button onClick={() => setIsAddMemberModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm thành viên
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Thống kê */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số thành viên</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalMembers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Nam: {statistics?.maleMembers || 0}, Nữ: {statistics?.femaleMembers || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Còn sống</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.livingMembers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.totalMembers
                    ? Math.round((statistics.livingMembers / statistics.totalMembers) * 100)
                    : 0}
                  % tổng số thành viên
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Số đời</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.generations || 0}</div>
                <p className="text-xs text-muted-foreground">Thế hệ</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sự kiện</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.events || 0}</div>
                <p className="text-xs text-muted-foreground">Sự kiện đã ghi nhận</p>
              </CardContent>
            </Card>
          </div>

          {/* Các liên kết nhanh */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Phả hệ</CardTitle>
                <CardDescription>Xem danh sách thành viên theo thế hệ</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/family-trees/${params.id}/genealogy`)}
                >
                  Xem phả hệ
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Phả đồ</CardTitle>
                <CardDescription>Xem sơ đồ gia phả dạng cây</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/family-trees/${params.id}/tree`)}
                >
                  Xem phả đồ
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sự kiện</CardTitle>
                <CardDescription>Quản lý các sự kiện của dòng họ</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/family-trees/${params.id}/events`)}
                >
                  Xem sự kiện
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Danh sách thành viên gần đây */}
          <Card>
            <CardHeader>
              <CardTitle>Thành viên gần đây</CardTitle>
              <CardDescription>Các thành viên mới được thêm vào gia phả</CardDescription>
            </CardHeader>
            <CardContent>
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div className="font-medium">{member.fullName}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-muted-foreground">
                          {member.gender === "MALE" ? "Nam" : member.gender === "FEMALE" ? "Nữ" : "Khác"}
                          {member.birthYear ? `, ${member.birthYear}` : ""}
                          {member.generation ? `, Đời ${member.generation}` : ""}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/family-trees/${params.id}/members/${member.id}`)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => router.push(`/dashboard/family-trees/${params.id}/genealogy`)}
                    >
                      Xem tất cả {members.length} thành viên
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">Chưa có thành viên</h3>
                  <p className="text-sm text-muted-foreground mt-1">Hãy thêm thành viên đầu tiên vào gia phả</p>
                  <Button className="mt-4" onClick={() => setIsAddMemberModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm thành viên
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        familyTreeId={params.id}
        onSuccess={handleAddMemberSuccess}
        members={members}
        isFirstMember={members.length === 0}
      />
    </div>
  )
}
