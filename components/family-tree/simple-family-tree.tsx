"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import type { FamilyData } from "@/lib/family-tree-types"

interface SimpleFamilyTreeProps {
  familyData: FamilyData
  className?: string
}

// Component hiển thị thông tin của mỗi thành viên
const FamilyMember = ({ member, isRoot }: { member: any; isRoot: boolean }) => {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  return (
    <div className={`family-member ${isRoot ? "family-member-root" : ""}`}>
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
          <div className="family-member-avatar-placeholder">{member.name.charAt(0)}</div>
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
        <p className="family-member-generation">Đời: {member.generation}</p>
      </div>
    </div>
  )
}

// Component hiển thị một thế hệ
const FamilyGeneration = ({ members, isRoot = false }: { members: any[]; isRoot?: boolean }) => {
  return (
    <div className={`family-generation ${isRoot ? "family-generation-root" : ""}`}>
      {members.map((member, index) => (
        <div key={member.id} className="family-unit">
          <FamilyMember member={member} isRoot={isRoot && index === 0} />
        </div>
      ))}
    </div>
  )
}

export const SimpleFamilyTree: React.FC<SimpleFamilyTreeProps> = ({ familyData, className }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)
  const [generations, setGenerations] = useState<any[][]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  useEffect(() => {
    if (!familyData || !familyData.familyNodes || familyData.familyNodes.length === 0) {
      setError("Không có dữ liệu gia phả")
      return
    }

    try {
      // Nhóm thành viên theo thế hệ
      const generationMap: Map<number, any[]> = new Map()

      familyData.familyNodes.forEach((node) => {
        const generation = node.generation || 1
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
        // Sắp xếp thành viên trong cùng thế hệ
        const sortedMembers = [...members].sort((a, b) => {
          // Ưu tiên sắp xếp theo mối quan hệ (vợ/chồng gần nhau)
          if (a.spouses.includes(b.id)) return -1
          if (b.spouses.includes(a.id)) return 1

          // Nếu cùng cha mẹ, sắp xếp theo tuổi
          const sameParents = a.parents.some((p) => b.parents.includes(p))
          if (sameParents) {
            return (a.birthYear || 0) - (b.birthYear || 0)
          }

          // Mặc định sắp xếp theo ID
          return a.id.localeCompare(b.id)
        })

        sortedGenerations.push(sortedMembers)
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
        className="family-tree-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          className="family-tree"
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
