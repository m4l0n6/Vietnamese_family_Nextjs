"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import FamilyTree from "react-family-tree"
import { FamilyNode } from "./family-node"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { FamilyData } from "@/lib/family-tree-types"
import { useTheme } from "next-themes"

interface FamilyTreeNewProps {
  familyData: FamilyData
  className?: string
}

export const FamilyTreeNew: React.FC<FamilyTreeNewProps> = ({ familyData, className }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const WIDTH = 100
  const HEIGHT = 120

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
        x: containerWidth / 2 - (WIDTH * scale) / 2,
        y: containerHeight / 4,
      })
    }
  }, [scale])

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
        className={`w-full h-full ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
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
          }}
        >
          <FamilyTree
            nodes={familyData.familyNodes}
            rootId={familyData.rootId}
            width={WIDTH}
            height={HEIGHT}
            className="family-tree"
            renderNode={(props) => (
              <FamilyNode
                node={props.node}
                isRoot={props.node.id === familyData.rootId}
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
