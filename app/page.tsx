import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Image from "next/image"
import FamilyTreePreview from "@/components/family-tree-preview"
import RecentFamilies from "@/components/recent-families"
import { FeaturedOrigins } from "@/components/featured-origins"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-primary">
                  Lưu Giữ Di Sản Gia Đình Việt Nam
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Xây dựng, lưu trữ và chia sẻ gia phả của bạn với công nghệ hiện đại. Kết nối quá khứ với tương lai.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    Bắt đầu miễn phí
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                    Khám phá gia phả
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-K6Roif02ZRBYFQjRYosObJ8UTSFo91.png"
                alt="Gia phả Việt Nam"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="w-full py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Tìm kiếm gia phả</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Tìm kiếm theo họ, tên, địa điểm hoặc các thông tin khác
              </p>
            </div>
            <div className="w-full max-w-md flex items-center space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Nhập tên, họ hoặc địa điểm..."
                  className="w-full bg-background rounded-md border border-input pl-8 pr-12 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Button type="submit">Tìm kiếm</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tính năng nổi bật</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Khám phá các công cụ hiện đại để xây dựng và quản lý gia phả của bạn
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Quản lý thành viên</h3>
              <p className="text-muted-foreground text-center">
                Thêm, sửa và quản lý thông tin chi tiết của từng thành viên trong gia đình
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Lưu trữ tài liệu</h3>
              <p className="text-muted-foreground text-center">
                Lưu trữ hình ảnh, tài liệu lịch sử và các di vật gia đình quan trọng
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Chia sẻ và cộng tác</h3>
              <p className="text-muted-foreground text-center">
                Mời thành viên gia đình cùng xây dựng và cập nhật gia phả
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Family Tree Preview */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Xem trước gia phả</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Trực quan hóa gia phả của bạn với nhiều kiểu hiển thị khác nhau
              </p>
            </div>
            <div className="w-full max-w-4xl mx-auto mt-8 border rounded-lg overflow-hidden shadow-lg">
              <FamilyTreePreview />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Families */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Gia phả gần đây</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Khám phá các gia phả mới được tạo và cập nhật gần đây
              </p>
            </div>
            <RecentFamilies />
          </div>
        </div>
      </section>

      {/* Featured Origins */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Xuất đinh nổi bật</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Khám phá các nguồn gốc gia đình nổi tiếng trong lịch sử Việt Nam
              </p>
            </div>
            <FeaturedOrigins />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Bắt đầu xây dựng gia phả của bạn ngay hôm nay
              </h2>
              <p className="md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Đăng ký miễn phí và bắt đầu lưu giữ lịch sử gia đình của bạn cho các thế hệ tương lai
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">
                  Đăng ký ngay
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

