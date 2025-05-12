"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { uploadToBlob } from "@/lib/blob"
import Image from "next/image"

interface Member {
  id: string
  fullName: string
  gender: string
  birthYear?: string
  birthDate?: string
  birthDateLunar?: string
  birthPlace?: string
  deathYear?: string
  deathDate?: string
  deathDateLunar?: string
  deathPlace?: string
  role?: string
  generation?: string
  fatherId?: string
  motherId?: string
  spouseId?: string
  occupation?: string
  notes?: string
  isAlive?: boolean
  hometown?: string
  ethnicity?: string
  nationality?: string
  religion?: string
  title?: string
  image?: string
}

interface EditMemberModalProps {
  isOpen: boolean
  onClose: () => void
  familyTreeId: string
  memberId: string
  onSuccess: () => void
  members: Member[]
}

export function EditMemberModal({ isOpen, onClose, familyTreeId, memberId, onSuccess, members }: EditMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [member, setMember] = useState<Member | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const currentYear = new Date().getFullYear()

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    birthYear: "",
    birthDate: null as Date | null,
    birthDateInput: "",
    birthDateLunar: "",
    deathYear: "",
    deathDate: null as Date | null,
    deathDateInput: "",
    deathDateLunar: "",
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
    hometown: "",
    ethnicity: "",
    nationality: "",
    religion: "",
    title: "",
    image: "",
  })

  useEffect(() => {
    if (isOpen && memberId) {
      const fetchMember = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/family-trees/${familyTreeId}/members/${memberId}`)
          if (!response.ok) {
            throw new Error("Failed to fetch member")
          }
          const data = await response.json()
          setMember(data)

          // Format dates for display
          let birthDateInput = ""
          if (data.birthDate) {
            const birthDate = new Date(data.birthDate)
            const day = birthDate.getDate().toString().padStart(2, "0")
            const month = (birthDate.getMonth() + 1).toString().padStart(2, "0")
            const year = birthDate.getFullYear()
            birthDateInput = `${day}-${month}-${year}`
          }

          let deathDateInput = ""
          if (data.deathDate) {
            const deathDate = new Date(data.deathDate)
            const day = deathDate.getDate().toString().padStart(2, "0")
            const month = (deathDate.getMonth() + 1).toString().padStart(2, "0")
            const year = deathDate.getFullYear()
            deathDateInput = `${day}-${month}-${year}`
          }

          // Set image preview if exists
          if (data.image) {
            setImagePreview(data.image)
          } else {
            setImagePreview(null)
          }

          // Set form data
          setFormData({
            fullName: data.fullName || "",
            gender: data.gender || "",
            birthYear: data.birthYear || "",
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            birthDateInput: birthDateInput,
            birthDateLunar: data.birthDateLunar || "",
            deathYear: data.deathYear || "",
            deathDate: data.deathDate ? new Date(data.deathDate) : null,
            deathDateInput: deathDateInput,
            deathDateLunar: data.deathDateLunar || "",
            role: data.role || "",
            generation: data.generation?.toString() || "",
            fatherId: data.fatherId || "",
            motherId: data.motherId || "",
            spouseId: data.spouseId || "",
            occupation: data.occupation || "",
            birthPlace: data.birthPlace || "",
            deathPlace: data.deathPlace || "",
            notes: data.notes || "",
            isAlive: data.isAlive !== undefined ? data.isAlive : true,
            hometown: data.hometown || "",
            ethnicity: data.ethnicity || "",
            nationality: data.nationality || "",
            religion: data.religion || "",
            title: data.title || "",
            image: data.image || "",
          })
        } catch (error) {
          console.error("Error fetching member:", error)
          toast({
            title: "Lỗi",
            description: "Không thể tải thông tin thành viên",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }

      fetchMember()
    }
  }, [isOpen, familyTreeId, memberId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, [`${fieldName}Input`]: value }))

    // Parse date from string input
    const parts = value.split("-")
    if (parts.length === 3) {
      const day = Number.parseInt(parts[0], 10)
      const month = Number.parseInt(parts[1], 10) - 1 // JS months are 0-indexed
      const year = Number.parseInt(parts[2], 10)
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month, day)
        handleDateChange(fieldName, date)
      }
    }
  }

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAlive: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tệp hình ảnh",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước tệp không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    const imageUrl = URL.createObjectURL(file)
    setImagePreview(imageUrl)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, image: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    // Kiểm tra các trường bắt buộc
    if (!formData.fullName) errors.push("Họ tên là bắt buộc")
    if (!formData.gender) errors.push("Giới tính là bắt buộc")
    if (!formData.hometown) errors.push("Nguyên quán là bắt buộc")
    if (!formData.ethnicity) errors.push("Dân tộc là bắt buộc")
    if (!formData.nationality) errors.push("Quốc tịch là bắt buộc")

    // Kiểm tra năm sinh
    if (formData.birthYear) {
      const birthYear = Number.parseInt(formData.birthYear)
      if (birthYear > 2200) errors.push("Năm sinh không được vượt quá năm 2200")
    }

    // Kiểm tra năm mất
    if (!formData.isAlive && formData.deathYear) {
      const deathYear = Number.parseInt(formData.deathYear)
      if (deathYear > currentYear) errors.push("Năm mất không được vượt quá năm hiện tại")
    }

    // Kiểm tra quan hệ cha con
    if (formData.fatherId && formData.birthYear) {
      const father = members.find((m) => m.id === formData.fatherId)
      if (father && father.birthYear) {
        const fatherBirthYear = Number.parseInt(father.birthYear)
        const childBirthYear = Number.parseInt(formData.birthYear)
        if (fatherBirthYear > 0 && childBirthYear - fatherBirthYear < 16) {
          errors.push("Tuổi con phải cách tuổi bố ít nhất 16 năm")
        }
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Upload image if selected
      let imageUrl = formData.image
      if (imageFile) {
        setUploadingImage(true)
        try {
          const result = await uploadToBlob(imageFile, "members")
          imageUrl = result.url
        } catch (error) {
          console.error("Error uploading image:", error)
          toast({
            title: "Lỗi",
            description: "Không thể tải lên ảnh đại diện",
            variant: "destructive",
          })
        } finally {
          setUploadingImage(false)
        }
      }

      // Submit form data with image URL
      const response = await fetch(`/api/family-trees/${familyTreeId}/members/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Không thể cập nhật thành viên")
      }

      toast({
        title: "Thành công",
        description: "Thành viên đã được cập nhật thành công",
      })

      onSuccess()
      onClose()
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
          <DialogDescription>Cập nhật thông tin thành viên trong gia phả</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="family">Quan hệ gia đình</TabsTrigger>
                <TabsTrigger value="additional">Thông tin bổ sung</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {imagePreview ? (
                      <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary/10">
                        <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Avatar className="h-32 w-32">
                        <AvatarFallback>
                          {formData.fullName
                            ? formData.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="image"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Tải lên ảnh đại diện
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Hỗ trợ định dạng JPG, PNG. Tối đa 5MB.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hometown">
                      Nguyên quán <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hometown"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleChange}
                      placeholder="Nhập nguyên quán"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">
                      Dân tộc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ethnicity"
                      name="ethnicity"
                      value={formData.ethnicity}
                      onChange={handleChange}
                      placeholder="Nhập dân tộc"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">
                      Quốc tịch <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      placeholder="Nhập quốc tịch"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion">Tôn giáo</Label>
                    <Input
                      id="religion"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      placeholder="Nhập tôn giáo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthYear">Năm sinh</Label>
                    <Input
                      id="birthYear"
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleChange}
                      placeholder="Nhập năm sinh"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Ngày sinh (dương lịch)</Label>
                    <div className="flex flex-col space-y-1">
                      <Input
                        id="birthDateInput"
                        name="birthDateInput"
                        type="text"
                        placeholder="dd-mm-yyyy"
                        value={formData.birthDateInput || ""}
                        onChange={(e) => handleDateInputChange(e, "birthDate")}
                      />
                      <p className="text-xs text-muted-foreground">Định dạng dd-mm-yyyy (ngày-tháng-năm)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDateLunar">Ngày sinh (âm lịch)</Label>
                    <Input
                      id="birthDateLunar"
                      name="birthDateLunar"
                      value={formData.birthDateLunar}
                      onChange={handleChange}
                      placeholder="Ví dụ: 15 tháng Giêng năm Ất Sửu"
                    />
                  </div>
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
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="isAlive" checked={formData.isAlive} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isAlive">Còn sống</Label>
                </div>

                {!formData.isAlive && (
                  <>
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
                        <Label htmlFor="deathDate">Ngày mất (dương lịch)</Label>
                        <div className="flex flex-col space-y-1">
                          <Input
                            id="deathDateInput"
                            name="deathDateInput"
                            type="text"
                            placeholder="dd-mm-yyyy"
                            value={formData.deathDateInput || ""}
                            onChange={(e) => handleDateInputChange(e, "deathDate")}
                          />
                          <p className="text-xs text-muted-foreground">Định dạng dd-mm-yyyy (ngày-tháng-năm)</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deathDateLunar">Ngày mất (âm lịch)</Label>
                        <Input
                          id="deathDateLunar"
                          name="deathDateLunar"
                          value={formData.deathDateLunar}
                          onChange={handleChange}
                          placeholder="Ví dụ: 15 tháng Giêng năm Ất Sửu"
                        />
                      </div>
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
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="family" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="generation">Đời (Thế hệ)</Label>
                    <Input
                      id="generation"
                      name="generation"
                      value={formData.generation}
                      onChange={handleChange}
                      placeholder="Ví dụ: 1, 2, 3, ..."
                      type="number"
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

                <div className="space-y-2">
                  <Label htmlFor="fatherId">Cha</Label>
                  <Select value={formData.fatherId} onValueChange={(value) => handleSelectChange("fatherId", value)}>
                    <SelectTrigger id="fatherId">
                      <SelectValue placeholder="Chọn cha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {members
                        .filter((member) => member.gender === "MALE" && member.id !== memberId)
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
                        .filter((member) => member.gender === "FEMALE" && member.id !== memberId)
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
                      {members
                        .filter((member) => member.id !== memberId)
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Danh hiệu</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập danh hiệu (nếu có)"
                  />
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú khác</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Nhập ghi chú khác (đóng góp cho dòng họ, thông tin thêm,...)"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading || uploadingImage}>
                {loading || uploadingImage ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
