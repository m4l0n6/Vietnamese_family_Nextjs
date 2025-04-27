"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, Calendar, MapPin, User, ArrowLeft, Briefcase, FileText } from "lucide-react"
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
}

interface Member {
  id: string
  fullName: string
  gender?: string
  birthDate?: string
  birthPlace?: string
  deathDate?: string
  deathPlace?: string
  biography?: string
  image?: string
  isAlive?: boolean
  parentId?: string
  spouseId?: string
  childrenIds?: string[]
  createdAt: string
  updatedAt: string
  generation?: number
  occupation?: string
  notes?: string
}

interface RelatedMember {
  id: string
  fullName: string
  relation: string
}

export default function MemberDetailPage({ params }: { params: { id: string; memberId: string } }) {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [relatedMembers, setRelatedMembers] = useState<RelatedMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
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

        // Fetch related members if any
        if (
          memberData.parentId ||
          memberData.spouseId ||
          (memberData.childrenIds && memberData.childrenIds.length > 0)
        ) {
          const allMembers = await fetch(`/api/family-trees/${params.id}/members`).then((res) => res.json())

          const related: RelatedMember[] = []

          // Add parent if exists
          if (memberData.parentId) {
            const parent = allMembers.find((m: any) => m.id === memberData.parentId)
            if (parent) {
              related.push({
                id: parent.id,
                fullName: parent.fullName,
                relation: "Cha/Mẹ",
              })
            }
          }

          // Add spouse if exists
          if (memberData.spouseId) {
            const spouse = allMembers.find((m: any) => m.id === memberData.spouseId)
            if (spouse) {
              related.push({
                id: spouse.id,
                fullName: spouse.fullName,
                relation: "Vợ/Chồng",
              })
            }
          }

          // Add children if exist
          if (memberData.childrenIds && memberData.childrenIds.length > 0) {
            memberData.childrenIds.forEach((childId: string) => {
              const child = allMembers.find((m: any) => m.id === childId)
              if (child) {
                related.push({
                  id: child.id,
                  fullName: child.fullName,
                  relation: "Con",
                })
              }
            })
          }

          setRelatedMembers(related)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin thành viên",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, params.memberId, toast])

  const handleDeleteMember = async () => {
    try {
      const response = await fetch(`/api/family-trees/${params.id}/members/${params.memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete member")
      }

      toast({
        title: "Thành công",
        description: "Thành viên đã được xóa thành công",
      })

      router.push(`/dashboard/family-trees/${params.id}`)
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa thành viên",
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

  if (!familyTree || !member) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/50 p-4 rounded-full mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">Không tìm thấy thành viên</h3>
        <p className="text-muted-foreground mt-1 mb-4">Thành viên này không tồn tại hoặc bạn không có quyền truy cập</p>
        <Link href={`/dashboard/family-trees/${params.id}`}>
          <Button>Quay lại gia phả</Button>
        </Link>
      </div>
    )
  }

  const genderText = member.gender === "MALE" ? "Nam" : member.gender === "FEMALE" ? "Nữ" : "Khác"
  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : ""

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/family-trees/${params.id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{member.fullName}</h1>
          <p className="text-muted-foreground">
            Thành viên của gia phả{" "}
            <Link href={`/dashboard/family-trees/${params.id}`} className="text-primary hover:underline">
              {familyTree.name}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <Link href={`/dashboard/family-trees/${params.id}/members/${params.memberId}/edit`}>
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
                  Hành động này không thể hoàn tác. Thành viên này sẽ bị xóa vĩnh viễn khỏi gia phả.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMember}>Xóa</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-primary/10">
                  <Image
                    src={member.image || "/placeholder.svg?height=160&width=160"}
                    alt={member.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{member.fullName}</h2>
                  <p className="text-muted-foreground">
                    Đời thứ {member.generation || "?"} • {birthYear ? `${birthYear}` : ""}
                    {member.birthDate && member.deathDate && " - "}
                    {member.deathDate && new Date(member.deathDate).getFullYear()}
                  </p>
                </div>
                <div className="w-full space-y-2">
                  {member.gender && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giới tính:</span>
                      <span>{genderText}</span>
                    </div>
                  )}
                  {member.isAlive !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <span>{member.isAlive ? "Còn sống" : "Đã mất"}</span>
                    </div>
                  )}
                  {member.birthDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ngày sinh:</span>
                      <span>{new Date(member.birthDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}
                  {member.birthPlace && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nơi sinh:</span>
                      <span>{member.birthPlace}</span>
                    </div>
                  )}
                  {member.deathDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ngày mất:</span>
                      <span>{new Date(member.deathDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}
                  {member.deathPlace && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nơi mất:</span>
                      <span>{member.deathPlace}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Thông tin</TabsTrigger>
              <TabsTrigger value="relationships">Quan hệ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {member.biography && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tiểu sử</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{member.biography}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {member.birthDate && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Ngày sinh</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(member.birthDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    )}
                    {member.birthPlace && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Nơi sinh</p>
                          <p className="text-sm text-muted-foreground">{member.birthPlace}</p>
                        </div>
                      </div>
                    )}
                    {member.deathDate && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Ngày mất</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(member.deathDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    )}
                    {member.deathPlace && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Nơi mất</p>
                          <p className="text-sm text-muted-foreground">{member.deathPlace}</p>
                        </div>
                      </div>
                    )}
                    {member.occupation && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Nghề nghiệp</p>
                          <p className="text-sm text-muted-foreground">{member.occupation}</p>
                        </div>
                      </div>
                    )}
                    {member.notes && (
                      <div className="flex items-start gap-2 md:col-span-2">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Ghi chú</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{member.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relationships" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quan hệ gia đình</CardTitle>
                  <CardDescription>Các mối quan hệ của thành viên này trong gia phả</CardDescription>
                </CardHeader>
                <CardContent>
                  {relatedMembers.length > 0 ? (
                    <div className="space-y-4">
                      {relatedMembers.map((related) => (
                        <Link
                          key={related.id}
                          href={`/dashboard/family-trees/${params.id}/members/${related.id}`}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden">
                              <Image
                                src={`/placeholder.svg?height=40&width=40`}
                                alt={related.fullName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{related.fullName}</div>
                              <div className="text-sm text-muted-foreground">{related.relation}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Xem
                          </Button>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-muted/50 p-4 rounded-full mb-4">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg">Chưa có thông tin quan hệ</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Thành viên này chưa được thiết lập mối quan hệ với các thành viên khác
                      </p>
                      <Link href={`/dashboard/family-trees/${params.id}/members/${params.memberId}/edit`}>
                        <Button>Thiết lập quan hệ</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

