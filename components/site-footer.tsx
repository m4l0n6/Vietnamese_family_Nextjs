import Link from "next/link"
import { BookOpen } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col gap-8 py-8 md:py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-1/3">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold">Gia Phả Việt Nam</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Xây dựng, lưu trữ và chia sẻ gia phả của bạn với công nghệ hiện đại. Kết nối quá khứ với tương lai.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Khám phá</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/explore" className="text-muted-foreground hover:text-foreground">
                    Gia phả nổi bật
                  </Link>
                </li>
                <li>
                  <Link href="/explore/recent" className="text-muted-foreground hover:text-foreground">
                    Mới cập nhật
                  </Link>
                </li>
                <li>
                  <Link href="/explore/origins" className="text-muted-foreground hover:text-foreground">
                    Xuất đinh
                  </Link>
                </li>
                <li>
                  <Link href="/explore/map" className="text-muted-foreground hover:text-foreground">
                    Bản đồ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Hướng dẫn</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guides/getting-started" className="text-muted-foreground hover:text-foreground">
                    Bắt đầu
                  </Link>
                </li>
                <li>
                  <Link href="/guides/adding-members" className="text-muted-foreground hover:text-foreground">
                    Thêm thành viên
                  </Link>
                </li>
                <li>
                  <Link href="/guides/documents" className="text-muted-foreground hover:text-foreground">
                    Tài liệu
                  </Link>
                </li>
                <li>
                  <Link href="/guides/sharing" className="text-muted-foreground hover:text-foreground">
                    Chia sẻ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Tài nguyên</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-muted-foreground hover:text-foreground">
                    Tài liệu tham khảo
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                    Câu hỏi thường gặp
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Pháp lý</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Điều khoản sử dụng
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t pt-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Gia Phả Việt Nam. Đã đăng ký bản quyền.
          </p>
          <p className="text-xs text-muted-foreground">Được thiết kế và phát triển tại Việt Nam</p>
        </div>
      </div>
    </footer>
  )
}
