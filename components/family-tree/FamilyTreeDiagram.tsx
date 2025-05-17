"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import dagre from "dagre"
import { FamilyMemberNode } from "./FamilyMemberNode"
import { sampleFamilyData } from "./sampleFamilyData"

// Define custom node types
const nodeTypes = {
  familyMember: FamilyMemberNode,
}

// Dagre graph layout setup
const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const nodeWidth = 180
  const nodeHeight = 120

  // Set graph direction and spacing
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  })

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Calculate layout
  dagre.layout(dagreGraph)

  // Apply calculated positions to nodes
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

// Process family data into nodes and edges
const createNodesAndEdges = (familyData) => {
  const nodes = []
  const edges = []
  const processedRelationships = new Set()

  // Create nodes for each family member
  familyData.members.forEach((member) => {
    nodes.push({
      id: member.id,
      type: "familyMember",
      data: {
        ...member,
        isRoot: member.id === familyData.rootId,
      },
      position: { x: 0, y: 0 }, // Will be calculated by dagre
    })
  })

  // Create edges for relationships
  familyData.members.forEach((member) => {
    // Spouse connections (horizontal)
    if (member.spouseId) {
      const relationshipId = [member.id, member.spouseId].sort().join("-")
      if (!processedRelationships.has(relationshipId)) {
        edges.push({
          id: `spouse-${relationshipId}`,
          source: member.id,
          target: member.spouseId,
          type: "straight",
          style: { stroke: "#d97706", strokeWidth: 2 },
        })
        processedRelationships.add(relationshipId)
      }
    }

    // Parent-child connections
    if (member.children && member.children.length > 0) {
      member.children.forEach((childId) => {
        edges.push({
          id: `parent-${member.id}-${childId}`,
          source: member.id,
          target: childId,
          type: "smoothstep",
          style: { stroke: "#d97706", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.Arrow,
            color: "#d97706",
          },
        })
      })
    }
  })

  return getLayoutedElements(nodes, edges, "TB")
}

export function FamilyTreeDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [initialized, setInitialized] = useState(false)

  // Initialize nodes and edges
  useEffect(() => {
    if (!initialized) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = createNodesAndEdges(sampleFamilyData)
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      setInitialized(true)
    }
  }, [initialized, setNodes, setEdges])

  // Reset view handler
  const handleResetView = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = createNodesAndEdges(sampleFamilyData)
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [setNodes, setEdges])

  return (
    <div className="h-[700px] w-full border border-gray-200 rounded-lg overflow-hidden bg-amber-50">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          attributionPosition="bottom-right"
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Background color="#f5d742" gap={16} size={1} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Panel position="top-right">
            <button
              onClick={handleResetView}
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Reset View
            </button>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
