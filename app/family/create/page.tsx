"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useToast } from "@/hooks/use-toast"

export default function CreateFamilyTreePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    origin: "",
    foundingYear: "",
    isPublic: false,
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/family-trees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          origin: formData.origin,
          foundingYear: formData.foundingYear ? Number.parseInt(formData.foundingYear) : null,
          isPublic: formData.isPublic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể tạo gia phả")
      }

      toast({
        title: "Thành công",
        description: "Gia phả đã được tạo thành công",
      })

      router.push(`/family/${data.id}`)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Tạo gia phả mới</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tạo gia phả mới</h1>
            <p className="text-muted-foreground mt-2">Nhập thông tin cơ bản để bắt đầu xây dựng gia phả của bạn</p>
          </div>

          {/* Form */}
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Thông tin gia phả</CardTitle>
                <CardDescription>Nhập các thông tin cơ bản về gia phả của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên gia phả <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Gia phả họ Nguyễn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn về gia phả của bạn"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Xuất đinh</Label>
                    <Input
                      id="origin"
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      placeholder="Ví dụ: Hà Nam"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foundingYear">Năm thành lập</Label>
                    <Input
                      id="foundingYear"
                      name="foundingYear"
                      type="number"
                      value={formData.foundingYear}
                      onChange={handleChange}
                      placeholder="Ví dụ: 1750"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="isPublic" checked={formData.isPublic} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isPublic">Công khai gia phả</Label>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    Gia phả công khai sẽ hiển thị trong mục khám phá và có thể được tìm kiếm bởi người dùng khác. Bạn
                    vẫn có thể thay đổi cài đặt này sau.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Tạo gia phả"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
