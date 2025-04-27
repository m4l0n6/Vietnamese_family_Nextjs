"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, ChevronRight, UserIcon as Male, UserIcon as Female } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Member {
  id: string
  fullName: string
  generation: number
  birthYear?: string
  birthDate?: string
  deathDate?: string
  isAlive?: boolean
  gender?: string
  image?: string
  occupation?: string
  parentId?: string
  fatherId?: string
  motherId?: string
  spouseId?: string
  spouseName?: string
  childrenIds?: string[]
}

interface GenerationGroup {
  generation: number
  members: Member[]
}

interface FamilyTreeHierarchyProps {
  familyTreeId: string
}

export function FamilyTreeHierarchy({ familyTreeId }: FamilyTreeHierarchyProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [generations, setGenerations] = useState<GenerationGroup[]>([])
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/family-trees/${familyTreeId}/members/hierarchy`)

        if (!response.ok) {
          throw new Error("Failed to fetch family tree hierarchy")
        }

        const data: Member[] = await response.json()
        setMembers(data)

        // Group members by generation - sử dụng đời đã nhập sẵn
        const groupedByGeneration: Record<number, Member[]> = {}
        data.forEach((member) => {
          // Sử dụng đời đã nhập, không tính toán lại
          const gen = member.generation || 1
          if (!groupedByGeneration[gen]) {
            groupedByGeneration[gen] = []
          }
          groupedByGeneration[gen].push(member)
        })

        // Convert to array and sort by generation
        const generationGroups: GenerationGroup[] = Object.entries(groupedByGeneration)
          .map(([gen, members]) => ({
            generation: Number.parseInt(gen),
            members: members.sort((a, b) => {
              // Sắp xếp theo giới tính (nam trước)
              if (a.gender !== b.gender) {
                return a.gender === "MALE" ? -1 : 1
              }
              // Nếu cùng giới tính, sắp xếp theo tên
              return a.fullName.localeCompare(b.fullName)
            }),
          }))
          .sort((a, b) => a.generation - b.generation)

        setGenerations(generationGroups)

        // Initialize expanded state for members
        const expanded: Record<string, boolean> = {}
        data.forEach((member) => {
          expanded[member.id] = false
        })
        setExpandedMembers(expanded)
      } catch (error) {
        console.error("Error fetching members:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [familyTreeId, toast])

  const toggleMember = (memberId: string) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }))
  }

  const getParents = (member: Member) => {
    const father = member.fatherId ? members.find((m) => m.id === member.fatherId) : undefined
    const mother = member.motherId ? members.find((m) => m.id === member.motherId) : undefined
    return { father, mother }
  }

  const getChildren = (memberId: string) => {
    return members.filter((m) => m.parentId === memberId || m.fatherId === memberId || m.motherId === memberId)
  }

  const getSpouse = (member: Member) => {
    return member.spouseId ? members.find((m) => m.id === member.spouseId) : undefined
  }

  const renderMemberCard = (member: Member) => {
    const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : member.birthYear

    const deathYear = member.deathDate
      ? new Date(member.deathDate).getFullYear()
      : member.isAlive === false
        ? "?"
        : undefined

    const lifespan = birthYear ? (deathYear ? `${birthYear} - ${deathYear}` : `${birthYear} - `) : ""

    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
          <Image
            src={member.image || `/placeholder.svg?height=48&width=48`}
            alt={member.fullName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{member.fullName}</span>
            {member.gender === "MALE" ? (
              <Male className="h-4 w-4 text-blue-500" />
            ) : member.gender === "FEMALE" ? (
              <Female className="h-4 w-4 text-pink-500" />
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-1 py-0">
              Đời {member.generation}
            </Badge>
            {lifespan && <span>{lifespan}</span>}
            {member.occupation && <span>• {member.occupation}</span>}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {generations.map((group) => (
        <Card
          key={group.generation}
          className="overflow-hidden border-l-4"
          style={{ borderLeftColor: getGenerationColor(group.generation) }}
        >
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <span
                className="inline-block w-6 h-6 rounded-full"
                style={{ backgroundColor: getGenerationColor(group.generation) }}
              ></span>
              Đời thứ {group.generation}
              <Badge variant="secondary">{group.members.length} thành viên</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {group.members.map((member) => {
              const { father, mother } = getParents(member)
              const children = getChildren(member.id)
              const spouse = getSpouse(member)
              const isExpanded = expandedMembers[member.id]

              return (
                <div key={member.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    {children.length > 0 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleMember(member.id)}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    )}
                    <Link href={`/dashboard/family-trees/${familyTreeId}/members/${member.id}`} className="flex-1">
                      {renderMemberCard(member)}
                    </Link>
                  </div>

                  {isExpanded && (
                    <div className="ml-9 space-y-4">
                      {/* Hiển thị cha mẹ */}
                      {(father || mother) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getGenerationColor(father?.generation || mother?.generation || 1),
                              }}
                            ></span>
                            Cha mẹ:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {father && (
                              <Link href={`/dashboard/family-trees/${familyTreeId}/members/${father.id}`}>
                                {renderMemberCard(father)}
                              </Link>
                            )}
                            {mother && (
                              <Link href={`/dashboard/family-trees/${familyTreeId}/members/${mother.id}`}>
                                {renderMemberCard(mother)}
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Hiển thị vợ/chồng */}
                      {spouse && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: getGenerationColor(spouse.generation) }}
                            ></span>
                            Vợ/Chồng:
                          </h4>
                          <Link href={`/dashboard/family-trees/${familyTreeId}/members/${spouse.id}`}>
                            {renderMemberCard(spouse)}
                          </Link>
                        </div>
                      )}

                      {/* Hiển thị con cái */}
                      {children.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getGenerationColor(children[0]?.generation || group.generation + 1),
                              }}
                            ></span>
                            Con cái ({children.length}):
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {children.map((child) => (
                              <Link key={child.id} href={`/dashboard/family-trees/${familyTreeId}/members/${child.id}`}>
                                {renderMemberCard(child)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {generations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chưa có thành viên nào trong gia phả này</p>
        </div>
      )}
    </div>
  )
}

// Hàm tạo màu sắc cho từng đời
function getGenerationColor(generation: number): string {
  const colors = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#84cc16", // lime-500
    "#10b981", // emerald-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
  ]

  // Lấy màu theo đời, lặp lại nếu vượt quá số màu có sẵn
  return colors[(generation - 1) % colors.length]
}

