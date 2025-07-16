"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Download,
} from "lucide-react";
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
import { FamilyMemberNode } from "./family-tree/family-member-node";
import { ConnectionNode } from "./family-tree/connection-node";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Định nghĩa các node types tùy chỉnh
const nodeTypes = {
  familyMember: FamilyMemberNode,
  connection: ConnectionNode,
};

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
};

export default function FamilyTreePreview() {
  const [activeTab, setActiveTab] = useState("tree");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hàm chuyển đổi dữ liệu cây thành nodes và edges cho React Flow
  const convertToFlowData = (data: any) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap: Record<string, Node> = {};
    const widthNode = 160;
    const spacingX = 120;
    const spacingY = 220;
    let connectionNodeId = 1000; // unique id for connection nodes

    // Hàm tính chiều rộng logic của một node (số lá trong nhánh con cháu)
    const getSubtreeWidth = (member: any): number => {
      if (!member.children || member.children.length === 0) return 1;
      return member.children.reduce(
        (sum: number, child: any) => sum + getSubtreeWidth(child),
        0
      );
    };

    // Hàm đệ quy để tạo nodes và edges
    const createNodesAndEdges = (
      member: any,
      x: number,
      generation: number
    ) => {
      const y = generation * spacingY;
      // Nếu có spouse, vẽ cả hai node vợ/chồng cạnh nhau
      let spouseOffset = 0;
      if (member.spouse) {
        spouseOffset = widthNode + spacingX * 2;
        // Vẽ node spouse
        const spouseNode: Node = {
          id: member.spouse.id,
          type: "familyMember",
          position: { x: x + spouseOffset, y },
          data: {
            ...member.spouse,
            isRoot: false,
            parentHandleType:
              member.spouse.gender === "male" ? "right" : "left",
          },
        };
        nodes.push(spouseNode);
        nodeMap[member.spouse.id] = spouseNode;
      }

      // Vẽ node member
      const node: Node = {
        id: member.id,
        type: "familyMember",
        position: { x, y },
        data: {
          ...member,
          isRoot: member.id === "1",
          parentHandleType: member.spouse
            ? member.gender === "male"
              ? "right"
              : "left"
            : "bottom",
        },
      };
      nodes.push(node);
      nodeMap[member.id] = node;

      // Nếu có spouse và có con chung
      if (member.spouse && member.children && member.children.length > 0) {
        const childrenWidths = member.children.map((child: any) =>
          getSubtreeWidth(child)
        );
        const totalChildrenWidth = childrenWidths.reduce(
          (sum: number, w: number) => sum + w,
          0
        );
        // Nếu chỉ có 1 con
        if (member.children.length === 1) {
          // Đặt cha, mẹ, connection node, và con cùng trục X
          const centerX = x + spouseOffset / 2;
          // Cha
          node.position.x = centerX - spouseOffset / 2;
          // Mẹ
          if (member.spouse) {
            nodeMap[member.spouse.id].position.x = centerX + spouseOffset / 2;
          }
          // Connection node
          const connId = `conn-${connectionNodeId++}`;
          const connY = generation * spacingY + 160;
          nodes.push({
            id: connId,
            type: "connection",
            position: { x: centerX, y: connY },
            data: { id: connId },
          });
          // Nối từ cha/mẹ vào connection node
          edges.push({
            id: `edge-${member.id}-${connId}`,
            source: member.id,
            target: connId,
            sourceHandle: "right",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          });
          edges.push({
            id: `edge-${member.spouse.id}-${connId}`,
            source: member.spouse.id,
            target: connId,
            sourceHandle: "left",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          });
          // Vẽ con cùng trục X
          createNodesAndEdges(member.children[0], centerX, generation + 1);
          edges.push({
            id: `edge-${connId}-${member.children[0].id}`,
            source: connId,
            target: member.children[0].id,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          });
        } else {
          // Nhiều con: connection node ở trung tâm các con
          let startX =
            x +
            spouseOffset / 2 -
            (totalChildrenWidth * widthNode +
              (totalChildrenWidth - 1) * spacingX) /
              2 +
            widthNode / 2;
          let currentX = startX;
          const childCenters: number[] = [];
          member.children.forEach((child: any, index: number) => {
            const childWidth = childrenWidths[index];
            const childCenterX =
              currentX +
              (childWidth * widthNode + (childWidth - 1) * spacingX) / 2 -
              widthNode / 2;
            childCenters.push(childCenterX);
            currentX += childWidth * widthNode + childWidth * spacingX;
          });
          // Connection node ở trung tâm các con
          const centerX =
            childCenters.reduce((sum, cx) => sum + cx, 0) / childCenters.length;
          const connId = `conn-${connectionNodeId++}`;
          const connY = generation * spacingY + 160;
          nodes.push({
            id: connId,
            type: "connection",
            position: { x: centerX, y: connY },
            data: { id: connId },
          });
          // Cha
          node.position.x = centerX - spouseOffset / 2;
          // Mẹ
          if (member.spouse) {
            nodeMap[member.spouse.id].position.x = centerX + spouseOffset / 2;
          }
          // Nối từ cha/mẹ vào connection node
          edges.push({
            id: `edge-${member.id}-${connId}`,
            source: member.id,
            target: connId,
            sourceHandle: "right",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          });
          edges.push({
            id: `edge-${member.spouse.id}-${connId}`,
            source: member.spouse.id,
            target: connId,
            sourceHandle: "left",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          });
          // Vẽ các con, căn đều theo width logic của từng nhánh con cháu
          currentX = startX;
          member.children.forEach((child: any, index: number) => {
            const childWidth = childrenWidths[index];
            const childCenterX = childCenters[index];
            createNodesAndEdges(child, childCenterX, generation + 1);
            edges.push({
              id: `edge-${connId}-${child.id}`,
              source: connId,
              target: child.id,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "step",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            });
          });
        }
      } else if (member.children && member.children.length > 0) {
        // Trường hợp chỉ có 1 parent
        const childrenWidths = member.children.map((child: any) =>
          getSubtreeWidth(child)
        );
        const totalChildrenWidth = childrenWidths.reduce(
          (sum: number, w: number) => sum + w,
          0
        );
        if (member.children.length === 1) {
          // Cha/mẹ và con cùng trục X
          createNodesAndEdges(member.children[0], x, generation + 1);
          edges.push({
            id: `edge-${member.id}-${member.children[0].id}`,
            source: member.id,
            target: member.children[0].id,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "step",
            animated: false,
            style: { stroke: "#888", strokeWidth: 2 },
          });
        } else {
          let startX =
            x -
            (totalChildrenWidth * widthNode +
              (totalChildrenWidth - 1) * spacingX) /
              2 +
            widthNode / 2;
          let currentX = startX;
          member.children.forEach((child: any, index: number) => {
            const childWidth = childrenWidths[index];
            const childCenterX =
              currentX +
              (childWidth * widthNode + (childWidth - 1) * spacingX) / 2 -
              widthNode / 2;
            createNodesAndEdges(child, childCenterX, generation + 1);
            edges.push({
              id: `edge-${member.id}-${child.id}`,
              source: member.id,
              target: child.id,
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "step",
              animated: false,
              style: { stroke: "#888", strokeWidth: 2 },
            });
            currentX += childWidth * widthNode + childWidth * spacingX;
          });
        }
      }
    };

    // Bắt đầu từ node gốc, generation = 0
    createNodesAndEdges(data, 0, 0);
    return { nodes, edges };
  };

  // Khởi tạo nodes và edges khi component được mount
  useEffect(() => {
    if (activeTab === "tree") {
      setLoading(true);
      const { nodes, edges } = convertToFlowData(familyTreeData);
      setNodes(nodes);
      setEdges(edges);
      setLoading(false);
    }
  }, [activeTab, setNodes, setEdges]);

  // Xử lý reset view
  const handleResetView = () => {
    setLoading(true);
    try {
      const { nodes: flowNodes, edges: flowEdges } =
        convertToFlowData(familyTreeData);
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error("Error resetting view:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xuất hình ảnh
  const handleDownloadImage = () => {
    alert("Chức năng xuất hình ảnh sẽ được triển khai sau");
  };

  // Xử lý xem toàn màn hình
  const handleFullscreen = () => {
    const reactFlowInstance = document.querySelector(".react-flow-wrapper");
    if (reactFlowInstance) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        reactFlowInstance.requestFullscreen();
      }
    }
  };

  // Hàm đệ quy để lấy tất cả thành viên theo thế hệ
  const getMembersByGeneration = (
    member: any,
    membersByGen: Record<number, any[]>
  ) => {
    if (!membersByGen[member.generation]) {
      membersByGen[member.generation] = [];
    }
    membersByGen[member.generation].push(member);

    if (member.children && member.children.length > 0) {
      member.children.forEach((child: any) =>
        getMembersByGeneration(child, membersByGen)
      );
    }
  };

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
              <Badge
                variant="secondary"
                className="bg-blue-100 hover:bg-blue-100 text-blue-700"
              >
                Nam
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-pink-100 hover:bg-pink-100 text-pink-700"
              >
                Nữ
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Hàm hiển thị danh sách thành viên theo thế hệ
  const renderFamilyList = () => {
    const membersByGen: Record<number, any[]> = {};
    getMembersByGeneration(familyTreeData, membersByGen);

    // Sắp xếp các thế hệ theo thứ tự tăng dần
    const generations = Object.keys(membersByGen)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <div className="space-y-6">
        {generations.map((gen) => (
          <div key={gen} className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-1 text-sm">
                Đời {gen}
              </Badge>
              <div className="text-muted-foreground text-sm">
                {membersByGen[gen].length} thành viên
              </div>
            </div>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {membersByGen[gen].map((member) => renderMember(member))}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
