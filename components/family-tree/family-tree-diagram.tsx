"use client"

import type React from "react"
import { useCallback, useState, useEffect, useRef } from "react"
import Tree from "react-d3-tree"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

// Định nghĩa cấu trúc dữ liệu node
interface NodeData {
  name: string
  attributes?: {
    birthYear?: number
    deathYear?: number
    gender?: "male" | "female"
    occupation?: string
    spouse?: string
  }
  children?: NodeData[]
}

interface FamilyTreeDiagramProps {
  data: NodeData
  className?: string
}

const FamilyTreeDiagram: React.FC<FamilyTreeDiagramProps> = ({ data, className }) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(0.7)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const containerRef = useRef<HTMLDivElement>(null)

  // Tính toán kích thước ban đầu và căn giữa cây
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setTranslate({ x: width / 2, y: 100 })
    }
  }, [])

  // Điều khiển zoom
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.3))
  }

  const handleResetView = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
      setTranslate({ x: width / 2, y: 100 })
      setZoom(0.7)
    }
  }

  // Tùy chỉnh hiển thị node
  const renderCustomNode = useCallback(
    ({ nodeDatum }: { nodeDatum: any }) => {
      const nodeData = nodeDatum as NodeData
      const birthYear = nodeData.attributes?.birthYear || "?"
      const deathYear = nodeData.attributes?.deathYear
      const gender = nodeData.attributes?.gender
      const occupation = nodeData.attributes?.occupation
      const spouse = nodeData.attributes?.spouse

      const lifespan = deathYear ? `${birthYear} - ${deathYear}` : `${birthYear} - `

      // Xác định màu sắc dựa trên giới tính
      const bgColor =
        gender === "female"
          ? isDarkMode
            ? "rgba(219, 39, 119, 0.8)"
            : "rgba(249, 168, 212, 0.8)"
          : isDarkMode
            ? "rgba(14, 165, 233, 0.8)"
            : "rgba(186, 230, 253, 0.8)"

      const borderColor =
        gender === "female"
          ? isDarkMode
            ? "rgb(219, 39, 119)"
            : "rgb(244, 114, 182)"
          : isDarkMode
            ? "rgb(14, 165, 233)"
            : "rgb(56, 189, 248)"

      const textColor = isDarkMode ? "white" : "black"

      // Tính toán chiều cao dựa trên số lượng thông tin
      const hasOccupation = occupation && occupation.length > 0
      const hasSpouse = spouse && spouse.length > 0
      const nodeHeight = 60 + (hasOccupation ? 20 : 0) + (hasSpouse ? 20 : 0)

      return (
        <g>
          <rect
            width="180"
            height={nodeHeight}
            x="-90"
            y={-nodeHeight / 2}
            rx="8"
            ry="8"
            fill={bgColor}
            strokeWidth={2}
            stroke={borderColor}
            filter={isDarkMode ? "drop-shadow(0 4px 3px rgb(0 0 0 / 0.3))" : "drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))"}
          />
          <text
            fill={textColor}
            x="0"
            y={-nodeHeight / 2 + 20}
            textAnchor="middle"
            style={{ fontSize: "14px", fontWeight: "bold" }}
            dominantBaseline="middle"
          >
            {nodeData.name}
          </text>
          <text
            fill={textColor}
            x="0"
            y={-nodeHeight / 2 + 45}
            textAnchor="middle"
            style={{ fontSize: "12px" }}
            dominantBaseline="middle"
          >
            {lifespan}
          </text>

          {hasOccupation && (
            <text
              fill={textColor}
              x="0"
              y={-nodeHeight / 2 + 70}
              textAnchor="middle"
              style={{ fontSize: "12px" }}
              dominantBaseline="middle"
            >
              {occupation}
            </text>
          )}

          {hasSpouse && (
            <text
              fill={textColor}
              x="0"
              y={nodeHeight / 2 - 15}
              textAnchor="middle"
              style={{ fontSize: "12px", fontStyle: "italic" }}
              dominantBaseline="middle"
            >
              {`Vợ/Chồng: ${spouse}`}
            </text>
          )}
        </g>
      )
    },
    [isDarkMode],
  )

  // Tùy chỉnh đường kết nối
  const renderCustomPath = useCallback(
    ({ linkData }: any) => {
      const { source, target } = linkData

      // Tạo đường cong mượt mà hơn
      const sourceX = source.x
      const sourceY = source.y
      const targetX = target.x
      const targetY = target.y

      // Điểm kiểm soát cho đường cong
      const midY = (sourceY + targetY) / 2

      // Tạo đường cong Bezier
      const pathData = `
        M ${sourceX},${sourceY}
        C ${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}
      `

      return (
        <path
          d={pathData}
          fill="none"
          stroke={isDarkMode ? "#aaa" : "#555"}
          strokeWidth="1.5"
          strokeDasharray={isDarkMode ? "" : ""}
        />
      )
    },
    [isDarkMode],
  )

  return (
    <div className={`w-full h-[600px] overflow-hidden relative ${className}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomOut} title="Thu nhỏ">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomIn} title="Phóng to">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetView} title="Khôi phục góc nhìn">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div ref={containerRef} className="w-full h-full bg-muted/20 rounded-lg">
        <Tree
          data={data}
          orientation="vertical"
          translate={translate}
          zoom={zoom}
          renderCustomNodeElement={renderCustomNode}
          pathFunc="elbow"
          renderCustomPathElement={renderCustomPath}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          enableLegacyTransitions
          transitionDuration={800}
          nodeSize={{ x: 200, y: 150 }}
          onUpdate={(state) => {
            setTranslate(state.translate)
            setZoom(state.zoom)
          }}
        />
      </div>
    </div>
  )
}

export default FamilyTreeDiagram
