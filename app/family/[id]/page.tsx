import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Download, Edit, MapPin, Share2, Users } from "lucide-react"
import Image from "next/image"

export default function FamilyPage({ params }: { params: { id: string } }) {
  // Dữ liệu gia phả dựa trên ID
  const familyData = {
    "1": {
      id: "1",
      name: "Gia phả họ Nguyễn",
      origin: "Hà Nam",
      foundingYear: 1750,
      members: 156,
      lastUpdated: "15/03/2025",
      description:
        "Dòng họ Nguyễn có nguồn gốc từ làng Gia Miêu, tỉnh Hà Nam. Tổ tiên đầu tiên là cụ Nguyễn Văn A, sinh năm 1750. Dòng họ đã trải qua nhiều thế hệ với nhiều thành tựu trong lĩnh vực nông nghiệp, giáo dục và y học.",
      image: "/placeholder.svg?height=400&width=800",
    },
    "2": {
      id: "2",
      name: "Gia phả họ Trần",
      origin: "Nam Định",
      foundingYear: 1680,
      members: 98,
      lastUpdated: "12/03/2025",
      description:
        "Dòng họ Trần có nguồn gốc từ Nam Định, nơi phát tích của nhiều danh nhân lịch sử. Tổ tiên đầu tiên là cụ Trần Văn Minh, sinh năm 1680. Dòng họ Trần nổi tiếng với truyền thống hiếu học và có nhiều đóng góp trong lĩnh vực văn hóa, giáo dục.",
      image: "/placeholder.svg?height=400&width=800",
    },
    "3": {
      id: "3",
      name: "Gia phả họ Lê",
      origin: "Thanh Hóa",
      foundingYear: 1720,
      members: 124,
      lastUpdated: "10/03/2025",
      description:
        "Dòng họ Lê bắt nguồn từ Thanh Hóa, vùng đất địa linh nhân kiệt. Tổ tiên đầu tiên là cụ Lê Văn Thành, sinh năm 1720. Dòng họ Lê có truyền thống về nghề thủ công mỹ nghệ và nhiều thành viên đã trở thành những nghệ nhân nổi tiếng.",
      image: "/placeholder.svg?height=400&width=800",
    },
  }

  const family = familyData[params.id as keyof typeof familyData] || familyData["1"]

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{family.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Xuất đinh: {family.origin}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                <span>Thành lập: {family.foundingYear}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{family.members} thành viên</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              <span>Xuất PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span>Chia sẻ</span>
            </Button>
            <Button size="sm" className="gap-1">
              <Edit className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </Button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative h-[200px] md:h-[300px] w-full rounded-lg overflow-hidden">
          <Image src={family.image || "/placeholder.svg"} alt={family.name} fill className="object-cover" />
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Công khai</Badge>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Giới thiệu</CardTitle>
            <CardDescription>Thông tin chung về dòng họ</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{family.description}</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="members">Thành viên</TabsTrigger>
            <TabsTrigger value="documents">Tài liệu</TabsTrigger>
            <TabsTrigger value="events">Sự kiện</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan gia phả</CardTitle>
                <CardDescription>Thông tin cơ bản và các tính năng chính</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-6 bg-muted/20">
                    <h3 className="text-lg font-medium mb-4">Cây gia phả</h3>
                    <p className="text-muted-foreground mb-4">
                      Xem cấu trúc gia phả theo nhiều định dạng khác nhau, với đầy đủ thông tin về mối quan hệ giữa các
                      thành viên.
                    </p>
                    <Link href={`/family/${family.id}/tree`}>
                      <Button>Xem cây gia phả</Button>
                    </Link>
                  </div>
                  <div className="border rounded-lg p-6 bg-muted/20">
                    <h3 className="text-lg font-medium mb-4">Thống kê thành viên</h3>
                    <p className="text-muted-foreground mb-4">
                      Xem thống kê chi tiết về thành viên trong gia phả, phân loại theo thế hệ, giới tính và các tiêu
                      chí khác.
                    </p>
                    <Link href={`/family/${family.id}/statistics`}>
                      <Button>Xem thống kê</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách thành viên</CardTitle>
                <CardDescription>Tất cả thành viên trong gia phả</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((member) => (
                    <Link href={`/family/${family.id}/member/${member}`} key={member}>
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                          <Image
                            src={`/placeholder.svg?height=50&width=50`}
                            alt={`Thành viên ${member}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">
                            {family.id === "1" && `Nguyễn Văn ${String.fromCharCode(64 + member)}`}
                            {family.id === "2" && `Trần Văn ${String.fromCharCode(64 + member)}`}
                            {family.id === "3" && `Lê Văn ${String.fromCharCode(64 + member)}`}
                          </div>
                          <div className="text-sm text-muted-foreground">1950 - 2020</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">Xem tất cả thành viên</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tài liệu gia đình</CardTitle>
                <CardDescription>Hình ảnh, tài liệu và di vật gia đình</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((doc) => (
                    <div key={doc} className="border rounded-lg overflow-hidden">
                      <div className="relative h-40 w-full">
                        <Image
                          src={`/placeholder.svg?height=200&width=300`}
                          alt={`Tài liệu ${doc}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <div className="font-medium">
                          {family.id === "1" && `Tài liệu họ Nguyễn #${doc}`}
                          {family.id === "2" && `Tài liệu họ Trần #${doc}`}
                          {family.id === "3" && `Tài liệu họ Lê #${doc}`}
                        </div>
                        <div className="text-sm text-muted-foreground">Thêm vào: 10/03/2025</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">Xem tất cả tài liệu</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sự kiện gia đình</CardTitle>
                <CardDescription>Các sự kiện quan trọng trong lịch sử dòng họ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((event) => (
                    <div key={event} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full">
                        <CalendarDays className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {family.id === "1" && `Sự kiện họ Nguyễn #${event}`}
                          {family.id === "2" && `Sự kiện họ Trần #${event}`}
                          {family.id === "3" && `Sự kiện họ Lê #${event}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">Ngày: {1900 + event * 50}</p>
                        <p className="text-sm">
                          {family.id === "1" && "Mô tả sự kiện quan trọng trong lịch sử dòng họ Nguyễn."}
                          {family.id === "2" && "Mô tả sự kiện quan trọng trong lịch sử dòng họ Trần."}
                          {family.id === "3" && "Mô tả sự kiện quan trọng trong lịch sử dòng họ Lê."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">Xem tất cả sự kiện</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
