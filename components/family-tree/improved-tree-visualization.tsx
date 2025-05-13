"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Paintbrush, Info } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

// Sử dụng dynamic import để tránh lỗi SSR
const Tree = dynamic(() => import("react-d3-tree").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  ),
})

// Định nghĩa cấu trúc dữ liệu node
interface NodeData {
  name: string
  attributes?: {
    birthYear?: number | null
    deathYear?: number | null
    gender?: string
    occupation?: string | null
    spouse?: string
    spouseId?: string
    spouseImage?: string | null
    spouseBirthYear?: number | null
    generation?: number
    image?: string | null
  }
  children?: NodeData[]
}

interface ImprovedTreeVisualizationProps {
  familyTreeId: string
  className?: string
}

export const ImprovedTreeVisualization = ({ familyTreeId, className }: ImprovedTreeVisualizationProps) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(0.7)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const containerRef = useRef<HTMLDivElement>(null)
  const [background, setBackground] = useState<string>("default")
  const [showHelp, setShowHelp] = useState(false)
  const [treeData, setTreeData] = useState<NodeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tải dữ liệu cây gia phả
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/family-trees/${familyTreeId}/tree-data`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Không thể tải dữ liệu cây gia phả")
        }

        const data = await response.json()
        setTreeData(data)
      } catch (error) {
        console.error("Error fetching tree data:", error)
        setError(error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    if (familyTreeId) {
      fetchTreeData()
    }
  }, [familyTreeId])

  // Tính toán kích thước ban đầu và căn giữa cây
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
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

  // Chọn màu nền
  const getBackgroundColor = () => {
    switch (background) {
      case "light":
        return "bg-white"
      case "dark":
        return "bg-gray-900"
      case "blue":
        return "bg-blue-50"
      case "green":
        return "bg-green-50"
      case "yellow":
        return "bg-yellow-50"
      default:
        return isDarkMode ? "bg-gray-900" : "bg-yellow-50"
    }
  }

  // Tùy chỉnh hiển thị node theo kiểu truyền thống
  const renderCustomNodeElement = useCallback(
    ({ nodeDatum }: { nodeDatum: any }) => {
      if (!nodeDatum) return null

      const name = nodeDatum.name || "Không tên"
      const birthYear = nodeDatum.attributes?.birthYear || ""
      const gender = nodeDatum.attributes?.gender || "other"
      const generation = nodeDatum.attributes?.generation || 1
      const image = nodeDatum.attributes?.image || `/placeholder.svg?height=60&width=60`

      // Thông tin về vợ/chồng
      const hasSpouse = !!nodeDatum.attributes?.spouse
      const spouseName = nodeDatum.attributes?.spouse || ""
      const spouseImage = nodeDatum.attributes?.spouseImage || `/placeholder.svg?height=60&width=60`
      const spouseBirthYear = nodeDatum.attributes?.spouseBirthYear || ""

      // Xác định màu sắc dựa trên giới tính
      const getNodeBorderColor = (gender: string) => {
        if (gender === "female") {
          return "#EC4899" // pink-500 cho nữ
        } else {
          return "#EF4444" // red-500 cho nam
        }
      }

      const getNodeBackgroundColor = (gender: string) => {
        if (gender === "female") {
          return "#FFC0CB" // Hồng cho nữ
        } else {
          return "#FFFF99" // Vàng cho nam
        }
      }

      const mainBorderColor = getNodeBorderColor(gender)
      const mainBgColor = getNodeBackgroundColor(gender)
      const spouseBorderColor = getNodeBorderColor(gender === "male" ? "female" : "male")
      const spouseBgColor = getNodeBackgroundColor(gender === "male" ? "female" : "male")
      const textColor = isDarkMode ? "white" : "black"

      // Tính toán vị trí của node chính và node vợ/chồng
      const nodeWidth = 120
      const nodeHeight = 140
      const nodeSpacing = 10

      // Vị trí node chính
      const mainNodeX = hasSpouse ? -nodeWidth - nodeSpacing / 2 : -nodeWidth / 2

      return (
        <g>
          {/* Node chính */}
          <g transform={`translate(${mainNodeX}, -70)`}>
            {/* Khung chữ nhật */}
            <rect
              width={nodeWidth}
              height={nodeHeight}
              rx={4}
              ry={4}
              fill={mainBgColor}
              stroke={mainBorderColor}
              strokeWidth={2}
            />

            {/* Avatar */}
            <image
              x={(nodeWidth - 60) / 2}
              y="10"
              width="60"
              height="60"
              href={image}
              preserveAspectRatio="xMidYMid slice"
              crossOrigin="anonymous"
            />

            {/* Thông tin đời */}
            <text
              fill={textColor}
              x={nodeWidth / 2}
              y="85"
              textAnchor="middle"
              style={{ fontSize: "12px", fontWeight: "normal" }}
            >
              {`ĐỜI: ${generation}`}
            </text>

            {/* Tên đầy đủ */}
            <text
              fill={textColor}
              x={nodeWidth / 2}
              y="105"
              textAnchor="middle"
              style={{ fontSize: "14px", fontWeight: "normal" }}
            >
              {name}
            </text>

            {/* Năm sinh */}
            {birthYear && (
              <text
                fill={textColor}
                x={nodeWidth / 2}
                y="125"
                textAnchor="middle"
                style={{ fontSize: "12px", fontWeight: "normal" }}
              >
                {birthYear}
              </text>
            )}
          </g>

          {/* Node vợ/chồng nếu có */}
          {hasSpouse && (
            <g transform={`translate(${nodeSpacing / 2}, -70)`}>
              {/* Khung chữ nhật */}
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx={4}
                ry={4}
                fill={spouseBgColor}
                stroke={spouseBorderColor}
                strokeWidth={2}
              />

              {/* Avatar */}
              <image
                x={(nodeWidth - 60) / 2}
                y="10"
                width="60"
                height="60"
                href={spouseImage}
                preserveAspectRatio="xMidYMid slice"
                crossOrigin="anonymous"
              />

              {/* Thông tin đời */}
              <text
                fill={textColor}
                x={nodeWidth / 2}
                y="85"
                textAnchor="middle"
                style={{ fontSize: "12px", fontWeight: "normal" }}
              >
                {`ĐỜI: ${generation}`}
              </text>

              {/* Tên đầy đủ */}
              <text
                fill={textColor}
                x={nodeWidth / 2}
                y="105"
                textAnchor="middle"
                style={{ fontSize: "14px", fontWeight: "normal" }}
              >
                {spouseName}
              </text>

              {/* Năm sinh */}
              {spouseBirthYear && (
                <text
                  fill={textColor}
                  x={nodeWidth / 2}
                  y="125"
                  textAnchor="middle"
                  style={{ fontSize: "12px", fontWeight: "normal" }}
                >
                  {spouseBirthYear}
                </text>
              )}
            </g>
          )}

          {/* Đường kết nối giữa vợ và chồng */}
          {hasSpouse && (
            <line
              x1={mainNodeX + nodeWidth}
              y1={-70 + nodeHeight / 2}
              x2={nodeSpacing / 2}
              y2={-70 + nodeHeight / 2}
              stroke={isDarkMode ? "#FF6666" : "#FF0000"}
              strokeWidth="2"
            />
          )}
        </g>
      )
    },
    [isDarkMode],
  )

  // Tùy chỉnh đường kết nối thành đường thẳng
  const renderCustomPath = useCallback(
    ({ linkData }: any) => {
      const { source, target } = linkData
      const sourceX = source.x
      const sourceY = source.y + 70
      const targetX = target.x
      const targetY = target.y - 70

      // Tạo đường thẳng với góc vuông
      const pathData = `
        M ${sourceX},${sourceY}
        L ${sourceX},${sourceY + 20}
        L ${targetX},${sourceY + 20}
        L ${targetX},${targetY}
      `

      const pathColor = isDarkMode ? "#FF6666" : "#FF0000"
      return <path d={pathData} fill="none" stroke={pathColor} strokeWidth="2" />
    },
    [isDarkMode],
  )

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Lỗi: {error}</p>
          <Button onClick={() => window.location.reload()}>Tải lại</Button>
        </div>
      </div>
    )
  }

  if (!treeData) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground">Chưa có dữ liệu gia phả</p>
      </div>
    )
  }

  return (
    <div className={`w-full h-[500px] overflow-hidden relative ${className}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Thu nhỏ</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Phóng to</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Khôi phục góc nhìn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Paintbrush className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setBackground("default")}>Mặc định</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBackground("light")}>Trắng</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBackground("dark")}>Tối</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBackground("blue")}>Xanh nhạt</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBackground("green")}>Xanh lá nhạt</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBackground("yellow")}>Vàng nhạt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setShowHelp(!showHelp)}>
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hướng dẫn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showHelp && (
        <div className="absolute top-16 right-4 z-10 bg-card border rounded-lg shadow-lg p-4 w-64">
          <h3 className="font-medium mb-2">Hướng dẫn sử dụng</h3>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4" /> <span>Phóng to cây gia phả</span>
            </li>
            <li className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4" /> <span>Thu nhỏ cây gia phả</span>
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> <span>Khôi phục góc nhìn</span>
            </li>
            <li className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" /> <span>Thay đổi màu nền</span>
            </li>
          </ul>
          <p className="text-xs mt-3 text-muted-foreground">Bạn có thể kéo thả để di chuyển cây gia phả</p>
          <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setShowHelp(false)}>
            Đóng
          </Button>
        </div>
      )}

      <div ref={containerRef} className={`w-full h-full rounded-lg ${getBackgroundColor()}`}>
        {treeData && (
          <Tree
            data={treeData}
            orientation="vertical"
            translate={translate}
            zoom={zoom}
            renderCustomNodeElement={renderCustomNodeElement}
            pathFunc="straight"
            renderCustomPathElement={renderCustomPath}
            separation={{ siblings: 2.5, nonSiblings: 3 }}
            nodeSize={{ x: 260, y: 180 }}
            onUpdate={(state) => {
              setTranslate(state.translate)
              setZoom(state.zoom)
            }}
          />
        )}
      </div>
    </div>
  )
}
