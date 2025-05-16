"use client"

import React, { useState, useEffect, useRef } from "react"
import FamilyTree from "react-family-tree"
import type { ExtNode } from "@/lib/family-tree-types"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

// Kích thước của mỗi node
const NODE_WIDTH = 150
const NODE_HEIGHT = 200

interface VietnameseFamilyTreeProps {
  familyData: any
  className?: string
}

// Component hiển thị thông tin của mỗi thành viên
const FamilyNode = React.memo(
  ({ node, isRoot, onClick, style }: { node: any; isRoot: boolean; onClick: any; style: any }) => {
    const nodeRef = useRef<HTMLDivElement>(null)
    const { theme } = useTheme()
    const isDarkMode = theme === "dark"

    return (
      <div
        ref={nodeRef}
        className={`absolute flex flex-col items-center transition-transform duration-300 ${
          isRoot ? "ring-2 ring-primary" : ""
        }`}
        style={{
          ...style,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        }}
      >
        <div
          className={`w-full h-full flex flex-col items-center p-2 rounded-lg border-2 ${
            isRoot
              ? "border-primary bg-primary/10"
              : node.gender === "male"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-pink-500 bg-pink-50 dark:bg-pink-950"
          } ${isDarkMode ? "text-white" : "text-black"} cursor-pointer hover:shadow-lg transition-shadow`}
          onClick={() => onClick(node.id)}
        >
          <div className="relative w-20 h-20 mb-2 overflow-hidden rounded-full border-2 border-gray-300">
            {node.image ? (
              <Image
                src={node.image || "/placeholder.svg"}
                alt={node.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-2xl font-bold ${
                  node.gender === "male" ? "bg-blue-200" : "bg-pink-200"
                }`}
              >
                {node.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-sm">{node.name}</h3>
            {node.birthYear && (
              <p className="text-xs">
                {node.birthYear}
                {node.deathYear ? ` - ${node.deathYear}` : ""}
              </p>
            )}
            {node.occupation && <p className="text-xs italic mt-1">{node.occupation}</p>}
          </div>
        </div>
      </div>
    )
  },
)

FamilyNode.displayName = "FamilyNode"

export const VietnameseFamilyTree: React.FC<VietnameseFamilyTreeProps> = ({ familyData, className }) => {
  const [nodes, setNodes] = useState<ExtNode[]>([])
  const [rootId, setRootId] = useState<string>("")
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  useEffect(() => {
    if (familyData && familyData.familyNodes && familyData.familyNodes.length > 0) {
      setNodes(familyData.familyNodes)
      setRootId(familyData.rootId)
    } else {
      setError("Không có dữ liệu gia phả")
    }
  }, [familyData])

  const handleNodeClick = (nodeId: string) => {
    console.log("Node clicked:", nodeId)
    // Có thể thêm logic để hiển thị chi tiết thành viên hoặc chuyển hướng đến trang chi tiết
  }

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

  // Căn giữa cây gia phả khi component được mount
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight
      setPosition({
        x: containerWidth / 2 - (NODE_WIDTH * scale) / 2,
        y: containerHeight / 4,
      })
    }
  }, [scale])

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!nodes.length || !rootId) {
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
        className={`w-full h-full ${isDarkMode ? "bg-gray-900" : "bg-amber-50"} overflow-auto relative`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            transition: dragging ? "none" : "transform 0.3s ease",
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <FamilyTree
            nodes={nodes}
            rootId={rootId}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            className="family-tree"
            renderNode={(props) => (
              <FamilyNode
                node={props.node}
                isRoot={props.node.id === rootId}
                onClick={handleNodeClick}
                style={props.style}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
