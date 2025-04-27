"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import dynamic from "next/dynamic"

// Sử dụng dynamic import để tránh lỗi SSR với react-d3-tree
const Tree = dynamic(() => import("react-d3-tree"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[350px]">Đang tải...</div>,
})

// Dữ liệu mẫu cho phả đồ họ Nguyễn
const familyTreeData = {
  name: "Nguyễn Văn Tổ",
  attributes: {
    birthYear: 1920,
    deathYear: 2000,
    gender: "male",
  },
  children: [
    {
      name: "Nguyễn Văn Trưởng",
      attributes: {
        birthYear: 1945,
        deathYear: 2015,
        gender: "male",
      },
      children: [
        {
          name: "Nguyễn Văn Minh",
          attributes: {
            birthYear: 1970,
            gender: "male",
          },
          children: [
            {
              name: "Nguyễn Văn Tuấn",
              attributes: {
                birthYear: 1995,
                gender: "male",
              },
            },
            {
              name: "Nguyễn Thị Mai",
              attributes: {
                birthYear: 1998,
                gender: "female",
              },
            },
          ],
        },
        {
          name: "Nguyễn Thị Hương",
          attributes: {
            birthYear: 1975,
            gender: "female",
          },
        },
      ],
    },
    {
      name: "Nguyễn Thị Út",
      attributes: {
        birthYear: 1950,
        gender: "female",
      },
      children: [
        {
          name: "Trần Văn Hùng",
          attributes: {
            birthYear: 1975,
            gender: "male",
          },
        },
      ],
    },
  ],
}

export default function FamilyTreePreview() {
  const [expanded, setExpanded] = useState<string[]>(["1"])
  const [activeTab, setActiveTab] = useState("tree")
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(0.6)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleNode = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((nodeId) => nodeId !== id))
    } else {
      setExpanded([...expanded, id])
    }
  }

  // Tính toán kích thước ban đầu và căn giữa cây
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setTranslate({ x: width / 2, y: 50 })
    }
  }, [activeTab])

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
      setTranslate({ x: width / 2, y: 50 })
      setZoom(0.6)
    }
  }

  // Tùy chỉnh hiển thị node
  const renderCustomNode = ({ nodeDatum }: any) => {
    const name = nodeDatum.name
    const birthYear = nodeDatum.attributes?.birthYear || ""
    const deathYear = nodeDatum.attributes?.deathYear
    const gender = nodeDatum.attributes?.gender

    const lifespan = deathYear ? `${birthYear} - ${deathYear}` : `${birthYear} - `

    // Xác định màu sắc dựa trên giới tính
    const bgColor = gender === "female" ? "#FFC0CB" : "#FFFF99" // Hồng cho nữ, vàng cho nam
    const borderColor = gender === "female" ? "#EC4899" : "#EF4444" // pink-500 cho nữ, red-500 cho nam

    return (
      <g>
        <rect
          width="120"
          height="60"
          x="-60"
          y="-30"
          rx="4"
          ry="4"
          fill={bgColor}
          stroke={borderColor}
          strokeWidth="2"
        />
        <text fill="black" x="0" y="-10" textAnchor="middle" style={{ fontSize: "12px", fontWeight: "normal" }}>
          {name}
        </text>
        <text fill="black" x="0" y="10" textAnchor="middle" style={{ fontSize: "10px" }}>
          {lifespan}
        </text>
      </g>
    )
  }

  return (
    <Tabs defaultValue="tree" className="w-full">
      <div className="bg-background p-4 border-b">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="tree" onClick={() => setActiveTab("tree")}>
            Phả đồ
          </TabsTrigger>
          <TabsTrigger value="list" onClick={() => setActiveTab("list")}>
            Phả hệ
          </TabsTrigger>
          <TabsTrigger value="events" onClick={() => setActiveTab("events")}>
            Sự kiện
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="tree" className="p-6 bg-background min-h-[400px]">
        <div className="relative w-full h-[350px] border rounded-lg overflow-hidden" ref={containerRef}>
          {typeof window !== "undefined" && (
            <Tree
              data={familyTreeData}
              orientation="vertical"
              translate={translate}
              zoom={zoom}
              renderCustomNodeElement={renderCustomNode}
              pathFunc="straight"
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              nodeSize={{ x: 150, y: 80 }}
              onUpdate={(state) => {
                setTranslate(state.translate)
                setZoom(state.zoom)
              }}
            />
          )}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="list" className="p-6 bg-background min-h-[400px]">
        <div className="space-y-4">
          <div className="border rounded-md p-3 bg-primary/5">
            <div className="font-medium">Nguyễn Văn Tổ (1920 - 2000)</div>
            <div className="text-sm text-muted-foreground">Thế hệ 1 • Tổ tiên</div>
          </div>
          <div className="border rounded-md p-3 ml-6">
            <div className="font-medium">Nguyễn Văn Trưởng (1945 - 2015)</div>
            <div className="text-sm text-muted-foreground">Thế hệ 2 • Con trai</div>
          </div>
          <div className="border rounded-md p-3 ml-12">
            <div className="font-medium">Nguyễn Văn Minh (1970 - )</div>
            <div className="text-sm text-muted-foreground">Thế hệ 3 • Con trai</div>
          </div>
          <div className="border rounded-md p-3 ml-12">
            <div className="font-medium">Nguyễn Thị Hương (1975 - )</div>
            <div className="text-sm text-muted-foreground">Thế hệ 3 • Con gái</div>
          </div>
          <div className="border rounded-md p-3 ml-6">
            <div className="font-medium">Nguyễn Thị Út (1950 - )</div>
            <div className="text-sm text-muted-foreground">Thế hệ 2 • Con gái</div>
          </div>
          <div className="border rounded-md p-3 ml-12">
            <div className="font-medium">Trần Văn Hùng (1975 - )</div>
            <div className="text-sm text-muted-foreground">Thế hệ 3 • Con trai</div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="events" className="p-6 bg-background min-h-[400px]">
        <div className="space-y-4">
          <div className="flex gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Ngày giỗ tổ</h3>
              <p className="text-sm text-muted-foreground mb-1">Ngày: 15/10/2023</p>
              <p className="text-sm">Lễ giỗ tổ hàng năm của dòng họ</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Ngày cưới</h3>
              <p className="text-sm text-muted-foreground mb-1">Ngày: 30/11/2005</p>
              <p className="text-sm">Lễ cưới của Nguyễn Văn Minh và Lê Thị Hoa</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Sinh nhật</h3>
              <p className="text-sm text-muted-foreground mb-1">Ngày: 20/05/1970</p>
              <p className="text-sm">Sinh nhật của Nguyễn Văn Minh</p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

