"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Tree from "react-d3-tree"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Định nghĩa kiểu dữ liệu cho node trong cây gia phả
interface FamilyMember {
  id: string
  name: string
  birthYear?: string
  deathYear?: string
  avatarUrl?: string
  gender?: "male" | "female" | "other"
  children?: FamilyMember[]
  attributes?: Record<string, string>
}

// Chuyển đổi dữ liệu thành định dạng mà react-d3-tree có thể hiểu
interface TreeNode {
  name: string
  attributes?: Record<string, string>
  children?: TreeNode[]
  __rd3t?: any
  nodeDatum?: any
}

const convertToTreeData = (familyMember: FamilyMember): TreeNode => {
  return {
    name: familyMember.name,
    attributes: {
      id: familyMember.id,
      birthYear: familyMember.birthYear || "",
      deathYear: familyMember.deathYear || "",
      avatarUrl: familyMember.avatarUrl || "",
      gender: familyMember.gender || "other",
      ...familyMember.attributes,
    },
    children: familyMember.children?.map(convertToTreeData) || [],
  }
}

// Component hiển thị node tùy chỉnh
const CustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
  const gender = nodeDatum.attributes?.gender || "other"
  const avatarUrl = nodeDatum.attributes?.avatarUrl || ""
  const birthYear = nodeDatum.attributes?.birthYear || ""
  const deathYear = nodeDatum.attributes?.deathYear || ""
  const lifespan = birthYear && deathYear ? `${birthYear} - ${deathYear}` : birthYear ? `${birthYear} - ` : ""

  // Xác định màu nền dựa trên giới tính
  const getBgColor = () => {
    switch (gender) {
      case "male":
        return "bg-blue-50 dark:bg-blue-950"
      case "female":
        return "bg-pink-50 dark:bg-pink-950"
      default:
        return "bg-gray-50 dark:bg-gray-900"
    }
  }

  // Xác định màu viền dựa trên giới tính
  const getBorderColor = () => {
    switch (gender) {
      case "male":
        return "border-blue-200 dark:border-blue-800"
      case "female":
        return "border-pink-200 dark:border-pink-800"
      default:
        return "border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <foreignObject width={180} height={90} x={-90} y={-45}>
      <Card
        className={`w-full h-full border-2 ${getBorderColor()} ${getBgColor()} shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}
      >
        <CardContent className="p-2 flex items-center gap-2">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={avatarUrl || "/placeholder.svg?height=48&width=48"} alt={nodeDatum.name} />
            <AvatarFallback>
              {nodeDatum.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium text-sm truncate">{nodeDatum.name}</span>
            <span className="text-xs text-muted-foreground truncate">{lifespan}</span>
          </div>
        </CardContent>
      </Card>
    </foreignObject>
  )
}

interface FamilyTreeVisualizationProps {
  data: FamilyMember
  className?: string
}

export default function FamilyTreeVisualization({ data, className = "" }: FamilyTreeVisualizationProps) {
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState<number>(0.8)
  const containerRef = useRef<HTMLDivElement>(null)
  const treeData = convertToTreeData(data)

  // Tính toán vị trí ban đầu của cây
  const calculateInitialTranslate = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setTranslate({ x: width / 2, y: height / 6 })
    }
  }, [])

  useEffect(() => {
    calculateInitialTranslate()
    window.addEventListener("resize", calculateInitialTranslate)
    return () => window.removeEventListener("resize", calculateInitialTranslate)
  }, [calculateInitialTranslate])

  // Xử lý zoom in
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2))
  }

  // Xử lý zoom out
  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.3))
  }

  // Xử lý reset view
  const handleResetView = () => {
    calculateInitialTranslate()
    setZoom(0.8)
  }

  return (
    <div className={`relative w-full h-[600px] border rounded-lg bg-background ${className}`} ref={containerRef}>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button variant="outline" size="icon" onClick={handleZoomIn} title="Phóng to">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut} title="Thu nhỏ">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetView} title="Khôi phục góc nhìn">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tree
        data={treeData}
        translate={translate}
        zoom={zoom}
        orientation="vertical"
        renderCustomNodeElement={CustomNodeElement}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        pathClassFunc={() => "stroke-muted-foreground stroke-[1.5px]"}
        enableLegacyTransitions={true}
        transitionDuration={800}
        nodeSize={{ x: 200, y: 120 }}
        zoomable={true}
        draggable={true}
        onUpdate={(state) => {
          setTranslate(state.translate)
          setZoom(state.zoom)
        }}
      />
    </div>
  )
}

