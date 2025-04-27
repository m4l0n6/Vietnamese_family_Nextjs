import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Kiểm tra nếu đang ở trang dashboard
  if (path.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!token) {
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", encodeURI(path))
      return NextResponse.redirect(url)
    }
  }

  // Kiểm tra nếu đã đăng nhập và đang truy cập trang chủ
  if (path === "/") {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // Nếu đã đăng nhập, chuyển hướng đến dashboard
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

