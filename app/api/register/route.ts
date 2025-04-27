import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    await connectDB()

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 })
    }

    // Tạo người dùng mới
    const user = new User({
      name,
      email,
      password,
    })

    await user.save()

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 })
  }
}

