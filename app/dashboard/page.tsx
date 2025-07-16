"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Users, Calendar, Heart, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  origin?: string;
  foundingYear?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  totalMembers: number;
  livingMembers: number;
  deceasedMembers: number;
  totalEvents: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalMembers: 0,
    livingMembers: 0,
    deceasedMembers: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch family trees
        const treesResponse = await fetch("/api/family-trees");
        if (!treesResponse.ok) {
          throw new Error("Failed to fetch family trees");
        }
        const treesData = await treesResponse.json();
        setFamilyTrees(treesData);

        // Fetch statistics
        const statsResponse = await fetch("/api/statistics");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStatistics(statsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex md:flex-row flex-col justify-between md:items-center gap-6">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Tổng quan gia phả
          </h1>
          <p className="text-muted-foreground">
            Xin chào, {session?.user?.name}! Quản lý gia phả của bạn.
          </p>
        </div>
        <Link href="/dashboard/family-trees/create">
          <Button className="gap-1">
            <Plus className="w-4 h-4" />
            <span>Tạo gia phả mới</span>
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Tổng số thành viên</p>
                <h3 className="mt-2 font-bold text-3xl">
                  {loading ? "..." : statistics.totalMembers}
                </h3>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Thành viên còn sống</p>
                <h3 className="mt-2 font-bold text-3xl">
                  {loading ? "..." : statistics.livingMembers}
                </h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <Heart className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Thành viên đã mất</p>
                <h3 className="mt-2 font-bold text-3xl">
                  {loading ? "..." : statistics.deceasedMembers}
                </h3>
              </div>
              <div className="bg-gray-500/20 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Tổng số gia phả</p>
                <h3 className="mt-2 font-bold text-3xl">
                  {loading ? "..." : familyTrees.length}
                </h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Gia phả của tôi</CardTitle>
            <CardDescription>
              Quản lý các gia phả mà bạn đã tạo hoặc được mời tham gia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : (
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {familyTrees.length > 0 ? (
                  <>
                    {familyTrees.map((tree) => (
                      <Link
                        href={`/dashboard/family-trees/${tree.id}`}
                        key={tree.id}
                      >
                        <div className="hover:shadow-md border rounded-lg h-full overflow-hidden transition-shadow">
                          <div className="relative w-full h-36">
                            <Image
                              src="/placeholder.svg?height=200&width=300"
                              alt={tree.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium">{tree.name}</h3>
                            <div className="flex items-center mt-1 text-muted-foreground text-sm">
                              <Users className="mr-1 w-4 h-4" />
                              <span>
                                Xuất đinh: {tree.origin || "Chưa cập nhật"}
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-muted-foreground text-sm">
                              <span>
                                Cập nhật:{" "}
                                {new Date(tree.updatedAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                ) : null}

                <Link href="/dashboard/family-trees/create">
                  <div className="flex flex-col justify-center items-center p-6 border border-dashed rounded-lg h-full min-h-[200px]">
                    <div className="bg-primary/10 mb-3 p-3 rounded-full">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium text-center">Tạo gia phả mới</h3>
                    <p className="mt-1 text-muted-foreground text-sm text-center">
                      Bắt đầu xây dựng gia phả mới cho dòng họ của bạn
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
