"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Upload, X, Calendar, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { uploadToBlob } from "@/lib/blob";
import Image from "next/image";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isValid, parse } from "date-fns";
import { vi } from "date-fns/locale";

interface Member {
  _id?: string;
  id: string;
  fullName: string;
  gender: string;
  generation?: number;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyTreeId: string;
  onSuccess: () => void;
  members: Member[];
  isFirstMember?: boolean;
}

export function AddMemberModal({
  isOpen,
  onClose,
  familyTreeId,
  onSuccess,
  members,
  isFirstMember = false,
}: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const currentDate = new Date();
  const [availableParents, setAvailableParents] = useState<Member[]>([]);
  const [hasParentsInPreviousGeneration, setHasParentsInPreviousGeneration] =
    useState(true);
  const [availableSpouses, setAvailableSpouses] = useState<Member[]>([]);
  const [hasSpousesInCurrentGeneration, setHasSpousesInCurrentGeneration] =
    useState(false);
  const [canAddMember, setCanAddMember] = useState(true);
  const [hasSelectedRelationship, setHasSelectedRelationship] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    birthYear: "",
    birthDate: null as Date | null,
    birthDateInput: "",
    birthDateLunar: "",
    deathYear: "",
    deathDate: null as Date | null,
    deathDateInput: "",
    deathDateLunar: "",
    role: "",
    generation: isFirstMember ? "1" : "",
    fatherId: "",
    motherId: "",
    spouseId: "",
    occupation: "",
    birthPlace: "",
    deathPlace: "",
    notes: "",
    isAlive: true,
    hometown: "", // Nguyên quán
    ethnicity: "", // Dân tộc
    nationality: "Việt Nam", // Quốc tịch
    religion: "", // Tôn giáo
    title: "", // Danh hiệu
    image: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: "",
        gender: "",
        birthYear: "",
        birthDate: null,
        birthDateInput: "",
        birthDateLunar: "",
        deathYear: "",
        deathDate: null,
        deathDateInput: "",
        deathDateLunar: "",
        role: "",
        generation: isFirstMember ? "1" : "",
        fatherId: "",
        motherId: "",
        spouseId: "",
        occupation: "",
        birthPlace: "",
        deathPlace: "",
        notes: "",
        isAlive: true,
        hometown: "",
        ethnicity: "",
        nationality: "Việt Nam",
        religion: "",
        title: "",
        image: "",
      });
      setValidationErrors([]);
      setActiveTab("basic");
      setImageFile(null);
      setImagePreview(null);
      setHasSelectedRelationship(false);
    }
  }, [isOpen, isFirstMember]);

  // Cập nhật danh sách bố mẹ và vợ/chồng dựa trên đời được chọn
  useEffect(() => {
    if (formData.generation && !isFirstMember) {
      const currentGeneration = Number.parseInt(formData.generation, 10);
      const previousGeneration = currentGeneration - 1;

      // Lọc thành viên ở đời hiện tại (cho vợ/chồng)
      const spousesInCurrentGeneration = members.filter((member) => {
        return member.generation === currentGeneration;
      });

      setAvailableSpouses(spousesInCurrentGeneration);
      setHasSpousesInCurrentGeneration(spousesInCurrentGeneration.length > 0);

      if (previousGeneration < 1) {
        setAvailableParents([]);
        setHasParentsInPreviousGeneration(false);
        return;
      }

      // Lọc thành viên ở đời trước đó (cho bố mẹ)
      const parentsInPreviousGeneration = members.filter(
        (member) => member.generation === previousGeneration
      );
      setAvailableParents(parentsInPreviousGeneration);
      setHasParentsInPreviousGeneration(parentsInPreviousGeneration.length > 0);

      // Nếu không có thành viên ở đời trước, reset các trường fatherId và motherId
      if (parentsInPreviousGeneration.length === 0) {
        setFormData((prev) => ({
          ...prev,
          fatherId: "",
          motherId: "",
        }));
      }

      // Xác định xem có thể thêm thành viên hay không
      // Có thể thêm nếu: có bố/mẹ ở đời trước HOẶC có vợ/chồng ở đời hiện tại
      setCanAddMember(
        parentsInPreviousGeneration.length > 0 ||
          spousesInCurrentGeneration.length > 0
      );
    }
  }, [formData.generation, members, isFirstMember]);

  // Kiểm tra xem đã chọn ít nhất một mối quan hệ chưa
  useEffect(() => {
    const hasFather = formData.fatherId && formData.fatherId !== "none";
    const hasMother = formData.motherId && formData.motherId !== "none";
    const hasSpouse = formData.spouseId && formData.spouseId !== "none";

    setHasSelectedRelationship(
      hasFather || hasMother || hasSpouse || isFirstMember
    );
  }, [formData.fatherId, formData.motherId, formData.spouseId, isFirstMember]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Setting ${name} to ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [`${fieldName}Input`]: value }));

    // Parse date from string input
    const parsedDate = parse(value, "dd-MM-yyyy", new Date());
    if (isValid(parsedDate)) {
      handleDateChange(fieldName, parsedDate);
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => {
      // Update the date
      const newState = { ...prev, [name]: date };

      // If we have a valid date, also update the year and the text input
      if (date) {
        if (name === "birthDate") {
          newState.birthYear = date.getFullYear().toString();
          newState.birthDateInput = format(date, "dd-MM-yyyy");
        } else if (name === "deathDate") {
          newState.deathYear = date.getFullYear().toString();
          newState.deathDateInput = format(date, "dd-MM-yyyy");
        }
      }

      return newState;
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAlive: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tệp hình ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước tệp không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Kiểm tra các trường bắt buộc
    if (!formData.fullName) errors.push("Họ tên là bắt buộc");
    if (!formData.gender) errors.push("Giới tính là bắt buộc");
    if (!formData.hometown) errors.push("Nguyên quán là bắt buộc");
    if (!formData.ethnicity) errors.push("Dân tộc là bắt buộc");
    if (!formData.nationality) errors.push("Quốc tịch là bắt buộc");

    // Kiểm tra đời (thế hệ)
    if (!formData.generation) {
      errors.push("Đời (Thế hệ) là bắt buộc");
    } else if (!isFirstMember) {
      const currentGeneration = Number.parseInt(formData.generation, 10);

      // Kiểm tra xem có thành viên ở đời trước không
      if (currentGeneration > 1) {
        const previousGeneration = currentGeneration - 1;
        const parentsInPreviousGeneration = members.filter(
          (member) => member.generation === previousGeneration
        );
        const spousesInCurrentGeneration = members.filter(
          (member) => member.generation === currentGeneration
        );

        // Nếu không có bố mẹ ở đời trước VÀ không có vợ/chồng ở đời hiện tại
        if (
          parentsInPreviousGeneration.length === 0 &&
          spousesInCurrentGeneration.length === 0
        ) {
          errors.push(
            `Không thể thêm thành viên ở đời ${currentGeneration} khi chưa có thành viên ở đời ${previousGeneration} hoặc vợ/chồng ở đời ${currentGeneration}`
          );
        }
      }
    }

    // Kiểm tra quan hệ gia đình - chỉ cần chọn 1 trong 3 quan hệ
    if (
      !isFirstMember &&
      (formData.fatherId === "" || formData.fatherId === "none") &&
      (formData.motherId === "" || formData.motherId === "none") &&
      (formData.spouseId === "" || formData.spouseId === "none")
    ) {
      errors.push("Phải chọn ít nhất một trong ba: Cha, Mẹ hoặc Vợ/Chồng");
    }

    // Kiểm tra vai trò trong gia đình - chỉ bắt buộc khi đã chọn mối quan hệ
    if (hasSelectedRelationship && !formData.role) {
      errors.push("Vai trò trong gia đình là bắt buộc");
    }

    // Kiểm tra ngày sinh
    if (formData.birthDate && formData.birthDate > currentDate) {
      errors.push("Ngày sinh không được vượt quá ngày hiện tại");
    }

    // Kiểm tra năm sinh
    if (formData.birthYear) {
      const birthYear = Number.parseInt(formData.birthYear);
      if (birthYear > currentDate.getFullYear()) {
        errors.push("Năm sinh không được vượt quá năm hiện tại");
      }
    }

    // Kiểm tra ngày mất
    if (!formData.isAlive) {
      if (formData.deathDate) {
        if (formData.deathDate > currentDate) {
          errors.push("Ngày mất không được vượt quá ngày hiện tại");
        }

        if (formData.birthDate && formData.deathDate < formData.birthDate) {
          errors.push("Ngày mất phải sau ngày sinh");
        }
      }

      if (formData.deathYear) {
        const deathYear = Number.parseInt(formData.deathYear);
        if (deathYear > currentDate.getFullYear()) {
          errors.push("Năm mất không được vượt quá năm hiện tại");
        }

        if (formData.birthYear) {
          const birthYear = Number.parseInt(formData.birthYear);
          if (deathYear < birthYear) {
            errors.push("Năm mất phải sau năm sinh");
          }
        }
      }
    }

    // Kiểm tra quan hệ cha con
    if (
      formData.fatherId &&
      formData.fatherId !== "none" &&
      formData.birthYear
    ) {
      const father = members.find(
        (m) => m.id === formData.fatherId || m._id === formData.fatherId
      );
      if (father && father.birthYear) {
        const fatherBirthYear = Number.parseInt(father.birthYear);
        const childBirthYear = Number.parseInt(formData.birthYear);
        if (fatherBirthYear > 0 && childBirthYear - fatherBirthYear < 16) {
          errors.push("Tuổi con phải cách tuổi bố ít nhất 16 năm");
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Upload image if selected
      let imageUrl = "";
      if (imageFile) {
        setUploadingImage(true);
        try {
          const result = await uploadToBlob(imageFile, "members");
          imageUrl = result.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Lỗi",
            description: "Không thể tải lên ảnh đại diện",
            variant: "destructive",
          });
        } finally {
          setUploadingImage(false);
        }
      }

      // Chuẩn bị dữ liệu để gửi
      const dataToSubmit = {
        ...formData,
        image: imageUrl,
        generation: Number.parseInt(formData.generation, 10), // Đảm bảo generation là số
      };

      // Xử lý các trường quan hệ
      if (dataToSubmit.fatherId === "none" || dataToSubmit.fatherId === "") {
        dataToSubmit.fatherId = null;
      }

      if (dataToSubmit.motherId === "none" || dataToSubmit.motherId === "") {
        dataToSubmit.motherId = null;
      }

      if (dataToSubmit.spouseId === "none" || dataToSubmit.spouseId === "") {
        dataToSubmit.spouseId = null;
      }

      console.log("Submitting data:", dataToSubmit);

      // Submit form data with image URL
      const response = await fetch(
        `/api/family-trees/${familyTreeId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Không thể tạo thành viên");
      }

      toast({
        title: "Thành công",
        description: "Thành viên đã được tạo thành công",
        variant: "success",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Các gợi ý vai trò dựa trên mối quan hệ đã chọn
  const getRoleSuggestions = () => {
    const hasFather = formData.fatherId && formData.fatherId !== "none";
    const hasMother = formData.motherId && formData.motherId !== "none";
    const hasSpouse = formData.spouseId && formData.spouseId !== "none";

    if (hasFather || hasMother) {
      return ["Con đẻ", "Con nuôi", "Con rể", "Con dâu"];
    } else if (hasSpouse) {
      return ["Vợ", "Chồng"];
    }

    return [];
  };

  const roleSuggestions = getRoleSuggestions();

  // Debug: Hiển thị thông tin về các thành viên có sẵn
  console.log("All members:", members);
  console.log("Available spouses:", availableSpouses);
  console.log(
    "Current generation:",
    formData.generation ? Number.parseInt(formData.generation, 10) : "Not set"
  );
  console.log("Current spouse selection:", formData.spouseId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm thành viên mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để thêm thành viên mới vào gia phả
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <ul className="pl-4 list-disc">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="family">Quan hệ gia đình</TabsTrigger>
              <TabsTrigger value="additional">Thông tin bổ sung</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {imagePreview ? (
                    <div className="relative border-4 border-primary/10 rounded-full w-32 h-32 overflow-hidden">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="top-0 right-0 absolute bg-destructive p-1 rounded-full text-destructive-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Avatar className="w-32 h-32">
                      <AvatarFallback>
                        {formData.fullName
                          ? formData.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 w-4 h-4" />
                    Tải lên ảnh đại diện
                  </Button>
                </div>
                <p className="mt-2 text-muted-foreground text-xs">
                  Hỗ trợ định dạng JPG, PNG. Tối đa 5MB.
                </p>
              </div>

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên đầy đủ"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Giới tính <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hometown">
                    Nguyên quán <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hometown"
                    name="hometown"
                    value={formData.hometown}
                    onChange={handleChange}
                    placeholder="Nhập nguyên quán"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethnicity">
                    Dân tộc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ethnicity"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                    placeholder="Nhập dân tộc"
                    required
                  />
                </div>
              </div>

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nationality">
                    Quốc tịch <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Nhập quốc tịch"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion">Tôn giáo</Label>
                  <Input
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    placeholder="Nhập tôn giáo"
                  />
                </div>
              </div>

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="birthYear">Năm sinh</Label>
                  <Input
                    id="birthYear"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    placeholder="Nhập năm sinh"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Ngày sinh (dương lịch)</Label>
                  <div className="flex flex-col space-y-1">
                    <div className="flex gap-2">
                      <Input
                        id="birthDateInput"
                        name="birthDateInput"
                        type="text"
                        placeholder="dd-mm-yyyy"
                        value={formData.birthDateInput || ""}
                        onChange={(e) => handleDateInputChange(e, "birthDate")}
                        className="flex-1"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" type="button">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={formData.birthDate || undefined}
                            onSelect={(date) =>
                              handleDateChange("birthDate", date)
                            }
                            initialFocus
                            locale={vi}
                            disabled={(date) => date > currentDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Định dạng dd-mm-yyyy (ngày-tháng-năm)
                    </p>
                  </div>
                </div>
              </div>

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="birthDateLunar">Ngày sinh (âm lịch)</Label>
                  <Input
                    id="birthDateLunar"
                    name="birthDateLunar"
                    value={formData.birthDateLunar}
                    onChange={handleChange}
                    placeholder="Ví dụ: 15 tháng Giêng năm Ất Sửu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Nơi sinh</Label>
                  <Input
                    id="birthPlace"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    placeholder="Nhập nơi sinh"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAlive"
                  checked={formData.isAlive}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isAlive">Còn sống</Label>
              </div>

              {!formData.isAlive && (
                <>
                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deathYear">Năm mất</Label>
                      <Input
                        id="deathYear"
                        name="deathYear"
                        value={formData.deathYear}
                        onChange={handleChange}
                        placeholder="Nhập năm mất"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deathDate">Ngày mất (dương lịch)</Label>
                      <div className="flex flex-col space-y-1">
                        <div className="flex gap-2">
                          <Input
                            id="deathDateInput"
                            name="deathDateInput"
                            type="text"
                            placeholder="dd-mm-yyyy"
                            value={formData.deathDateInput || ""}
                            onChange={(e) =>
                              handleDateInputChange(e, "deathDate")
                            }
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-auto" align="end">
                              <CalendarComponent
                                mode="single"
                                selected={formData.deathDate || undefined}
                                onSelect={(date) =>
                                  handleDateChange("deathDate", date)
                                }
                                initialFocus
                                locale={vi}
                                disabled={(date) =>
                                  date > currentDate ||
                                  (formData.birthDate
                                    ? date < formData.birthDate
                                    : false)
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Định dạng dd-mm-yyyy (ngày-tháng-năm)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deathDateLunar">Ngày mất (âm lịch)</Label>
                      <Input
                        id="deathDateLunar"
                        name="deathDateLunar"
                        value={formData.deathDateLunar}
                        onChange={handleChange}
                        placeholder="Ví dụ: 15 tháng Giêng năm Ất Sửu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deathPlace">Nơi mất</Label>
                      <Input
                        id="deathPlace"
                        name="deathPlace"
                        value={formData.deathPlace}
                        onChange={handleChange}
                        placeholder="Nhập nơi mất"
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="family" className="space-y-4 mt-4">
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="generation">
                    Đời (Thế hệ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="generation"
                    name="generation"
                    value={formData.generation}
                    onChange={handleChange}
                    placeholder="Ví dụ: 1, 2, 3, ..."
                    type="number"
                    required
                    readOnly={isFirstMember}
                  />
                  {isFirstMember && (
                    <p className="text-muted-foreground text-xs">
                      Thành viên đầu tiên mặc định là đời 1
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Vai trò trong gia đình{" "}
                    {hasSelectedRelationship && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder={
                        hasSelectedRelationship
                          ? "Nhập vai trò trong gia đình"
                          : "Chọn mối quan hệ trước"
                      }
                      required={hasSelectedRelationship}
                      disabled={!hasSelectedRelationship}
                    />
                    {hasSelectedRelationship && roleSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roleSuggestions.map((suggestion) => (
                          <Button
                            key={suggestion}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="py-0 h-6 text-xs"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                role: suggestion,
                              }))
                            }
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {!hasSelectedRelationship && (
                    <p className="text-muted-foreground text-xs">
                      Vui lòng chọn ít nhất một mối quan hệ trước
                    </p>
                  )}
                </div>
              </div>

              {!isFirstMember &&
                !hasParentsInPreviousGeneration &&
                formData.generation &&
                Number.parseInt(formData.generation) > 1 && (
                  <Alert className="mb-4">
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      {hasSpousesInCurrentGeneration ? (
                        <>
                          Không có thành viên ở đời{" "}
                          {Number.parseInt(formData.generation) - 1}. Bạn có thể
                          thêm thành viên bằng cách chọn vợ/chồng ở đời{" "}
                          {formData.generation}.
                        </>
                      ) : (
                        <>
                          Không có thành viên ở đời{" "}
                          {Number.parseInt(formData.generation) - 1} và không có
                          vợ/chồng ở đời {formData.generation}. Bạn cần thêm
                          thành viên ở đời{" "}
                          {Number.parseInt(formData.generation) - 1} trước.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

              <div className="space-y-2">
                <Label htmlFor="fatherId">
                  Cha{" "}
                  {!isFirstMember && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={formData.fatherId}
                  onValueChange={(value) =>
                    handleSelectChange("fatherId", value)
                  }
                  required={
                    !isFirstMember && !formData.motherId && !formData.spouseId
                  }
                  disabled={!isFirstMember && !hasParentsInPreviousGeneration}
                >
                  <SelectTrigger id="fatherId">
                    <SelectValue placeholder="Chọn cha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {availableParents
                      .filter((member) => member.gender === "MALE")
                      .map((member) => (
                        <SelectItem
                          key={member.id || member._id}
                          value={member.id || member._id}
                        >
                          {member.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!isFirstMember && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {hasParentsInPreviousGeneration
                      ? "Phải chọn ít nhất một trong ba: Cha, Mẹ hoặc Vợ/Chồng"
                      : "Không có thành viên nam ở đời trước"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherId">
                  Mẹ {!isFirstMember && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={formData.motherId}
                  onValueChange={(value) =>
                    handleSelectChange("motherId", value)
                  }
                  required={
                    !isFirstMember && !formData.fatherId && !formData.spouseId
                  }
                  disabled={!isFirstMember && !hasParentsInPreviousGeneration}
                >
                  <SelectTrigger id="motherId">
                    <SelectValue placeholder="Chọn mẹ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {availableParents
                      .filter((member) => member.gender === "FEMALE")
                      .map((member) => (
                        <SelectItem
                          key={member.id || member._id}
                          value={member.id || member._id}
                        >
                          {member.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!isFirstMember && !hasParentsInPreviousGeneration && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    Không có thành viên nữ ở đời trước
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouseId">
                  Vợ/Chồng{" "}
                  {!isFirstMember && !hasParentsInPreviousGeneration && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Select
                  value={formData.spouseId}
                  onValueChange={(value) =>
                    handleSelectChange("spouseId", value)
                  }
                  required={
                    !isFirstMember &&
                    !hasParentsInPreviousGeneration &&
                    !formData.fatherId &&
                    !formData.motherId
                  }
                >
                  <SelectTrigger id="spouseId">
                    <SelectValue placeholder="Chọn vợ/chồng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {availableSpouses.map((member) => (
                      <SelectItem
                        key={member.id || member._id}
                        value={member.id || member._id}
                      >
                        {member.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isFirstMember && !hasParentsInPreviousGeneration && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    Khi không có bố/mẹ ở đời trước, bạn phải chọn vợ/chồng ở đời
                    hiện tại
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Danh hiệu</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập danh hiệu (nếu có)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Nghề nghiệp</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Nhập nghề nghiệp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú khác</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Nhập ghi chú khác (đóng góp cho dòng họ, thông tin thêm,...)"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                uploadingImage ||
                (!isFirstMember && !canAddMember) ||
                (!isFirstMember &&
                  !hasParentsInPreviousGeneration &&
                  (formData.spouseId === "" || formData.spouseId === "none")) ||
                (hasSelectedRelationship && !formData.role)
              }
            >
              {loading || uploadingImage ? "Đang xử lý..." : "Lưu thành viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
