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
import dagre from "dagre"
import type { FamilyData } from "@/lib/family-tree-types"
import { FamilyNode } from "./family-node-reactflow"
import { Button } from "@/components/ui/button"
import { RotateCcw, Maximize, Download } from "lucide-react"

// Định nghĩa các node types tùy chỉnh
const nodeTypes = {
  familyNode: FamilyNode,
}

interface ReactFlowFamilyTreeProps {
  familyData: FamilyData
  className?: string
}

// Hàm sắp xếp tự động sử dụng dagre
const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const nodeWidth = 180
  const nodeHeight = 120

  // Thiết lập thuật toán và kích thước node
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 })

  // Thêm nodes vào đồ thị
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  // Thêm edges vào đồ thị
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Tính toán layout
  dagre.layout(dagreGraph)

  // Cập nhật vị trí cho nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export function ReactFlowFamilyTree({ familyData, className }: ReactFlowFamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [initialized, setInitialized] = useState(false)

  // Hàm chuyển đổi dữ liệu gia phả sang định dạng ReactFlow
  const convertFamilyDataToReactFlow = useCallback(() => {
    if (!familyData || !familyData.familyNodes || familyData.familyNodes.length === 0) {
      return { nodes: [], edges: [] }
    }

    const reactFlowNodes = []
    const reactFlowEdges = []
    const processedRelationships = new Set()

    // Tạo các node ReactFlow
    familyData.familyNodes.forEach((node) => {
      reactFlowNodes.push({
        id: node.id,
        type: "familyNode",
        position: { x: 0, y: 0 }, // Vị trí sẽ được tính toán bởi dagre
        data: {
          ...node,
          isRoot: node.id === familyData.rootId,
        },
      })

      // Tạo các edge kết nối vợ/chồng
      node.spouses.forEach((spouseId) => {
        const relationshipId = [node.id, spouseId].sort().join("-")
        if (!processedRelationships.has(relationshipId)) {
          reactFlowEdges.push({
            id: `spouse-${relationshipId}`,
            source: node.id,
            target: spouseId,
            type: "straight",
            style: { stroke: "#d97706", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#d97706",
            },
          })
          processedRelationships.add(relationshipId)
        }
      })

      // Tạo các edge kết nối cha mẹ-con
      node.children.forEach((childId) => {
        reactFlowEdges.push({
          id: `parent-${node.id}-${childId}`,
          source: node.id,
          target: childId,
          type: "straight",
          style: { stroke: "#d97706", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.Arrow,
            color: "#d97706",
          },
        })
      })
    })

    // Sắp xếp tự động các node và edge
    return getLayoutedElements(reactFlowNodes, reactFlowEdges, "TB")
  }, [familyData])

  // Khởi tạo nodes và edges khi component được mount
  useEffect(() => {
    if (familyData && !initialized) {
      const { nodes: flowNodes, edges: flowEdges } = convertFamilyDataToReactFlow()
      setNodes(flowNodes)
      setEdges(flowEdges)
      setInitialized(true)
    }
  }, [familyData, initialized, convertFamilyDataToReactFlow, setNodes, setEdges])

  // Xử lý reset view
  const handleResetView = useCallback(() => {
    const { nodes: flowNodes, edges: flowEdges } = convertFamilyDataToReactFlow()
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [convertFamilyDataToReactFlow, setNodes, setEdges])

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
          connectionLineType={ConnectionLineType.StraightLine}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#f5d742" gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap />
          <Panel position="top-right">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleResetView} title="Đặt lại góc nhìn">
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
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
