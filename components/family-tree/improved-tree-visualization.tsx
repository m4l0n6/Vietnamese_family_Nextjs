"use client"

import type React from "react"
import { useCallback, useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Save, Paintbrush, Info } from "lucide-react"
import html2canvas from "html2canvas"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const Tree = dynamic(() => import("react-d3-tree"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
})

// Định nghĩa cấu trúc dữ liệu node
interface NodeData {
  name: string
  attributes?: {
    birthYear?: number
    deathYear?: number
    gender?: "male" | "female" | "other"
    occupation?: string
    spouse?: string
    spouseId?: string
    spouseImage?: string
    spouseBirthYear?: number
    generation?: number
    image?: string
  }
  children?: NodeData[]
}

interface ImprovedTreeVisualizationProps {
  data: NodeData
  familyTreeId: string
  className?: string
}

export const ImprovedTreeVisualization: React.FC<ImprovedTreeVisualizationProps> = ({
  data,
  familyTreeId,
  className,
}) => {
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(0.7)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const containerRef = useRef<HTMLDivElement>(null)
  const [background, setBackground] = useState<string>("default")
  const [showHelp, setShowHelp] = useState(false)

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
        return isDarkMode ? "bg-gray-900" : "bg-yellow-50" // Mặc định là nền vàng nhạt như trong hình
    }
  }

  // Lưu ảnh cây gia phả
  const handleSaveImage = () => {
    if (!containerRef.current) return

    const scale = 2 // Tăng độ phân giải

    // Áp dụng class tạm thời để đảm bảo nền đúng khi lưu
    const container = containerRef.current
    const originalClass = container.className
    container.className = `${originalClass} ${getBackgroundColor()}`

    html2canvas(container, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: background === "default" ? (isDarkMode ? "#111827" : "#FEFCE8") : undefined,
    }).then((canvas) => {
      // Khôi phục class gốc
      container.className = originalClass

      // Tạo link tải ảnh
      const link = document.createElement("a")
      link.download = `family-tree-${familyTreeId}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    })
  }

  // Tùy chỉnh hiển thị node theo kiểu truyền thống
  const renderCustomNodeElement = useCallback(
    ({ nodeDatum }: { nodeDatum: any }) => {
      const nodeData = nodeDatum as NodeData
      const name = nodeData.name || "Không tên"
      const birthYear = nodeData.attributes?.birthYear || ""
      const gender = nodeData.attributes?.gender || "other"
      const generation = nodeData.attributes?.generation || 1
      const image = nodeData.attributes?.image || `/placeholder.svg?height=60&width=60`

      // Thông tin về vợ/chồng
      const hasSpouse = !!nodeData.attributes?.spouse
      const spouseName = nodeData.attributes?.spouse || ""
      const spouseImage = nodeData.attributes?.spouseImage || `/placeholder.svg?height=60&width=60`
      const spouseBirthYear = nodeData.attributes?.spouseBirthYear || ""

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
      const nodeWidth = 120 // Tăng kích thước để hiển thị đầy đủ họ tên
      const nodeHeight = 140
      const nodeSpacing = 10 // Khoảng cách giữa node chính và node vợ/chồng

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
            />

            {/* Thông tin đời */}
            <text
              fill={textColor}
              x={nodeWidth / 2}
              y="85"
              textAnchor="middle"
              style={{ fontSize: "12px", fontWeight: "normal" }} // Giảm độ đậm
            >
              {`ĐỜI: ${generation}`}
            </text>

            {/* Tên đầy đủ */}
            <text
              fill={textColor}
              x={nodeWidth / 2}
              y="105"
              textAnchor="middle"
              style={{ fontSize: "14px", fontWeight: "normal" }} // Giảm độ đậm
            >
              {name} {/* Hiển thị đầy đủ họ và tên */}
            </text>

            {/* Năm sinh */}
            {birthYear && (
              <text
                fill={textColor}
                x={nodeWidth / 2}
                y="125"
                textAnchor="middle"
                style={{ fontSize: "12px", fontWeight: "normal" }} // Giảm độ đậm
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
              />

              {/* Thông tin đời */}
              <text
                fill={textColor}
                x={nodeWidth / 2}
                y="85"
                textAnchor="middle"
                style={{ fontSize: "12px", fontWeight: "normal" }} // Giảm độ đậm
              >
                {`ĐỜI: ${generation}`}
              </text>

              {/* Tên đầy đủ */}
              <text
                fill={textColor}
                x={nodeWidth / 2}
                y="105"
                textAnchor="middle"
                style={{ fontSize: "14px", fontWeight: "normal" }} // Giảm độ đậm
              >
                {spouseName} {/* Hiển thị đầy đủ họ và tên */}
              </text>

              {/* Năm sinh */}
              {spouseBirthYear && (
                <text
                  fill={textColor}
                  x={nodeWidth / 2}
                  y="125"
                  textAnchor="middle"
                  style={{ fontSize: "12px", fontWeight: "normal" }} // Giảm độ đậm
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
              stroke={isDarkMode ? "#FF6666" : "#FF0000"} // Màu đỏ nhạt hơn trong dark mode
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
      const sourceY = source.y + 70 // Điểm cuối của node nguồn
      const targetX = target.x
      const targetY = target.y - 70 // Điểm đầu của node đích

      // Tạo đường thẳng với góc vuông
      const pathData = `
        M ${sourceX},${sourceY}
        L ${sourceX},${sourceY + 20}
        L ${targetX},${sourceY + 20}
        L ${targetX},${targetY}
      `

      // Màu đường kết nối thay đổi theo theme
      const pathColor = isDarkMode ? "#FF6666" : "#FF0000" // Màu đỏ nhạt hơn trong dark mode

      return <path d={pathData} fill="none" stroke={pathColor} strokeWidth="2" />
    },
    [isDarkMode],
  )

  return (
    <div className={`w-full h-[600px] overflow-hidden relative ${className}`}>
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
              <Button variant="outline" size="icon" onClick={handleSaveImage}>
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lưu ảnh</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
            <li className="flex items-center gap-2">
              <Save className="h-4 w-4" /> <span>Lưu ảnh cây gia phả</span>
            </li>
          </ul>
          <p className="text-xs mt-3 text-muted-foreground">Bạn có thể kéo thả để di chuyển cây gia phả</p>
          <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setShowHelp(false)}>
            Đóng
          </Button>
        </div>
      )}

      <div ref={containerRef} className={`w-full h-full rounded-lg ${getBackgroundColor()}`}>
        {data && (
          <Tree
            data={data}
            orientation="vertical"
            translate={translate}
            zoom={zoom}
            renderCustomNodeElement={renderCustomNodeElement}
            pathFunc="straight" // Sử dụng đường thẳng thay vì đường cong
            renderCustomPathElement={renderCustomPath}
            separation={{ siblings: 2.5, nonSiblings: 3 }} // Tăng khoảng cách để phù hợp với node vợ/chồng
            enableLegacyTransitions
            transitionDuration={800}
            nodeSize={{ x: 260, y: 180 }} // Tăng kích thước node để phù hợp với cả vợ/chồng và tên đầy đủ
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
