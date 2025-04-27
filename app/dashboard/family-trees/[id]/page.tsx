"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Users, Calendar, MapPin, BookOpen, GitBranch } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
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
  firstName: string
  middleName?: string
  lastName: string
  gender?: string
  birthDate?: string
  birthPlace?: string
  deathDate?: string
  deathPlace?: string
  biography?: string
  image?: string
  createdAt: string
  updatedAt: string
  fullName?: string
  generation?: number
  birthYear?: number
  isAlive?: boolean
}

export default function FamilyTreeDetailPage({ params }: { params: { id: string } }) {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchFamilyTree = async () => {
      try {
        const response = await fetch(`/api/family-trees/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch family tree")
        }

        const data = await response.json()
        setFamilyTree(data)
      } catch (error) {
        console.error("Error fetching family tree:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/family-trees/${params.id}/members`)

        if (!response.ok) {
          throw new Error("Failed to fetch members")
        }

        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error("Error fetching members:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách thành viên",
          variant: "destructive",
        })
      } finally {
        setMembersLoading(false)
      }
    }

    fetchFamilyTree()
    fetchMembers()
  }, [params.id, toast])

  const handleDeleteFamilyTree = async () => {
    try {
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

      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting family tree:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa gia phả",
        variant: "destructive",
      })
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">Không tìm thấy gia phả</h3>
        <p className="text-muted-foreground mt-1 mb-4">Gia phả này không tồn tại hoặc bạn không có quyền truy cập</p>
        <Link href="/dashboard">
          <Button>Quay lại bảng điều khiển</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{familyTree.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
            {familyTree.origin && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Xuất đinh: {familyTree.origin}</span>
              </div>
            )}
            {familyTree.foundingYear && (
              <div className="flex items-center ml-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Năm thành lập: {familyTree.foundingYear}</span>
              </div>
            )}
            <Badge variant={familyTree.isPublic ? "default" : "outline"} className="ml-4">
              {familyTree.isPublic ? "Công khai" : "Riêng tư"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/family-trees/${params.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1">
                <Trash2 className="h-4 w-4" />
                <span>Xóa</span>
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
                <AlertDialogAction onClick={handleDeleteFamilyTree}>Xóa</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-[200px] md:h-[300px] w-full rounded-lg overflow-hidden">
        <Image src="/placeholder.svg?height=400&width=800" alt={familyTree.name} fill className="object-cover" />
      </div>

      {/* Description */}
      {familyTree.description && (
        <Card>
          <CardHeader>
            <CardTitle>Giới thiệu</CardTitle>
            <CardDescription>Thông tin chung về dòng họ</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{familyTree.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tổng quan */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan gia phả</CardTitle>
          <CardDescription>Thông tin cơ bản và các tính năng chính</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Phả hệ</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Xem danh sách các thành viên trong gia phả theo thứ tự thế hệ, với đầy đủ thông tin về mối quan hệ.
              </p>
              <Link href={`/dashboard/family-trees/${params.id}/genealogy?tab=generations`}>
                <Button variant="outline" className="w-full">
                  Xem phả hệ
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-6 bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Phả đồ</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Xem cấu trúc gia phả dưới dạng sơ đồ cây, hiển thị trực quan mối quan hệ giữa các thành viên.
              </p>
              <Link href={`/dashboard/family-trees/${params.id}/genealogy?tab=tree-diagram`}>
                <Button variant="outline" className="w-full">
                  Xem phả đồ
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-6 bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Sự kiện</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Quản lý các sự kiện quan trọng trong lịch sử gia đình như ngày giỗ, ngày cưới, sinh nhật...
              </p>
              <Link href={`/dashboard/family-trees/${params.id}/events`}>
                <Button variant="outline" className="w-full">
                  Xem sự kiện
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thành viên */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách thành viên</CardTitle>
            <CardDescription>Tất cả thành viên trong gia phả</CardDescription>
          </div>
          <Link href={`/dashboard/family-trees/${params.id}/members/create`}>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span>Thêm thành viên</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.slice(0, 6).map((member) => (
                <Link href={`/dashboard/family-trees/${params.id}/members/${member.id}`} key={member.id}>
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={member.image || `/placeholder.svg?height=50&width=50`}
                        alt={member.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>Đời {member.generation || "?"}</span>
                        <span>•</span>
                        <span>
                          {member.birthDate ? new Date(member.birthDate).getFullYear() : member.birthYear || "?"}
                          {(member.deathDate || member.birthDate) && (member.deathDate || !member.isAlive) && " - "}
                          {member.deathDate && new Date(member.deathDate).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">Chưa có thành viên nào</h3>
              <p className="text-muted-foreground mt-1 mb-4">Hãy thêm thành viên đầu tiên vào gia phả của bạn</p>
              <Link href={`/dashboard/family-trees/${params.id}/members/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </Button>
              </Link>
            </div>
          )}
          {members.length > 6 && (
            <div className="mt-4 text-center">
              <Link href={`/dashboard/family-trees/${params.id}/members`}>
                <Button variant="outline">Xem tất cả thành viên ({members.length})</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

