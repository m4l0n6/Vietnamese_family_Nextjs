"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Calendar, Heart, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

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

interface Statistics {
  totalMembers: number
  livingMembers: number
  deceasedMembers: number
  totalEvents: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalMembers: 0,
    livingMembers: 0,
    deceasedMembers: 0,
    totalEvents: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch family trees
        const treesResponse = await fetch("/api/family-trees")
        if (!treesResponse.ok) {
          throw new Error("Failed to fetch family trees")
        }
        const treesData = await treesResponse.json()
        setFamilyTrees(treesData)

        // Fetch statistics
        const statsResponse = await fetch("/api/statistics")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStatistics(statsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
          <p className="text-muted-foreground">Xin chào, {session?.user?.name}! Quản lý gia phả của bạn.</p>
        </div>
        <Link href="/dashboard/family-trees/create">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Tạo gia phả mới</span>
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tổng số thành viên</p>
                <h3 className="text-3xl font-bold mt-2">{loading ? "..." : statistics.totalMembers}</h3>
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
                <h3 className="text-3xl font-bold mt-2">{loading ? "..." : statistics.livingMembers}</h3>
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
                <h3 className="text-3xl font-bold mt-2">{loading ? "..." : statistics.deceasedMembers}</h3>
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
                <h3 className="text-3xl font-bold mt-2">{loading ? "..." : statistics.totalEvents}</h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gia phả của tôi</CardTitle>
            <CardDescription>Quản lý các gia phả mà bạn đã tạo hoặc được mời tham gia</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {familyTrees.length > 0 ? (
                  <>
                    {familyTrees.map((tree) => (
                      <Link href={`/dashboard/family-trees/${tree.id}`} key={tree.id}>
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
                          <div className="relative h-36 w-full">
                            <Image
                              src="/placeholder.svg?height=200&width=300"
                              alt={tree.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium">{tree.name}</h3>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-1" />
                              <span>Xuất đinh: {tree.origin || "Chưa cập nhật"}</span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <span>Cập nhật: {new Date(tree.updatedAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                ) : null}

                <Link href="/dashboard/family-trees/create">
                  <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 h-full min-h-[200px]">
                    <div className="bg-primary/10 p-3 rounded-full mb-3">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium text-center">Tạo gia phả mới</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Bắt đầu xây dựng gia phả mới cho dòng họ của bạn
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

