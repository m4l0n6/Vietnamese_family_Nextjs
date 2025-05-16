"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import type { FamilyData } from "@/lib/family-tree-types"

interface VietnameseFamilyTreeProps {
  familyData: FamilyData
  className?: string
}

// Component hiển thị thông tin của mỗi thành viên
const FamilyMember = ({ member, isRoot }: { member: any; isRoot: boolean }) => {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  return (
    <div
      className={`family-member ${isRoot ? "family-member-root" : ""} ${
        member.gender === "male" ? "family-member-male" : "family-member-female"
      }`}
    >
      <div className="family-member-avatar">
        {member.image ? (
          <Image
            src={member.image || "/placeholder.svg"}
            alt={member.name}
            width={60}
            height={60}
            className="object-cover rounded-full"
          />
        ) : (
          <div
            className={`family-member-avatar-placeholder ${member.gender === "male" ? "bg-blue-200" : "bg-pink-200"}`}
          >
            {member.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="family-member-info">
        <h3 className="family-member-name">{member.name}</h3>
        {member.birthYear && (
          <p className="family-member-dates">
            {member.birthYear}
            {member.deathYear ? ` - ${member.deathYear}` : ""}
          </p>
        )}
        {member.occupation && <p className="family-member-occupation">{member.occupation}</p>}
      </div>
    </div>
  )
}

// Component hiển thị một cặp vợ chồng
const FamilyCouple = ({ husband, wife }: { husband: any; wife: any }) => {
  return (
    <div className="family-couple">
      {husband && <FamilyMember member={husband} isRoot={false} />}
      {wife && <FamilyMember member={wife} isRoot={false} />}
    </div>
  )
}

// Component hiển thị một thế hệ
const FamilyGeneration = ({ members, isRoot = false }: { members: any[]; isRoot?: boolean }) => {
  // Nhóm thành viên theo cặp vợ chồng
  const groupedMembers: any[] = []
  const processedIds = new Set()

  members.forEach((member) => {
    if (processedIds.has(member.id)) return

    processedIds.add(member.id)
    if (member.spouseId && members.some((m) => m.id === member.spouseId)) {
      const spouse = members.find((m) => m.id === member.spouseId)
      processedIds.add(member.spouseId)

      if (member.gender === "male") {
        groupedMembers.push({ husband: member, wife: spouse })
      } else {
        groupedMembers.push({ husband: spouse, wife: member })
      }
    } else {
      if (member.gender === "male") {
        groupedMembers.push({ husband: member, wife: null })
      } else {
        groupedMembers.push({ husband: null, wife: member })
      }
    }
  })

  return (
    <div className={`family-generation ${isRoot ? "family-generation-root" : ""}`}>
      {groupedMembers.map((couple, index) => (
        <div key={index} className="family-unit">
          <FamilyCouple husband={couple.husband} wife={couple.wife} />
          {/* Đường kẻ kết nối xuống con cái */}
          <div className="family-connector-vertical"></div>
        </div>
      ))}
    </div>
  )
}

export const VietnameseFamilyTree: React.FC<VietnameseFamilyTreeProps> = ({ familyData, className }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)
  const [generations, setGenerations] = useState<any[][]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!familyData || !familyData.familyNodes || familyData.familyNodes.length === 0) {
      setError("Không có dữ liệu gia phả")
      return
    }

    try {
      // Nhóm thành viên theo thế hệ
      const generationMap: Map<number, any[]> = new Map()

      familyData.familyNodes.forEach((node) => {
        const generation = node.generation || 0
        if (!generationMap.has(generation)) {
          generationMap.set(generation, [])
        }
        generationMap.get(generation)?.push(node)
      })

      // Sắp xếp các thế hệ
      const sortedGenerations: any[][] = []
      const sortedGenerationNumbers = Array.from(generationMap.keys()).sort((a, b) => a - b)

      sortedGenerationNumbers.forEach((gen) => {
        const members = generationMap.get(gen) || []
        sortedGenerations.push(members)
      })

      setGenerations(sortedGenerations)
    } catch (err) {
      console.error("Error processing family data:", err)
      setError("Lỗi khi xử lý dữ liệu gia phả")
    }
  }, [familyData])

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }

  const handleResetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      })
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const handleMouseLeave = () => {
    setDragging(false)
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-muted-foreground">Đang tải dữ liệu gia phả...</p>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-[600px] overflow-hidden ${className}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="vietnamese-family-tree-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          className="vietnamese-family-tree"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {generations.map((generation, index) => (
            <FamilyGeneration key={index} members={generation} isRoot={index === 0} />
          ))}
        </div>
      </div>
    </div>
  )
}
