"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Users,
  GitBranch,
  CalendarDays,
  Ellipsis,
  Settings,
  Trash,
} from "lucide-react";
import { AddMemberModal } from "@/components/add-member-modal";

interface FamilyTree {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  _id?: string;
  id: string;
  fullName: string;
  gender: string;
  birthYear?: string;
  generation?: number;
}

interface Statistics {
  totalMembers: number;
  livingMembers: number;
  deceasedMembers: number;
  maleMembers: number;
  femaleMembers: number;
  generations: number;
  events: number;
}

export default function FamilyTreeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch family tree details
        const treeResponse = await fetch(`/api/family-trees/${params.id}`);
        if (!treeResponse.ok) {
          throw new Error("Failed to fetch family tree");
        }
        const treeData = await treeResponse.json();
        setFamilyTree(treeData);

        // Fetch members
        const membersResponse = await fetch(
          `/api/family-trees/${params.id}/members`
        );
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData);
        }

        // Fetch statistics
        const statsResponse = await fetch(
          `/api/family-trees/${params.id}/statistics`
        );
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStatistics(statsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin gia phả",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, toast]);

  const handleAddMemberSuccess = () => {
    // Refresh members list
    fetch(`/api/family-trees/${params.id}/members`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Failed to fetch members");
      })
      .then((data) => {
        setMembers(data);
      })
      .catch((error) => {
        console.error("Error refreshing members:", error);
      });

    // Refresh statistics
    fetch(`/api/family-trees/${params.id}/statistics`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Failed to fetch statistics");
      })
      .then((data) => {
        setStatistics(data);
      })
      .catch((error) => {
        console.error("Error refreshing statistics:", error);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!familyTree) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Không tìm thấy gia phả</p>
      </div>
    );
  }

  // Hàm xử lý chuyển hướng đến trang chi tiết thành viên
  const handleViewMemberDetails = (memberId: string) => {
    if (!memberId) {
      console.error("Member ID is undefined");
      toast({
        title: "Lỗi",
        description: "Không thể xem chi tiết thành viên",
        variant: "destructive",
      });
      return;
    }
    router.push(`/dashboard/family-trees/${params.id}/members/${memberId}`);
  };

  const handleDeleteFamilyTree = async () => {
    try {
      const response = await fetch(`/api/family-trees/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete family tree");
      }

      toast({
        title: "Thành công",
        description: "Đã xóa gia phả thành công",
      });

      router.push("/dashboard/family-trees");
    } catch (error) {
      console.error("Error deleting family tree:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa gia phả",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/family-trees">
            <Button variant="outline" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              {familyTree.name}
            </h1>
            <p className="text-muted-foreground">{familyTree.description}</p>
            <div className="flex gap-4 mt-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                <span>
                  Ngày tạo:{" "}
                  {new Date(familyTree.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                <span>
                  Cập nhật:{" "}
                  {new Date(familyTree.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="mr-2"
          >
            <Plus className="mr-2 w-4 h-4" /> Thêm thành viên
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Ellipsis className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="w-4 h-4" /> Chỉnh sửa gia phả
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive hover:text-destructive/50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="w-4 h-4" /> Xóa gia phả
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Các liên kết nhanh */}
          <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Phả hệ</CardTitle>
                <CardDescription>
                  Xem danh sách thành viên theo thế hệ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `/dashboard/family-trees/${params.id}/genealogy`
                    )
                  }
                >
                  Xem phả hệ
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Phả đồ</CardTitle>
                <CardDescription>Xem sơ đồ gia phả dạng cây</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/dashboard/family-trees/${params.id}/tree`)
                  }
                >
                  Xem phả đồ
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sự kiện</CardTitle>
                <CardDescription>
                  Quản lý các sự kiện của dòng họ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/dashboard/family-trees/${params.id}/events`)
                  }
                >
                  Xem sự kiện
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Danh sách thành viên gần đây */}
          <Card>
            <CardHeader>
              <CardTitle>Thành viên gần đây</CardTitle>
              <CardDescription>
                Các thành viên mới được thêm vào gia phả
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.slice(0, 5).map((member) => (
                    <div
                      key={member._id || member.id}
                      className="flex justify-between items-center p-3 border rounded-lg text-sm"
                    >
                      <div className="font-medium">{member.fullName}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-muted-foreground">
                          {member.gender === "MALE"
                            ? "Nam"
                            : member.gender === "FEMALE"
                            ? "Nữ"
                            : "Khác"}
                          {member.birthYear ? `, ${member.birthYear}` : ""}
                          {member.generation
                            ? `, Đời ${member.generation}`
                            : ""}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleViewMemberDetails(member._id || member.id)
                          }
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() =>
                        router.push(
                          `/dashboard/family-trees/${params.id}/genealogy`
                        )
                      }
                    >
                      Xem tất cả {members.length} thành viên
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-8 text-center">
                  <Users className="mb-2 w-8 h-8 text-muted-foreground" />
                  <h3 className="font-medium">Chưa có thành viên</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Hãy thêm thành viên đầu tiên vào gia phả
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    <Plus className="mr-2 w-4 h-4" /> Thêm thành viên
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        familyTreeId={params.id}
        onSuccess={handleAddMemberSuccess}
        members={members}
        isFirstMember={members.length === 0}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa gia phả</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa gia phả "{familyTree?.name}"? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                handleDeleteFamilyTree();
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
