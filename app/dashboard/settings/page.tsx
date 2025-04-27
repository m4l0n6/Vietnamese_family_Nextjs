"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Shield } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground">Quản lý cài đặt tài khoản và tùy chọn của bạn</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hồ sơ</CardTitle>
              <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Thông tin cá nhân</h3>
                    <p className="text-sm text-muted-foreground">Cập nhật tên, email và ảnh đại diện của bạn</p>
                  </div>
                  <Link href="/dashboard/settings/profile">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Cập nhật mật khẩu đăng nhập của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Mật khẩu</h3>
                    <p className="text-sm text-muted-foreground">Thay đổi mật khẩu đăng nhập của bạn</p>
                  </div>
                  <Link href="/dashboard/settings/password">
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Tùy chọn thông báo</h3>
                    <p className="text-sm text-muted-foreground">Cài đặt loại thông báo bạn muốn nhận</p>
                  </div>
                  <Link href="/dashboard/settings/notifications">
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Cài đặt
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
              <CardDescription>Quản lý các cài đặt bảo mật cho tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Phiên đăng nhập</h3>
                    <p className="text-sm text-muted-foreground">Quản lý các phiên đăng nhập của bạn</p>
                  </div>
                  <Link href="/dashboard/settings/security">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Quản lý
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

