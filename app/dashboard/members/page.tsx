"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Member {
  id: string
  fullName: string
  lastName: string
  gender?: string
  birthDate?: string
  deathDate?: string
  isAlive?: boolean
  familyTreeId: string
  familyTreeName: string
}

export default function MembersPage() {
  const { data: session } = useSession()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members")

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
        setLoading(false)
      }
    }

    fetchMembers()
  }, [toast])

  const filteredMembers = members.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.familyTreeName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách thành viên</h1>
          <p className="text-muted-foreground">Quản lý tất cả thành viên trong các gia phả của bạn</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm thành viên..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả thành viên</CardTitle>
          <CardDescription>Danh sách tất cả thành viên trong các gia phả của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Giới tính</TableHead>
                    <TableHead>Ngày sinh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Gia phả</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src={`/placeholder.svg?height=32&width=32`}
                              alt={`${member.lastName} ${member.fullName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span>{member.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.gender === "MALE" ? "Nam" : member.gender === "FEMALE" ? "Nữ" : "Khác"}
                      </TableCell>
                      <TableCell>
                        {member.birthDate ? new Date(member.birthDate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                      </TableCell>
                      <TableCell>
                        {member.isAlive ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                            Còn sống
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">
                            Đã mất
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/family-trees/${member.familyTreeId}`}
                          className="text-primary hover:underline"
                        >
                          {member.familyTreeName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/family-trees/${member.familyTreeId}/members/${member.id}`}>
                          <Button variant="outline" size="sm">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">Chưa có thành viên nào</h3>
              <p className="text-muted-foreground mt-1 mb-4">Bạn chưa có thành viên nào trong các gia phả của mình</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

