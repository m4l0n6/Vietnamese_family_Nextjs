"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface FamilyTree {
  id: string;
  name: string;
  description: string;
  origin: string;
  foundingYear?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditFamilyTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyTreeId: string;
  onSuccess: () => void;
}

export function EditFamilyTreeModal({
  isOpen,
  onClose,
  familyTreeId,
  onSuccess,
}: EditFamilyTreeModalProps) {
  const [loading, setLoading] = useState(false);
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    origin: "",
    foundingYear: "",
    isPublic: false,
  });

  // Fetch family tree data when modal opens
  useEffect(() => {
    if (isOpen && familyTreeId) {
      const fetchFamilyTree = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/family-trees/${familyTreeId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch family tree");
          }
          const data = await response.json();
          setFamilyTree(data);

          // Set form data
          setFormData({
            name: data.name || "",
            description: data.description || "",
            origin: data.origin || "",
            foundingYear: data.foundingYear?.toString() || "",
            isPublic: data.isPublic || false,
          });
        } catch (error) {
          console.error("Error fetching family tree:", error);
          toast({
            title: "Lỗi",
            description: "Không thể tải thông tin gia phả",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchFamilyTree();
    }
  }, [isOpen, familyTreeId, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên gia phả là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    if (!formData.origin.trim()) {
      toast({
        title: "Lỗi",
        description: "Xuất đinh là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/family-trees/${familyTreeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          origin: formData.origin,
          foundingYear: formData.foundingYear
            ? Number.parseInt(formData.foundingYear)
            : null,
          isPublic: formData.isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể cập nhật gia phả");
      }

      toast({
        title: "Thành công",
        description: "Gia phả đã được cập nhật thành công",
        variant: "success",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa gia phả</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin gia phả của bạn
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên gia phả <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Gia phả họ Nguyễn"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn gọn về gia phả của bạn"
                  rows={4}
                />
              </div>

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="origin">
                    Xuất đinh <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="Ví dụ: Hà Nam"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundingYear">Năm thành lập</Label>
                  <Input
                    id="foundingYear"
                    name="foundingYear"
                    type="number"
                    value={formData.foundingYear}
                    onChange={handleChange}
                    placeholder="Ví dụ: 1750"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isPublic">Công khai gia phả</Label>
              </div>

              <div className="text-muted-foreground text-sm">
                <p>
                  Gia phả công khai sẽ hiển thị trong mục khám phá và có thể
                  được tìm kiếm bởi người dùng khác. Bạn vẫn có thể thay đổi cài
                  đặt này sau.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
