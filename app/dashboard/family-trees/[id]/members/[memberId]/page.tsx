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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Trash2, Heart, Users } from "lucide-react";
import { EditMemberModal } from "@/components/edit-member-modal";

interface Member {
  _id?: string;
  id: string;
  fullName: string;
  gender?: string;
  birthYear?: string;
  birthDate?: string;
  birthDateLunar?: string;
  birthPlace?: string;
  deathYear?: string;
  deathDate?: string;
  deathDateLunar?: string;
  deathPlace?: string;
  biography?: string;
  image?: string;
  isAlive?: boolean;
  parentId?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  childrenIds?: string[];
  generation?: number;
  role?: string;
  occupation?: string;
  notes?: string;
  hometown?: string;
  ethnicity?: string;
  nationality?: string;
  religion?: string;
  title?: string;
}

interface RelatedMember {
  id: string;
  fullName: string;
  relation: string;
}

export default function MemberDetailPage({
  params,
}: {
  params: { id: string; memberId: string };
}) {
  const [member, setMember] = useState<Member | null>(null);
  const [relatedMembers, setRelatedMembers] = useState<RelatedMember[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch member details
        const memberResponse = await fetch(
          `/api/family-trees/${params.id}/members/${params.memberId}`
        );
        if (!memberResponse.ok) {
          throw new Error("Failed to fetch member");
        }
        const memberData = await memberResponse.json();
        setMember(memberData);

        // Fetch all members for related members and edit modal
        const membersResponse = await fetch(
          `/api/family-trees/${params.id}/members`
        );
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setAllMembers(membersData);

          // Process related members
          const related: RelatedMember[] = [];

          // Father
          if (memberData.fatherId) {
            const father = membersData.find(
              (m: Member) =>
                m.id === memberData.fatherId || m._id === memberData.fatherId
            );
            if (father) {
              related.push({
                id: father.id || father._id,
                fullName: father.fullName,
                relation: "Cha",
              });
            }
          }

          // Mother
          if (memberData.motherId) {
            const mother = membersData.find(
              (m: Member) =>
                m.id === memberData.motherId || m._id === memberData.motherId
            );
            if (mother) {
              related.push({
                id: mother.id || mother._id,
                fullName: mother.fullName,
                relation: "Mẹ",
              });
            }
          }

          // Spouse
          if (memberData.spouseId) {
            const spouse = membersData.find(
              (m: Member) =>
                m.id === memberData.spouseId || m._id === memberData.spouseId
            );
            if (spouse) {
              related.push({
                id: spouse.id || spouse._id,
                fullName: spouse.fullName,
                relation: memberData.gender === "MALE" ? "Vợ" : "Chồng",
              });
            }
          }

          // Children
          if (memberData.childrenIds && memberData.childrenIds.length > 0) {
            memberData.childrenIds.forEach((childId: string) => {
              const child = membersData.find(
                (m: Member) => m.id === childId || m._id === childId
              );
              if (child) {
                related.push({
                  id: child.id || child._id,
                  fullName: child.fullName,
                  relation: "Con",
                });
              }
            });
          }

          // Also check if this member is in someone's childrenIds
          membersData.forEach((potentialParent: Member) => {
            if (
              potentialParent.childrenIds &&
              potentialParent.childrenIds.includes(
                memberData.id || memberData._id
              )
            ) {
              if (!memberData.fatherId && potentialParent.gender === "MALE") {
                related.push({
                  id: potentialParent.id || potentialParent._id,
                  fullName: potentialParent.fullName,
                  relation: "Cha",
                });
              } else if (
                !memberData.motherId &&
                potentialParent.gender === "FEMALE"
              ) {
                related.push({
                  id: potentialParent.id || potentialParent._id,
                  fullName: potentialParent.fullName,
                  relation: "Mẹ",
                });
              }
            }
          });

          setRelatedMembers(related);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin thành viên",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.memberId, toast]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `/api/family-trees/${params.id}/members/${params.memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete member");
      }

      toast({
        title: "Thành công",
        description: "Thành viên đã được xóa thành công",
      });

      router.push(`/dashboard/family-trees/${params.id}`);
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa thành viên",
        variant: "destructive",
      });
    }
  };

  const handleEditSuccess = () => {
    // Refresh member data
    fetch(`/api/family-trees/${params.id}/members/${params.memberId}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Failed to fetch member");
      })
      .then((data) => {
        setMember(data);
      })
      .catch((error) => {
        console.error("Error refreshing member:", error);
      });

    // Refresh all members
    fetch(`/api/family-trees/${params.id}/members`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Failed to fetch members");
      })
      .then((data) => {
        setAllMembers(data);
      })
      .catch((error) => {
        console.error("Error refreshing members:", error);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Không tìm thấy thành viên</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/family-trees/${params.id}`}>
            <Button variant="outline" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              {member.fullName}
            </h1>
            <p className="text-muted-foreground">
              {member.gender === "MALE"
                ? "Nam"
                : member.gender === "FEMALE"
                ? "Nữ"
                : "Khác"}
              {member.birthYear ? `, ${member.birthYear}` : ""}
              {member.generation ? `, Đời ${member.generation}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="mr-2 w-4 h-4" /> Chỉnh sửa
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 w-4 h-4" /> Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Thành viên này sẽ bị xóa
                  vĩnh viễn khỏi gia phả.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="family">Quan hệ gia đình</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={member.image || ""} alt={member.fullName} />
                  <AvatarFallback className="text-4xl">
                    {member.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {member.title && (
                  <div className="mt-4 text-center">
                    <p className="font-medium">{member.title}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Họ và tên
                    </p>
                    <p className="font-medium">{member.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Giới tính
                    </p>
                    <p>
                      {member.gender === "MALE"
                        ? "Nam"
                        : member.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác"}
                    </p>
                  </div>
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Nguyên quán
                    </p>
                    <p>{member.hometown || "Không có thông tin"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Dân tộc
                    </p>
                    <p>{member.ethnicity || "Không có thông tin"}</p>
                  </div>
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Quốc tịch
                    </p>
                    <p>{member.nationality || "Không có thông tin"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Tôn giáo
                    </p>
                    <p>{member.religion || "Không có thông tin"}</p>
                  </div>
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Năm sinh
                    </p>
                    <p>{member.birthYear || "Không có thông tin"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Ngày sinh (dương lịch)
                    </p>
                    <p>
                      {member.birthDate
                        ? formatDate(member.birthDate)
                        : "Không có thông tin"}
                    </p>
                  </div>
                </div>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Ngày sinh (âm lịch)
                    </p>
                    <p>{member.birthDateLunar || "Không có thông tin"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Nơi sinh
                    </p>
                    <p>{member.birthPlace || "Không có thông tin"}</p>
                  </div>
                </div>

                {!member.isAlive && (
                  <>
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground text-sm">
                          Năm mất
                        </p>
                        <p>{member.deathYear || "Không có thông tin"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground text-sm">
                          Ngày mất (dương lịch)
                        </p>
                        <p>
                          {member.deathDate
                            ? formatDate(member.deathDate)
                            : "Không có thông tin"}
                        </p>
                      </div>
                    </div>

                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground text-sm">
                          Ngày mất (âm lịch)
                        </p>
                        <p>{member.deathDateLunar || "Không có thông tin"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground text-sm">
                          Nơi mất
                        </p>
                        <p>{member.deathPlace || "Không có thông tin"}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Nghề nghiệp
                    </p>
                    <p>{member.occupation || "Không có thông tin"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Đời (Thế hệ)
                    </p>
                    <p>{member.generation || "Không có thông tin"}</p>
                  </div>
                </div>

                {member.notes && (
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground text-sm">
                      Ghi chú
                    </p>
                    <p className="whitespace-pre-line">{member.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quan hệ gia đình</CardTitle>
              <CardDescription>
                Các mối quan hệ gia đình của thành viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relatedMembers.length > 0 ? (
                <div className="space-y-4">
                  {relatedMembers.map((related) => (
                    <div
                      key={related.id}
                      className="flex justify-between items-center p-3 border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{related.fullName}</p>
                          <p className="text-muted-foreground text-xs">
                            {related.relation}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/family-trees/${params.id}/members/${related.id}`
                          )
                        }
                      >
                        Chi tiết
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-8 text-center">
                  <Heart className="mb-2 w-8 h-8 text-muted-foreground" />
                  <h3 className="font-medium">Chưa có thông tin quan hệ</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Thành viên này chưa có thông tin về quan hệ gia đình
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        familyTreeId={params.id}
        memberId={params.memberId}
        onSuccess={handleEditSuccess}
        members={allMembers.filter((m) => (m.id || m._id) !== params.memberId)}
      />
    </div>
  );
}
