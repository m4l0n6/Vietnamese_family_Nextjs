"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users, Calendar, MapPin } from "lucide-react"
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

export default function FamilyTreesPage() {
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchFamilyTrees = async () => {
      try {
        const response = await fetch("/api/family-trees")

        if (!response.ok) {
          throw new Error("Failed to fetch family trees")
        }

        const data = await response.json()
        setFamilyTrees(data)
      } catch (error) {
        console.error("Error fetching family trees:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFamilyTrees()
  }, [toast])

  const filteredFamilyTrees = familyTrees.filter((tree) => tree.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gia phả của tôi</h1>
          <p className="text-muted-foreground">Quản lý tất cả gia phả của bạn</p>
        </div>
        <Link href="/dashboard/family-trees/create">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Tạo gia phả mới</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gia phả</CardTitle>
          <CardDescription>Tất cả gia phả mà bạn đã tạo hoặc được mời tham gia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm gia phả..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : filteredFamilyTrees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFamilyTrees.map((tree) => (
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
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Xuất đinh: {tree.origin || "Chưa cập nhật"}</span>
                      </div>
                      {tree.foundingYear && (
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Năm thành lập: {tree.foundingYear}</span>
                        </div>
                      )}
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Cập nhật: {new Date(tree.updatedAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/dashboard/family-trees/create">
                <div className="border border-dashed rounded-lg flex flex-col items-center justify-center p-6 h-full">
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-center">Tạo gia phả mới</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Bắt đầu xây dựng gia phả mới cho dòng họ của bạn
                  </p>
                  <Button className="mt-4" size="sm">
                    Tạo mới
                  </Button>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">Chưa có gia phả nào</h3>
              <p className="text-muted-foreground mt-1 mb-4">Bạn chưa tạo hoặc được mời tham gia gia phả nào</p>
              <Link href="/dashboard/family-trees/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo gia phả mới
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

