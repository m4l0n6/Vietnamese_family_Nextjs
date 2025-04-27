"use client"

import { useState } from "react"
import FamilyTreeVisualization from "@/components/family-tree-visualization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Share2, Edit } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Dữ liệu mẫu cho gia phả
const sampleFamilyData = {
  id: "1",
  name: "Nguyễn Văn Tổ",
  birthYear: "1920",
  deathYear: "2000",
  gender: "male" as const,
  avatarUrl: "/placeholder.svg?height=48&width=48",
  children: [
    {
      id: "2",
      name: "Nguyễn Văn Con",
      birthYear: "1945",
      deathYear: "2015",
      gender: "male" as const,
      avatarUrl: "/placeholder.svg?height=48&width=48",
      children: [
        {
          id: "5",
          name: "Nguyễn Văn Cháu 1",
          birthYear: "1970",
          gender: "male" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
          children: [
            {
              id: "8",
              name: "Nguyễn Văn Chắt 1",
              birthYear: "1995",
              gender: "male" as const,
              avatarUrl: "/placeholder.svg?height=48&width=48",
            },
            {
              id: "9",
              name: "Nguyễn Thị Chắt 2",
              birthYear: "1997",
              gender: "female" as const,
              avatarUrl: "/placeholder.svg?height=48&width=48",
            },
            {
              id: "10",
              name: "Nguyễn Văn Chắt 3",
              birthYear: "2000",
              gender: "male" as const,
              avatarUrl: "/placeholder.svg?height=48&width=48",
            },
          ],
        },
        {
          id: "6",
          name: "Nguyễn Thị Cháu 2",
          birthYear: "1972",
          gender: "female" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
        {
          id: "7",
          name: "Nguyễn Văn Cháu 3",
          birthYear: "1975",
          gender: "male" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
      ],
    },
    {
      id: "3",
      name: "Nguyễn Thị Con",
      birthYear: "1950",
      gender: "female" as const,
      avatarUrl: "/placeholder.svg?height=48&width=48",
      children: [
        {
          id: "11",
          name: "Trần Văn Cháu 1",
          birthYear: "1975",
          gender: "male" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
        {
          id: "12",
          name: "Trần Thị Cháu 2",
          birthYear: "1978",
          gender: "female" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
      ],
    },
    {
      id: "4",
      name: "Nguyễn Văn Con 3",
      birthYear: "1955",
      gender: "male" as const,
      avatarUrl: "/placeholder.svg?height=48&width=48",
      children: [
        {
          id: "13",
          name: "Nguyễn Văn Cháu 4",
          birthYear: "1980",
          gender: "male" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
        {
          id: "14",
          name: "Nguyễn Thị Cháu 5",
          birthYear: "1982",
          gender: "female" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
        {
          id: "15",
          name: "Nguyễn Văn Cháu 6",
          birthYear: "1985",
          gender: "male" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
        {
          id: "16",
          name: "Nguyễn Thị Cháu 7",
          birthYear: "1988",
          gender: "female" as const,
          avatarUrl: "/placeholder.svg?height=48&width=48",
        },
      ],
    },
  ],
}

export default function FamilyTreePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("tree")

  // Giả lập dữ liệu gia phả
  const family = {
    id: params.id,
    name: "Gia phả họ Nguyễn",
    origin: "Hà Nam",
    foundingYear: 1750,
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/family">Gia phả</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/family/${params.id}`}>{family.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Cây gia phả</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{family.name} - Cây gia phả</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              <span>Xuất PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span>Chia sẻ</span>
            </Button>
            <Button size="sm" className="gap-1">
              <Edit className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tree">Cây gia phả</TabsTrigger>
            <TabsTrigger value="vertical">Cây dọc</TabsTrigger>
            <TabsTrigger value="horizontal">Cây ngang</TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cây gia phả</CardTitle>
                <CardDescription>
                  Hiển thị cấu trúc gia phả theo dạng cây. Kéo để di chuyển, cuộn để phóng to/thu nhỏ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FamilyTreeVisualization data={sampleFamilyData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vertical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cây gia phả dọc</CardTitle>
                <CardDescription>Hiển thị cấu trúc gia phả theo chiều dọc từ trên xuống dưới.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center p-12 border rounded-lg bg-muted/20 h-[600px]">
                  <p className="text-muted-foreground">Chức năng đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horizontal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cây gia phả ngang</CardTitle>
                <CardDescription>Hiển thị cấu trúc gia phả theo chiều ngang từ trái sang phải.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center p-12 border rounded-lg bg-muted/20 h-[600px]">
                  <p className="text-muted-foreground">Chức năng đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Chú thích */}
        <Card>
          <CardHeader>
            <CardTitle>Chú thích</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-200 dark:bg-blue-950 dark:border-blue-800"></div>
                <span className="text-sm">Nam</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-100 border border-pink-200 dark:bg-pink-950 dark:border-pink-800"></div>
                <span className="text-sm">Nữ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:border-gray-700"></div>
                <span className="text-sm">Khác</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

