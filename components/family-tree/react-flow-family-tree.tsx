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
} from "reactflow"
import "reactflow/dist/style.css"
import type { FamilyData } from "@/lib/family-tree-types"
import { FamilyNode } from "./family-node-reactflow"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

// Định nghĩa các node types tùy chỉnh
const nodeTypes = {
  familyNode: FamilyNode,
}

interface ReactFlowFamilyTreeProps {
  familyData: FamilyData
  className?: string
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
    const nodePositions = {}
    const generationHeights = {}
    const generationWidths = {}
    const nodesByGeneration = {}

    // Nhóm các node theo thế hệ
    familyData.familyNodes.forEach((node) => {
      const generation = node.generation || 1
      if (!nodesByGeneration[generation]) {
        nodesByGeneration[generation] = []
      }
      nodesByGeneration[generation].push(node)
    })

    // Tính toán chiều cao cho mỗi thế hệ
    const generations = Object.keys(nodesByGeneration)
      .map(Number)
      .sort((a, b) => a - b)
    const NODE_WIDTH = 180
    const NODE_HEIGHT = 200
    const HORIZONTAL_SPACING = 50
    const VERTICAL_SPACING = 150

    // Tính toán vị trí cho mỗi node
    generations.forEach((generation) => {
      const nodesInGeneration = nodesByGeneration[generation]
      const totalWidth = nodesInGeneration.length * NODE_WIDTH + (nodesInGeneration.length - 1) * HORIZONTAL_SPACING
      const startX = -totalWidth / 2

      // Sắp xếp các node trong cùng thế hệ
      // Ưu tiên sắp xếp vợ chồng gần nhau
      const processedNodes = new Set()
      const orderedNodes = []

      // Đầu tiên, thêm các node gốc
      nodesInGeneration.forEach((node) => {
        if (node.id === familyData.rootId && !processedNodes.has(node.id)) {
          orderedNodes.push(node)
          processedNodes.add(node.id)
        }
      })

      // Sau đó, thêm các cặp vợ chồng
      nodesInGeneration.forEach((node) => {
        if (!processedNodes.has(node.id)) {
          orderedNodes.push(node)
          processedNodes.add(node.id)

          // Thêm vợ/chồng ngay sau node hiện tại
          node.spouses.forEach((spouseId) => {
            const spouse = nodesInGeneration.find((n) => n.id === spouseId)
            if (spouse && !processedNodes.has(spouseId)) {
              orderedNodes.push(spouse)
              processedNodes.add(spouseId)
            }
          })
        }
      })

      // Thêm các node còn lại
      nodesInGeneration.forEach((node) => {
        if (!processedNodes.has(node.id)) {
          orderedNodes.push(node)
          processedNodes.add(node.id)
        }
      })

      // Tính toán vị trí cho mỗi node
      orderedNodes.forEach((node, index) => {
        const x = startX + index * (NODE_WIDTH + HORIZONTAL_SPACING)
        const y = generation * VERTICAL_SPACING
        nodePositions[node.id] = { x, y }
      })
    })

    // Tạo các node ReactFlow
    familyData.familyNodes.forEach((node) => {
      const position = nodePositions[node.id] || { x: 0, y: 0 }
      reactFlowNodes.push({
        id: node.id,
        type: "familyNode",
        position,
        data: {
          ...node,
          isRoot: node.id === familyData.rootId,
        },
      })
    })

    // Tạo các edge kết nối
    familyData.familyNodes.forEach((node) => {
      // Kết nối với vợ/chồng
      node.spouses.forEach((spouseId) => {
        // Chỉ tạo một edge giữa hai vợ chồng
        if (node.id < spouseId) {
          reactFlowEdges.push({
            id: `spouse-${node.id}-${spouseId}`,
            source: node.id,
            target: spouseId,
            type: "straight",
            style: { stroke: "#d97706", strokeWidth: 2 },
          })
        }
      })

      // Kết nối với con cái
      if (node.children.length > 0) {
        // Tạo một node ảo làm điểm trung gian
        const virtualNodeId = `virtual-${node.id}`
        const nodePosition = nodePositions[node.id]

        // Thêm node ảo (không hiển thị) để làm điểm kết nối
        reactFlowNodes.push({
          id: virtualNodeId,
          position: {
            x: nodePosition.x + NODE_WIDTH / 2,
            y: nodePosition.y + NODE_HEIGHT + 50,
          },
          data: {},
          style: { width: 1, height: 1, visibility: "hidden" },
        })

        // Kết nối từ node cha/mẹ đến node ảo
        reactFlowEdges.push({
          id: `parent-${node.id}-${virtualNodeId}`,
          source: node.id,
          target: virtualNodeId,
          type: "straight",
          style: { stroke: "#d97706", strokeWidth: 2 },
        })

        // Kết nối từ node ảo đến các con
        node.children.forEach((childId) => {
          reactFlowEdges.push({
            id: `child-${virtualNodeId}-${childId}`,
            source: virtualNodeId,
            target: childId,
            type: "straight",
            style: { stroke: "#d97706", strokeWidth: 2 },
          })
        })
      }
    })

    return { nodes: reactFlowNodes, edges: reactFlowEdges }
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

  // Xử lý zoom in
  const handleZoomIn = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        return {
          ...node,
          position: {
            x: node.position.x * 1.2,
            y: node.position.y * 1.2,
          },
        }
      }),
    )
  }, [setNodes])

  // Xử lý zoom out
  const handleZoomOut = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        return {
          ...node,
          position: {
            x: node.position.x * 0.8,
            y: node.position.y * 0.8,
          },
        }
      }),
    )
  }, [setNodes])

  // Xử lý reset view
  const handleResetView = useCallback(() => {
    const { nodes: flowNodes, edges: flowEdges } = convertFamilyDataToReactFlow()
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [convertFamilyDataToReactFlow, setNodes, setEdges])

  return (
    <div className={`h-[600px] ${className}`}>
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
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
