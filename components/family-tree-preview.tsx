"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, RotateCcw, Maximize, Download } from "lucide-react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  ConnectionLineType,
  type Node,
  type Edge,
} from "reactflow"
import "reactflow/dist/style.css"
import { FamilyMemberNode } from "./family-tree/family-member-node"
import { ConnectionNode } from "./family-tree/connection-node"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Định nghĩa các node types tùy chỉnh
const nodeTypes = {
  familyMember: FamilyMemberNode,
  connection: ConnectionNode,
}

// Dữ liệu mẫu cho phả đồ họ Nguyễn
const familyTreeData = {
  id: "1",
  name: "Nguyễn Văn Tổ",
  birthYear: 1920,
  deathYear: 2000,
  gender: "male",
  generation: 1,
  children: [
    {
      id: "2",
      name: "Nguyễn Văn Trưởng",
      birthYear: 1945,
      deathYear: 2015,
      gender: "male",
      generation: 2,
      spouse: {
        id: "9",
        name: "Lê Thị Hoa",
        gender: "female",
        birthYear: 1950,
        generation: 2,
      },
      children: [
        {
          id: "3",
          name: "Nguyễn Văn Minh",
          birthYear: 1970,
          gender: "male",
          generation: 3,
          children: [
            {
              id: "4",
              name: "Nguyễn Văn Tuấn",
              birthYear: 1995,
              gender: "male",
              generation: 4,
            },
            {
              id: "5",
              name: "Nguyễn Thị Mai",
              birthYear: 1998,
              gender: "female",
              generation: 4,
            },
          ],
        },
        {
          id: "6",
          name: "Nguyễn Thị Hương",
          birthYear: 1975,
          gender: "female",
          generation: 3,
        },
      ],
    },
    {
      id: "7",
      name: "Nguyễn Thị Út",
      birthYear: 1950,
      gender: "female",
      generation: 2,
      children: [
        {
          id: "8",
          name: "Trần Văn Hùng",
          birthYear: 1975,
          gender: "male",
          generation: 3,
        },
      ],
    },
  ],
}

// Constants for layout calculations
const NODE_WIDTH = 160
const NODE_HEIGHT = 100 // Approximate height of the FamilyMemberNode card
const VERTICAL_SPACING = 180 // Space between generations (from top of child to bottom of parent)
const HORIZONTAL_SPACING = 60 // Minimum space between sibling nodes
const SPOUSE_HORIZONTAL_OFFSET = NODE_WIDTH + HORIZONTAL_SPACING // Distance between husband and wife nodes
const CONNECTION_NODE_VERTICAL_OFFSET = 60 // Distance from parent bottom to connection node center

