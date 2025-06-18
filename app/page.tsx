import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import FamilyTreePreview from "@/components/family-tree-preview";
import RecentFamilies from "@/components/recent-families";
import { FeaturedOrigins } from "@/components/featured-origins";
import { FadeInSection } from "@/components/fade-in-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-12 md:py-24 lg:py-32 w-full">
        <div className="px-4 md:px-6 container">
          <div className="items-center gap-6 lg:gap-12 grid lg:grid-cols-2">
            <FadeInSection delay={0.2}>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-bold text-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter">
                    Lưu Giữ Di Sản Gia Đình Việt Nam
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Xây dựng, lưu trữ và chia sẻ gia phả của bạn với công nghệ
                    hiện đại. Kết nối quá khứ với tương lai.
                  </p>
                </div>
                <div className="flex min-[400px]:flex-row flex-col gap-2">
                  <Link href="/register">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Bắt đầu miễn phí
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full min-[400px]:w-auto"
                    >
                      Khám phá gia phả
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3} direction="right">
              <div className="relative rounded-lg h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
                <Image
                  src="/placeholder.svg"
                  alt="Gia phả Việt Nam"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <FadeInSection delay={0.2}>
        <section className="bg-muted/50 py-12 w-full">
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl tracking-tighter">
                  Tìm kiếm gia phả
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Tìm kiếm theo họ, tên, địa điểm hoặc các thông tin khác
                </p>
              </div>
              <div className="flex items-center space-x-2 w-full max-w-md">
                <div className="relative w-full">
                  <Search className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Nhập tên, họ hoặc địa điểm..."
                    className="bg-background file:bg-transparent disabled:opacity-50 py-2 pr-12 pl-8 border border-input file:border-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full file:font-medium placeholder:text-muted-foreground text-sm file:text-sm disabled:cursor-not-allowed"
                  />
                </div>
                <Button type="submit">Tìm kiếm</Button>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32 w-full">
        <div className="px-4 md:px-6 container">
          <FadeInSection delay={0.2}>
            <div className="flex flex-col justify-center items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tighter">
                  Tính năng nổi bật
                </h2>
                <p className="max-w-[900px] text-muted-foreground lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
                  Khám phá các công cụ hiện đại để xây dựng và quản lý gia phả
                  của bạn
                </p>
              </div>
            </div>
          </FadeInSection>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto py-12 max-w-5xl">
            <FadeInSection delay={0.3}>
              <div className="flex flex-col items-center space-y-2 bg-background shadow-sm p-6 border rounded-lg h-full">
                <div className="bg-primary/10 p-2 rounded-full">
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
                    className="w-6 h-6 text-primary"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl">Quản lý thành viên</h3>
                <p className="text-muted-foreground text-center">
                  Thêm, sửa và quản lý thông tin chi tiết của từng thành viên
                  trong gia đình
                </p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.4}>
              <div className="flex flex-col items-center space-y-2 bg-background shadow-sm p-6 border rounded-lg h-full">
                <div className="bg-primary/10 p-2 rounded-full">
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
                    className="w-6 h-6 text-primary"
                  >
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl">Lưu trữ tài liệu</h3>
                <p className="text-muted-foreground text-center">
                  Lưu trữ hình ảnh, tài liệu lịch sử và các di vật gia đình quan
                  trọng
                </p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.5}>
              <div className="flex flex-col items-center space-y-2 bg-background shadow-sm p-6 border rounded-lg h-full">
                <div className="bg-primary/10 p-2 rounded-full">
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
                    className="w-6 h-6 text-primary"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl">Chia sẻ và cộng tác</h3>
                <p className="text-muted-foreground text-center">
                  Mời thành viên gia đình cùng xây dựng và cập nhật gia phả
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Family Tree Preview */}
      <FadeInSection delay={0.2}>
        <section className="bg-muted/30 py-12 md:py-24 lg:py-32 w-full">
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tighter">
                  Xem trước gia phả
                </h2>
                <p className="max-w-[900px] text-muted-foreground lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
                  Trực quan hóa gia phả của bạn với nhiều kiểu hiển thị khác
                  nhau
                </p>
              </div>
              <div className="shadow-lg mx-auto mt-8 border rounded-lg w-full max-w-4xl overflow-hidden">
                <FamilyTreePreview />
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Recent Families */}
      <FadeInSection delay={0.2}>
        <section className="py-12 md:py-24 w-full">
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-3xl sm:text-4xl tracking-tighter">
                  Gia phả gần đây
                </h2>
                <p className="max-w-[900px] text-muted-foreground lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
                  Khám phá các gia phả mới được tạo và cập nhật gần đây
                </p>
              </div>
              <RecentFamilies />
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Featured Origins */}
      <FadeInSection delay={0.2}>
        <section className="bg-muted/30 py-12 md:py-24 w-full">
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-3xl sm:text-4xl tracking-tighter">
                  Xuất đinh nổi bật
                </h2>
                <p className="max-w-[900px] text-muted-foreground lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
                  Khám phá các xuất đinh nổi tiếng và lịch sử văn hóa Việt Nam
                </p>
              </div>
              <FeaturedOrigins />
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* CTA Section */}

      <section className="bg-primary py-12 md:py-24 lg:py-32 w-full text-primary-foreground">
        <FadeInSection delay={0.2}>
          <div className="px-4 md:px-6 container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tighter">
                  Bắt đầu xây dựng gia phả của bạn ngay hôm nay
                </h2>
                <p className="lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
                  Đăng ký miễn phí và bắt đầu lưu giữ lịch sử gia đình của bạn
                  cho các thế hệ tương lai
                </p>
              </div>
              <div className="flex min-[400px]:flex-row flex-col gap-2">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full min-[400px]:w-auto"
                  >
                    Đăng ký ngay
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full min-[400px]:w-auto"
                  >
                    Tìm hiểu thêm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
