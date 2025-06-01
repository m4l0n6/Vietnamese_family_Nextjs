"use client";

import { useCallback, useEffect, useState } from "react";
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
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { FamilyMemberNode } from "./family-member-node";
import { ConnectionNode } from "./connection-node";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize, Download } from "lucide-react";
import type { FamilyData } from "@/lib/family-tree-types";

// Định nghĩa các node types tùy chỉnh
const nodeTypes = {
  familyMember: FamilyMemberNode,
  connection: ConnectionNode,
};

interface ReactFlowFamilyTreeProps {
  familyData: FamilyData;
  className?: string;
}

export function ReactFlowFamilyTree({
  familyData,
  className,
}: ReactFlowFamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Thay thế toàn bộ hàm getLayoutedElements bằng layout thủ công:
  const widthNode = 160;
  const spacingX = widthNode + 32; // Đảm bảo hai node thành viên cách nhau một đoạn nhỏ
  const spacingY = 280;
  const spacingCon = 300; // spacing giữa các con, lớn hơn để tránh dính nhau

  function groupByGeneration(members: any[]) {
    const map = new Map<number, any[]>();
    members.forEach((m) => {
      if (!map.has(m.generation)) map.set(m.generation, []);
      map.get(m.generation)!.push(m);
    });
    return map;
  }

  function manualLayoutFamilyTree(familyData: FamilyData) {
    if (
      !familyData ||
      !familyData.familyNodes ||
      familyData.familyNodes.length === 0
    ) {
      return { nodes: [], edges: [] };
    }
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap: Record<string, Node> = {};
    const childrenMap: Record<string, any[]> = {};
    const parentMap: Record<string, string[]> = {};
    const widthNode = 160;
    const spacingX = 60; // spacing giữa các node cùng hàng
    const spacingY = 180; // spacing giữa các thế hệ

    // 1. Tạo node cho từng thành viên
    familyData.familyNodes.forEach((member: any) => {
      nodeMap[member.id] = {
        id: member.id,
        type: "familyMember",
        position: { x: 0, y: 0 },
        data: {
          ...member,
          isRoot: member.id === familyData.rootId,
        },
      };
      // Lập bảng childrenMap
      if (member.parents && member.parents.length > 0) {
        member.parents.forEach((pid: string) => {
          if (!childrenMap[pid]) childrenMap[pid] = [];
          childrenMap[pid].push(member);
        });
        parentMap[member.id] = member.parents;
      }
    });

    // 2. Gom nhóm theo thế hệ
    const generationMap = groupByGeneration(familyData.familyNodes);
    const maxGen = Math.max(...Array.from(generationMap.keys()));

    // 3. Đặt vị trí node theo từng thế hệ, căn đều các con
    // Sử dụng một biến để theo dõi vị trí X hiện tại cho mỗi thế hệ
    const genX: Record<number, number> = {};
    let globalX = 0;

    // Đệ quy để layout từ gốc
    function layoutNode(
      nodeId: string,
      gen: number,
      xCenter: number,
      maxWidth = 800
    ) {
      const node = nodeMap[nodeId];
      if (!node) return;
      node.position = { x: xCenter, y: (gen - 1) * spacingY };
      // Lấy danh sách con của node này
      const children = familyData.familyNodes.filter(
        (m) => m.parents && m.parents.includes(nodeId)
      );
      if (children.length === 0) return;
      let spouseId = null;
      if (children[0].parents.length === 2) {
        spouseId = children[0].parents.find((pid: string) => pid !== nodeId);
      }
      if (spouseId && nodeId > spouseId) return;
      const commonChildren = children.filter(
        (child) =>
          child.parents.length === 2 &&
          child.parents.includes(nodeId) &&
          (typeof spouseId === "string"
            ? child.parents.includes(spouseId)
            : true)
      );
      const singleChildren = children.filter(
        (child) => child.parents.length === 1 && child.parents[0] === nodeId
      );
      // Layout các con chung với node ẩn (connection node)
      if (commonChildren.length > 0) {
        const n = commonChildren.length;
        const minSpacing = 40;
        const dynamicSpacingX = Math.max(
          (maxWidth - widthNode * n) / (n + 1),
          minSpacing
        );
        const totalWidth = n * widthNode + (n - 1) * dynamicSpacingX;
        let startX = xCenter - totalWidth / 2 + widthNode / 2;
        let connectionNodeId: string | null = null;
        if (typeof spouseId === "string" && nodeMap[spouseId]) {
          const parentOffset = widthNode * 1.5;
          node.position.x = xCenter - parentOffset;
          nodeMap[spouseId].position.x = xCenter + parentOffset;
          nodeMap[spouseId].position.y = node.position.y;
          if (commonChildren.length >= 2) {
            // Đặt connection node ở giữa cha mẹ, Y là trung bình giữa cha mẹ và các con
            const connectionNodeX = xCenter;
            // Tính Y trung bình của các con (nếu đã có vị trí, nếu chưa thì giả định ở gen+1)
            const childrenY = (gen + 1 - 1) * spacingY;
            const connectionNodeY = (node.position.y + childrenY) / 2;
            connectionNodeId = `connection-${nodeId}-${spouseId}`;
            if (!nodeMap[connectionNodeId]) {
              nodeMap[connectionNodeId] = {
                id: connectionNodeId,
                type: "connection",
                position: { x: connectionNodeX, y: connectionNodeY },
                data: { id: connectionNodeId },
              };
            }
            // Nối cha và mẹ đến node ẩn
            edges.push({
              id: `edge-${nodeId}-to-conn-${connectionNodeId}`,
              source: nodeId,
              target: connectionNodeId,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            });
            edges.push({
              id: `edge-${spouseId}-to-conn-${connectionNodeId}`,
              source: spouseId,
              target: connectionNodeId,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            });
            // Đặt các con cách đều nhau, căn giữa theo connectionNodeX, spacing động
            const n = commonChildren.length;
            const minSpacing = 40;
            const totalWidth = n * widthNode + (n - 1) * minSpacing;
            const dynamicSpacingX =
              (totalWidth - widthNode * n) / (n - 1 > 0 ? n - 1 : 1);
            const startX = connectionNodeX - totalWidth / 2 + widthNode / 2;
            commonChildren.forEach((child, idx) => {
              const childX = startX + idx * (widthNode + dynamicSpacingX);
              layoutNode(child.id, gen + 1, childX, maxWidth / n);
              if (connectionNodeId) {
                edges.push({
                  id: `edge-conn-${connectionNodeId}-to-child-${child.id}`,
                  source: connectionNodeId,
                  target: child.id,
                  sourceHandle: "bottom",
                  targetHandle: "top",
                  type: "smoothstep",
                  animated: false,
                  style: { stroke: "#888", strokeWidth: 2 },
                });
              }
            });
          } else {
            // Nếu chỉ có 1 con chung, nối thẳng từ cha mẹ xuống con
            const child = commonChildren[0];
            const childX = xCenter;
            layoutNode(child.id, gen + 1, childX, maxWidth);
            edges.push({
              id: `edge-parent-${nodeId}-to-child-${child.id}`,
              source: nodeId,
              target: child.id,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            });
            edges.push({
              id: `edge-parent-${spouseId}-to-child-${child.id}`,
              source: spouseId,
              target: child.id,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            });
          }
        } else {
          // Không có spouse, vẫn layout như cũ
          commonChildren.forEach((child, idx) => {
            const childX = startX + idx * (widthNode + dynamicSpacingX);
            layoutNode(child.id, gen + 1, childX, maxWidth / n);
            edges.push({
              id: `edge-parent-${nodeId}-to-child-${child.id}`,
              source: nodeId,
              target: child.id,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            });
          });
        }
      }
      // Layout các con đơn thân
      if (singleChildren.length > 0) {
        const n = singleChildren.length;
        const minSpacing = 40;
        const dynamicSpacingX = Math.max(
          (maxWidth - widthNode * n) / (n + 1),
          minSpacing
        );
        const totalWidth = n * widthNode + (n - 1) * dynamicSpacingX;
        let startX = xCenter - totalWidth / 2 + widthNode / 2;
        singleChildren.forEach((child, idx) => {
          const childX = startX + idx * (widthNode + dynamicSpacingX);
          layoutNode(child.id, gen + 1, childX, maxWidth / n);
          edges.push({
            id: `edge-parent-${nodeId}-to-child-${child.id}`,
            source: nodeId,
            target: child.id,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "smoothstep",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          });
        });
      }
    }

    // Tìm node gốc và bắt đầu layout
    const rootNode = familyData.familyNodes.find(
      (m) => m.id === familyData.rootId
    );
    if (rootNode) {
      layoutNode(rootNode.id, rootNode.generation, 0);
    }

    // Đưa node vào mảng nodes (bao gồm cả node ẩn connection)
    Object.values(nodeMap).forEach((n) => nodes.push(n));
    return { nodes, edges };
  }

  // Khởi tạo nodes và edges khi component được mount
  useEffect(() => {
    if (familyData) {
      setLoading(true);
      const { nodes, edges } = manualLayoutFamilyTree(familyData);
      setNodes(nodes);
      setEdges(edges);
      setLoading(false);
    }
  }, [familyData, setNodes, setEdges]);

  // Xử lý reset view
  const handleResetView = useCallback(async () => {
    setLoading(true);
    try {
      const { nodes: flowNodes, edges: flowEdges } =
        manualLayoutFamilyTree(familyData);
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error("Error resetting view:", error);
    } finally {
      setLoading(false);
    }
  }, [familyData, setNodes, setEdges]);

  // Xử lý xuất hình ảnh
  const handleDownloadImage = useCallback(() => {
    const reactFlowInstance = document.querySelector(".react-flow");
    if (reactFlowInstance) {
      // Sử dụng html2canvas hoặc dom-to-image để chuyển đổi DOM thành hình ảnh
      alert("Chức năng xuất hình ảnh sẽ được triển khai sau");
    }
  }, []);

  // Xử lý xem toàn màn hình
  const handleFullscreen = useCallback(() => {
    const reactFlowInstance = document.querySelector(".react-flow-wrapper");
    if (reactFlowInstance) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        reactFlowInstance.requestFullscreen();
      }
    }
  }, []);

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
  );
}
