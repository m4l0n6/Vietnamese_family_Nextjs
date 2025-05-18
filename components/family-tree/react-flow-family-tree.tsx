"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  ConnectionLineType,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import ELK from "elkjs/lib/elk.bundled.js"
import type { FamilyData } from "@/lib/family-tree-types"
import { FamilyMemberNode } from "./family-member-node"
import { ConnectionNode } from "./connection-node"
import { Button } from "@/components/ui/button"
import { RotateCcw, Maximize, Download } from "lucide-react"

// Định nghĩa các node types tùy chỉnh
const nodeTypes = {
  familyMember: FamilyMemberNode,
  connection: ConnectionNode,
}

interface ReactFlowFamilyTreeProps {
  familyData: FamilyData
  className?: string
}

// Khởi tạo ELK
const elk = new ELK()

// Cấu hình ELK
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
  "elk.direction": "DOWN",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
}

export function ReactFlowFamilyTree({ familyData, className }: ReactFlowFamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)

  // Hàm chuyển đổi dữ liệu gia phả sang định dạng ReactFlow
  const convertFamilyDataToReactFlow = useCallback(() => {
    if (!familyData || !familyData.familyNodes || familyData.familyNodes.length === 0) {
      return { nodes: [], edges: [] }
    }

    const reactFlowNodes = []
    const reactFlowEdges = []
    const connectionNodes = {}
    const processedCouples = new Set()

    // Tạo các node thành viên
    familyData.familyNodes.forEach((node) => {
      reactFlowNodes.push({
        id: node.id,
        type: "familyMember",
        position: { x: 0, y: 0 }, // Vị trí sẽ được tính toán bởi ELK
        data: {
          ...node,
          isRoot: node.id === familyData.rootId,
        },
      })
    })

    // Xử lý các cặp vợ chồng và con cái
    familyData.familyNodes.forEach((node) => {
      // Xử lý quan hệ vợ chồng và con cái
      node.spouses.forEach((spouseId) => {
        const coupleId = [node.id, spouseId].sort().join("-")

        // Chỉ xử lý mỗi cặp vợ chồng một lần
        if (!processedCouples.has(coupleId)) {
          processedCouples.add(coupleId)

          const spouse = familyData.familyNodes.find((n) => n.id === spouseId)
          if (!spouse) return

          // Xác định vợ và chồng
          let husband, wife
          if (node.gender === "male") {
            husband = node
            wife = spouse
          } else {
            husband = spouse
            wife = node
          }

          // Tìm tất cả con chung của cặp vợ chồng này
          const commonChildren = familyData.familyNodes.filter((child) => {
            return (
              (child.parents.includes(husband.id) && child.parents.includes(wife.id)) ||
              (husband.children.includes(child.id) && wife.children.includes(child.id))
            )
          })

          if (commonChildren.length > 0) {
            // Tạo node kết nối cho cặp vợ chồng này
            const connectionNodeId = `connection-${coupleId}`
            connectionNodes[connectionNodeId] = {
              husbandId: husband.id,
              wifeId: wife.id,
              childrenIds: commonChildren.map((child) => child.id),
            }

            // Thêm node kết nối vào danh sách nodes
            reactFlowNodes.push({
              id: connectionNodeId,
              type: "connection",
              position: { x: 0, y: 0 }, // Vị trí sẽ được tính toán bởi ELK
              data: {
                id: connectionNodeId,
                label: "Điểm nối chung",
              },
            })

            // Tạo edge từ chồng đến node kết nối
            reactFlowEdges.push({
              id: `edge-husband-${husband.id}-to-${connectionNodeId}`,
              source: husband.id,
              target: connectionNodeId,
              sourceHandle: "gender", // Node bên phải của chồng
              targetHandle: "from-husband", // Node bên trái của điểm kết nối
              type: "smoothstep",
              style: { stroke: "#d97706", strokeWidth: 2 },
            })

            // Tạo edge từ vợ đến node kết nối
            reactFlowEdges.push({
              id: `edge-wife-${wife.id}-to-${connectionNodeId}`,
              source: wife.id,
              target: connectionNodeId,
              sourceHandle: "gender", // Node bên trái của vợ
              targetHandle: "from-wife", // Node bên phải của điểm kết nối
              type: "smoothstep",
              style: { stroke: "#d97706", strokeWidth: 2 },
            })

            // Tạo edge từ node kết nối đến mỗi đứa con
            commonChildren.forEach((child) => {
              reactFlowEdges.push({
                id: `edge-${connectionNodeId}-to-child-${child.id}`,
                source: connectionNodeId,
                target: child.id,
                sourceHandle: "to-child", // Node dưới của điểm kết nối
                targetHandle: "top", // Node trên của con
                type: "smoothstep",
                style: { stroke: "#d97706", strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.Arrow,
                  color: "#d97706",
                },
              })
            })
          }
        }
      })

      // Xử lý con cái không có cả cha và mẹ (chỉ có một trong hai)
      node.children.forEach((childId) => {
        const child = familyData.familyNodes.find((n) => n.id === childId)
        if (!child) return

        // Kiểm tra xem đứa con này đã được xử lý trong các cặp vợ chồng chưa
        const hasBeenProcessed = Object.values(connectionNodes).some((conn: any) => conn.childrenIds.includes(childId))

        if (!hasBeenProcessed) {
          // Tạo edge trực tiếp từ cha/mẹ đến con
          reactFlowEdges.push({
            id: `edge-direct-${node.id}-to-${childId}`,
            source: node.id,
            target: childId,
            sourceHandle: "gender", // Node bên phải/trái của cha/mẹ
            targetHandle: "top", // Node trên của con
            type: "smoothstep",
            style: { stroke: "#d97706", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#d97706",
            },
          })
        }
      })
    })

    return { nodes: reactFlowNodes, edges: reactFlowEdges }
  }, [familyData])

  // Hàm sắp xếp tự động sử dụng ELK
  const getLayoutedElements = useCallback(
    async (nodes, edges) => {
      if (!nodes.length) return { nodes, edges }

      const elkGraph = {
        id: "root",
        layoutOptions: elkOptions,
        children: nodes.map((node) => ({
          id: node.id,
          width: 180,
          height: node.type === "connection" ? 20 : 150,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      }

      try {
        const elkLayout = await elk.layout(elkGraph)

        // Cập nhật vị trí cho nodes
        const layoutedNodes = nodes.map((node) => {
          const elkNode = elkLayout.children.find((n) => n.id === node.id)
          if (elkNode) {
            return {
              ...node,
              position: {
                x: elkNode.x,
                y: elkNode.y,
              },
            }
          }
          return node
        })

        return { nodes: layoutedNodes, edges }
      } catch (error) {
        console.error("ELK layout error:", error)
        return { nodes, edges }
      }
    },
    [elkOptions],
  )

  // Khởi tạo nodes và edges khi component được mount
  useEffect(() => {
    const initializeLayout = async () => {
      if (familyData && !initialized) {
        setLoading(true)
        try {
          const { nodes: flowNodes, edges: flowEdges } = convertFamilyDataToReactFlow()
          const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(flowNodes, flowEdges)

          setNodes(layoutedNodes)
          setEdges(layoutedEdges)
          setInitialized(true)
        } catch (error) {
          console.error("Error initializing layout:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    initializeLayout()
  }, [familyData, initialized, convertFamilyDataToReactFlow, getLayoutedElements, setNodes, setEdges])

  // Xử lý reset view
  const handleResetView = useCallback(async () => {
    setLoading(true)
    try {
      const { nodes: flowNodes, edges: flowEdges } = convertFamilyDataToReactFlow()
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(flowNodes, flowEdges)

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
    } catch (error) {
      console.error("Error resetting view:", error)
    } finally {
      setLoading(false)
    }
  }, [convertFamilyDataToReactFlow, getLayoutedElements, setNodes, setEdges])

  // Xử lý xuất hình ảnh
  const handleDownloadImage = useCallback(() => {
    const reactFlowInstance = document.querySelector(".react-flow")
    if (reactFlowInstance) {
      // Sử dụng html2canvas hoặc dom-to-image để chuyển đổi DOM thành hình ảnh
      alert("Chức năng xuất hình ảnh sẽ được triển khai sau")
    }
  }, [])

  // Xử lý xem toàn màn hình
  const handleFullscreen = useCallback(() => {
    const reactFlowInstance = document.querySelector(".react-flow-wrapper")
    if (reactFlowInstance) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        reactFlowInstance.requestFullscreen()
      }
    }
  }, [])

  return (
    <div className={`h-[600px] react-flow-wrapper ${className}`}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#f5d742" gap={16} size={1} />
          <Controls showInteractive={false} />
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
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleFullscreen} title="Toàn màn hình">
                <Maximize className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDownloadImage} title="Tải xuống hình ảnh">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Panel>
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
              <div className="text-lg font-medium">Đang tải phả đồ...</div>
            </div>
          )}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
