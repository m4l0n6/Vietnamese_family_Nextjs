"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

interface FamilyTree {
  id: string
  name: string
}

interface Member {
  id: string
  fullName: string
  gender?: string
  birthYear?: string
  birthDate?: string
  deathYear?: string
  deathDate?: string
  role?: string
  generation?: string
  fatherId?: string
  motherId?: string
  spouseId?: string
  occupation?: string
  birthPlace?: string
  deathPlace?: string
  notes?: string
  image?: string
  isAlive?: boolean
  parentId?: string // Deprecated, use fatherId and motherId instead
}

export default function EditMemberPage({ params }: { params: { id: string; memberId: string } }) {
  const [loading, setLoading] = useState(false)
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    birthYear: "",
    birthDate: null as Date | null,
    birthDateInput: "",
    deathYear: "",
    deathDate: null as Date | null,
    deathDateInput: "",
    role: "",
    generation: "",
    fatherId: "",
    motherId: "",
    spouseId: "",
    occupation: "",
    birthPlace: "",
    deathPlace: "",
    notes: "",
    isAlive: true,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch family tree
        const treeResponse = await fetch(`/api/family-trees/${params.id}`)
        if (!treeResponse.ok) {
          throw new Error("Failed to fetch family tree")
        }
        const treeData = await treeResponse.json()
        setFamilyTree(treeData)

        // Fetch member
        const memberResponse = await fetch(`/api/family-trees/${params.id}/members/${params.memberId}`)
        if (!memberResponse.ok) {
          throw new Error("Failed to fetch member")
        }
        const memberData = await memberResponse.json()
        setMember(memberData)

        // Fetch all members for parent and spouse selection
        const membersResponse = await fetch(`/api/family-trees/${params.id}/members`)
        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          // Filter out the current member
          setMembers(membersData.filter((m: Member) => m.id !== params.memberId))
        }

        // Format dates for display
        let birthDateInput = ""
        if (memberData.birthDate) {
          const birthDate = new Date(memberData.birthDate)
          const day = birthDate.getDate().toString().padStart(2, "0")
          const month = (birthDate.getMonth() + 1).toString().padStart(2, "0")
          const year = birthDate.getFullYear()
          birthDateInput = `${day}-${month}-${year}`
        }

        let deathDateInput = ""
        if (memberData.deathDate) {
          const deathDate = new Date(memberData.deathDate)
          const day = deathDate.getDate().toString().padStart(2, "0")
          const month = (deathDate.getMonth() + 1).toString().padStart(2, "0")
          const year = deathDate.getFullYear()
          deathDateInput = `${day}-${month}-${year}`
        }

        // Set form data
        setFormData({
          fullName: memberData.fullName || "",
          gender: memberData.gender || "",
          birthYear: memberData.birthYear || "",
          birthDate: memberData.birthDate ? new Date(memberData.birthDate) : null,
          birthDateInput: birthDateInput,
          deathYear: memberData.deathYear || "",
          deathDate: memberData.deathDate ? new Date(memberData.deathDate) : null,
          deathDateInput: deathDateInput,
          role: memberData.role || "",
          generation: memberData.generation || "",
          fatherId: memberData.fatherId || "none",
          motherId: memberData.motherId || "none",
          spouseId: memberData.spouseId || "none",
          occupation: memberData.occupation || "",
          birthPlace: memberData.birthPlace || "",
          deathPlace: memberData.deathPlace || "",
          notes: memberData.notes || "",
          isAlive: memberData.isAlive !== undefined ? memberData.isAlive : true,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin thành viên",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [params.id, params.memberId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAlive: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/family-trees/${params.id}/members/${params.memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Không thể cập nhật thành viên")
      }

      toast({
        title: "Thành công",
        description: "Thành viên đã được cập nhật thành công",
      })

      router.push(`/dashboard/family-trees/${params.id}/members/${params.memberId}`)
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

  if (!familyTree || !member) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/family-trees/${params.id}/members/${params.memberId}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa thành viên</h1>
          <p className="text-muted-foreground">
            Chỉnh sửa thông tin thành viên {member.fullName} trong gia phả {familyTree.name}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Thông tin thành viên</CardTitle>
            <CardDescription>Cập nhật thông tin cơ bản về thành viên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin cơ bản</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên đầy đủ"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Giới tính <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthYear">
                      Năm sinh <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="birthYear"
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleChange}
                      placeholder="Nhập năm sinh"
                      type="number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Ngày sinh đầy đủ</Label>
                    <div className="flex flex-col space-y-1">
                      <Input
                        id="birthDateInput"
                        name="birthDateInput"
                        type="text"
                        placeholder="dd-mm-yyyy"
                        value={formData.birthDateInput || ""}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, birthDateInput: e.target.value }))
                          // Parse date from string input
                          const parts = e.target.value.split("-")
                          if (parts.length === 3) {
                            const day = Number.parseInt(parts[0], 10)
                            const month = Number.parseInt(parts[1], 10) - 1 // JS months are 0-indexed
                            const year = Number.parseInt(parts[2], 10)
                            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                              const date = new Date(year, month, day)
                              handleDateChange("birthDate", date)
                            }
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Định dạng dd-mm-yyyy (ngày-tháng-năm)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace">
                    Nơi sinh <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthPlace"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    placeholder="Nhập nơi sinh"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="isAlive" checked={formData.isAlive} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isAlive">Còn sống</Label>
                </div>

                {!formData.isAlive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deathYear">Năm mất</Label>
                      <Input
                        id="deathYear"
                        name="deathYear"
                        value={formData.deathYear}
                        onChange={handleChange}
                        placeholder="Nhập năm mất"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deathDate">Ngày mất đầy đủ</Label>
                      <div className="flex flex-col space-y-1">
                        <Input
                          id="deathDateInput"
                          name="deathDateInput"
                          type="text"
                          placeholder="dd-mm-yyyy"
                          value={formData.deathDateInput || ""}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, deathDateInput: e.target.value }))
                            // Parse date from string input
                            const parts = e.target.value.split("-")
                            if (parts.length === 3) {
                              const day = Number.parseInt(parts[0], 10)
                              const month = Number.parseInt(parts[1], 10) - 1 // JS months are 0-indexed
                              const year = Number.parseInt(parts[2], 10)
                              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                const date = new Date(year, month, day)
                                handleDateChange("deathDate", date)
                              }
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground">Định dạng dd-mm-yyyy (ngày-tháng-năm)</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="generation">
                      Đời (Thế hệ) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="generation"
                      name="generation"
                      value={formData.generation}
                      onChange={handleChange}
                      placeholder="Ví dụ: 1, 2, 3, ..."
                      type="number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Vai trò trong gia đình</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="Ví dụ: Con trưởng, Con thứ, ..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quan hệ gia đình */}
            <div>
              <h3 className="text-lg font-medium mb-4">Quan hệ gia đình</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherId">Cha</Label>
                  <Select value={formData.fatherId} onValueChange={(value) => handleSelectChange("fatherId", value)}>
                    <SelectTrigger id="fatherId">
                      <SelectValue placeholder="Chọn cha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {members
                        .filter((member) => member.gender === "MALE")
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherId">Mẹ</Label>
                  <Select value={formData.motherId} onValueChange={(value) => handleSelectChange("motherId", value)}>
                    <SelectTrigger id="motherId">
                      <SelectValue placeholder="Chọn mẹ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {members
                        .filter((member) => member.gender === "FEMALE")
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouseId">Vợ/Chồng</Label>
                  <Select value={formData.spouseId} onValueChange={(value) => handleSelectChange("spouseId", value)}>
                    <SelectTrigger id="spouseId">
                      <SelectValue placeholder="Chọn vợ/chồng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin bổ sung</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Nghề nghiệp</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Nhập nghề nghiệp"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">Nơi sinh</Label>
                    <Input
                      id="birthPlace"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleChange}
                      placeholder="Nhập nơi sinh"
                    />
                  </div>
                  {!formData.isAlive && (
                    <div className="space-y-2">
                      <Label htmlFor="deathPlace">Nơi mất</Label>
                      <Input
                        id="deathPlace"
                        name="deathPlace"
                        value={formData.deathPlace}
                        onChange={handleChange}
                        placeholder="Nhập nơi mất"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú khác</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Nhập ghi chú khác (đóng góp cho dòng họ, danh hiệu đặc biệt,...)"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/family-trees/${params.id}/members/${params.memberId}`)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