export default function FamilyTreePreview() {
  const [activeTab, setActiveTab] = useState("tree")
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Helper to calculate the total width needed for a subtree (including spouses)
  const calculateSubtreeTotalWidth = (member: any): number => {
    if (!member.children || member.children.length === 0) {
      // If no children, it's just the node width, or couple width
      return member.spouse ? NODE_WIDTH * 2 + HORIZONTAL_SPACING : NODE_WIDTH
    }

    // Sum of children's subtree widths + spacing between them
    const childrenWidth = member.children.reduce(
      (sum: number, child: any) => sum + calculateSubtreeTotalWidth(child),
      0,
    )
    const spacingBetweenChildren = (member.children.length - 1) * HORIZONTAL_SPACING

    const totalChildrenSpan = childrenWidth + spacingBetweenChildren
    const selfSpan = member.spouse ? NODE_WIDTH * 2 + HORIZONTAL_SPACING : NODE_WIDTH

    // The total width for this subtree is the maximum of its own span or its children's span
    return Math.max(totalChildrenSpan, selfSpan)
  }

  // Hàm chuyển đổi dữ liệu cây thành nodes và edges cho React Flow
  const convertToFlowData = (data: any) => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    let connectionNodeIdCounter = 1000

    // Recursive function to create nodes and edges
    const createNodesAndEdges = (
      member: any,
      currentX: number, // The starting X for this member's group
      generation: number,
    ) => {
      const y = generation * VERTICAL_SPACING

      let memberNodeX = currentX
      let spouseNodeX = currentX + SPOUSE_HORIZONTAL_OFFSET

      // Adjust X for centering if there's a spouse
      if (member.spouse) {
        const totalSpanForCouple = NODE_WIDTH * 2 + HORIZONTAL_SPACING
        const subtreeWidth = calculateSubtreeTotalWidth(member)
        if (subtreeWidth > totalSpanForCouple) {
          // If children span wider, center the couple over the children's span
          memberNodeX = currentX + (subtreeWidth - totalSpanForCouple) / 2
          spouseNodeX = memberNodeX + SPOUSE_HORIZONTAL_OFFSET
        }
      }

      // Add main member node
      const mainMemberNode: Node = {
        id: member.id,
        type: "familyMember",
        position: { x: memberNodeX, y },
        data: {
          ...member,
          isRoot: member.id === data.id,
          parentHandleType: member.spouse ? "right" : "bottom",
        },
      }
      nodes.push(mainMemberNode)

      // Add spouse node if exists
      if (member.spouse) {
        const spouseNode: Node = {
          id: member.spouse.id,
          type: "familyMember",
          position: { x: spouseNodeX, y },
          data: {
            ...member.spouse,
            isRoot: false,
            parentHandleType: "left",
          },
        }
        nodes.push(spouseNode)

        // If children exist, create a connection node
        if (member.children && member.children.length > 0) {
          const connId = `conn-${connectionNodeIdCounter++}`
          const connY = y + NODE_HEIGHT + CONNECTION_NODE_VERTICAL_OFFSET
          // Center connection node between the couple
          const connX = memberNodeX + (NODE_WIDTH + SPOUSE_HORIZONTAL_OFFSET) / 2 - 8

          nodes.push({
            id: connId,
            type: "connection",
            position: { x: connX, y: connY },
            data: { id: connId },
          })

          // Edges from main member and spouse to connection node
          edges.push({
            id: `edge-${member.id}-${connId}`,
            source: member.id,
            target: connId,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          })
          edges.push({
            id: `edge-${member.spouse.id}-${connId}`,
            source: member.spouse.id,
            target: connId,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          })

          // Layout children
          const childrenTotalWidth =
            member.children.reduce((sum: number, child: any) => sum + calculateSubtreeTotalWidth(child), 0) +
            (member.children.length - 1) * HORIZONTAL_SPACING
          let currentChildX = connX - childrenTotalWidth / 2 // Start X for the first child, centered under connection node

          member.children.forEach((child: any) => {
            createNodesAndEdges(child, currentChildX, generation + 1)
            edges.push({
              id: `edge-${connId}-${child.id}`,
              source: connId,
              target: child.id,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "step",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            })
            currentChildX += calculateSubtreeTotalWidth(child) + HORIZONTAL_SPACING
          })
        }
      } else if (member.children && member.children.length > 0) {
        // No spouse, but has children
        const childrenTotalWidth =
          member.children.reduce((sum: number, child: any) => sum + calculateSubtreeTotalWidth(child), 0) +
          (member.children.length - 1) * HORIZONTAL_SPACING
        let currentChildX = memberNodeX + NODE_WIDTH / 2 - childrenTotalWidth / 2 // Start X for the first child, centered under parent

        member.children.forEach((child: any) => {
          createNodesAndEdges(child, currentChildX, generation + 1)
          edges.push({
            id: `edge-${member.id}-${child.id}`,
            source: member.id,
            target: child.id,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          })
          currentChildX += calculateSubtreeTotalWidth(child) + HORIZONTAL_SPACING
        })
      }
    }

    // Start layout from the root node, initially placing it at X=0
    const rootTotalWidth = calculateSubtreeTotalWidth(data)
    // Adjust initial X to center the entire tree
    createNodesAndEdges(data, -rootTotalWidth / 2, 0)

    return { nodes, edges }
  }

  // Khởi tạo nodes và edges khi component được mount
  useEffect(() => {
    if (activeTab === "tree") {
      setLoading(true)
      const { nodes, edges } = convertToFlowData(familyTreeData)
      setNodes(nodes)
      setEdges(edges)
      setLoading(false)
    }
  }, [activeTab, setNodes, setEdges])

  // Xử lý reset view
  const handleResetView = () => {
    setLoading(true)
    try {
      const { nodes: flowNodes, edges: flowEdges } = convertToFlowData(familyTreeData)
      setNodes(flowNodes)
      setEdges(flowEdges)
    } catch (error) {
      console.error("Error resetting view:", error)
    } finally {
      setLoading(false)
    }
  }

  // Xử lý xuất hình ảnh
  const handleDownloadImage = () => {
    alert("Chức năng xuất hình ảnh sẽ được triển khai sau")
  }

  // Xử lý xem toàn màn hình
  const handleFullscreen = () => {
    const reactFlowInstance = document.querySelector(".react-flow-wrapper")
    if (reactFlowInstance) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        reactFlowInstance.requestFullscreen()
      }
    }
  }

  // Hàm đệ quy để lấy tất cả thành viên theo thế hệ
  const getMembersByGeneration = (member: any, membersByGen: Record<number, any[]>) => {
    if (!membersByGen[member.generation]) {
      membersByGen[member.generation] = []
    }
    membersByGen[member.generation].push(member)

    if (member.children && member.children.length > 0) {
      member.children.forEach((child: any) => getMembersByGeneration(child, membersByGen))
    }
  }

  // Hàm hiển thị thành viên
  const renderMember = (member: any) => {
    return (
      <Card key={member.id} className="border">
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                {member.birthYear && (
                  <span>
                    {member.birthYear}
                    {member.deathYear ? ` - ${member.deathYear}` : ""}
                  </span>
                )}
              </div>
            </div>
            {member.gender === "male" ? (
              <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-100 text-blue-700">
                Nam
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-pink-100 hover:bg-pink-100 text-pink-700">
                Nữ
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Hàm hiển thị danh sách thành viên theo thế hệ
  const renderFamilyList = () => {
    const membersByGen: Record<number, any[]> = {}
    getMembersByGeneration(familyTreeData, membersByGen)

    // Sắp xếp các thế hệ theo thứ tự tăng dần
    const generations = Object.keys(membersByGen)
      .map(Number)
      .sort((a, b) => a - b)

    return (
      <div className="space-y-6">
        {generations.map((gen) => (
          <div key={gen} className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-1 text-sm">
                Đời {gen}
              </Badge>
              <div className="text-muted-foreground text-sm">{membersByGen[gen].length} thành viên</div>
            </div>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {membersByGen[gen].map((member) => renderMember(member))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="tree" className="w-full">
      <div className="bg-background p-4 border-b">
        <TabsList className="grid grid-cols-3 mx-auto w-full max-w-md">
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

      <TabsContent value="tree" className="bg-background p-6 min-h-[400px]">
        <div
          className="relative border rounded-lg w-full h-[350px] overflow-hidden react-flow-wrapper"
          ref={containerRef}
        >
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              connectionLineType={ConnectionLineType.Step} {/* Changed to Step for straighter lines */}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
              <Background color="#f5d742" gap={16} size={1} />
              <Controls showInteractive={false} />\
              <MiniMap />
              <Panel position="top-right">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetView}
                    title="Đặt lại góc nhìn"
                    disabled={loading}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFullscreen}
                    title="Toàn màn hình"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownloadImage}
                    title="Tải xuống hình ảnh"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </Panel>
              {loading && (
                <div className="z-10 absolute inset-0 flex justify-center items-center bg-white/50 dark:bg-gray-900/50">
                  <div className="font-medium text-lg">Đang tải phả đồ...</div>
                </div>
              )}
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </TabsContent>

      <TabsContent value="list" className="bg-background p-6 min-h-[400px]">
        <ScrollArea className="pr-4 h-[350px]">
          <div className="space-y-4">{renderFamilyList()}</div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="events" className="bg-background p-6 min-h-[400px]">
        <ScrollArea className="pr-4 h-[350px]">
          <div className="space-y-6">
            {/* Sự kiện sắp tới */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-green-100 hover:bg-green-100 text-green-700"
                >
                  Sắp tới
                </Badge>
                <div className="text-muted-foreground text-sm">3 sự kiện</div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 hover:shadow-sm p-4 border rounded-lg transition-shadow">
                  <div className="flex flex-shrink-0 justify-center items-center bg-green-100 rounded-full w-12 h-12">
                    <Calendar className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <h3 className="font-medium">Ngày giỗ tổ</h3>
                      <Badge variant="outline" className="text-xs">
                        15/10/2023
                      </Badge>
                    </div>
                    <p className="mb-2 text-muted-foreground text-sm">
                      Lễ giỗ tổ hàng năm của dòng họ
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 hover:bg-blue-100 text-blue-700"
                      >
                        Nguyễn Văn Tổ
                      </Badge>
                      <span>•</span>
                      <span>Hàng năm</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 hover:shadow-sm p-4 border rounded-lg transition-shadow">
                  <div className="flex flex-shrink-0 justify-center items-center bg-blue-100 rounded-full w-12 h-12">
                    <Calendar className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <h3 className="font-medium">Ngày cưới</h3>
                      <Badge variant="outline" className="text-xs">
                        30/11/2005
                      </Badge>
                    </div>
                    <p className="mb-2 text-muted-foreground text-sm">
                      Lễ cưới của Nguyễn Văn Minh và Lê Thị Hoa
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 hover:bg-blue-100 text-blue-700"
                      >
                        Nguyễn Văn Minh
                      </Badge>
                      <span>•</span>
                      <Badge
                        variant="secondary"
                        className="bg-pink-100 hover:bg-pink-100 text-pink-700"
                      >
                        Lê Thị Hoa
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 hover:shadow-sm p-4 border rounded-lg transition-shadow">
                  <div className="flex flex-shrink-0 justify-center items-center bg-pink-100 rounded-full w-12 h-12">
                    <Calendar className="w-5 h-5 text-pink-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <h3 className="font-medium">Sinh nhật</h3>
                      <Badge variant="outline" className="text-xs">
                        20/05/1970
                      </Badge>
                    </div>
                    <p className="mb-2 text-muted-foreground text-sm">
                      Sinh nhật của Nguyễn Văn Minh
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 hover:bg-blue-100 text-blue-700"
                      >
                        Nguyễn Văn Minh
                      </Badge>
                      <span>•</span>
                      <span>Hàng năm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sự kiện đã qua */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 hover:bg-gray-100 text-gray-700"
                >
                  Đã qua
                </Badge>
                <div className="text-muted-foreground text-sm">2 sự kiện</div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 opacity-75 hover:opacity-100 p-4 border rounded-lg transition-opacity">
                  <div className="flex flex-shrink-0 justify-center items-center bg-gray-100 rounded-full w-12 h-12">
                    <Calendar className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <h3 className="font-medium">Ngày giỗ tổ</h3>
                      <Badge variant="outline" className="text-xs">
                        15/10/2022
                      </Badge>
                    </div>
                    <p className="mb-2 text-muted-foreground text-sm">
                      Lễ giỗ tổ hàng năm của dòng họ
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 hover:bg-blue-100 text-blue-700"
                      >
                        Nguyễn Văn Tổ
                      </Badge>
                      <span>•</span>
                      <span>Hàng năm</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 opacity-75 hover:opacity-100 p-4 border rounded-lg transition-opacity">
                  <div className="flex flex-shrink-0 justify-center items-center bg-gray-100 rounded-full w-12 h-12">
                    <Calendar className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <h3 className="font-medium">Sinh nhật</h3>
                      <Badge variant="outline" className="text-xs">
                        20/05/2022
                      </Badge>
                    </div>
                    <p className="mb-2 text-muted-foreground text-sm">
                      Sinh nhật của Nguyễn Văn Minh
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 hover:bg-blue-100 text-blue-700"
                      >
                        Nguyễn Văn Minh
                      </Badge>
                      <span>•</span>
                      <span>Hàng năm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
