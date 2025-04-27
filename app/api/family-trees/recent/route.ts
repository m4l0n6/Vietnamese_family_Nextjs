import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Member from "@/models/Member"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Lấy các gia phả công khai mới nhất
    const recentFamilies = await FamilyTree.find({ isPublic: true }).sort({ updatedAt: -1 }).limit(6).lean()

    // Lấy số lượng thành viên cho mỗi gia phả
    const familiesWithMemberCount = await Promise.all(
      recentFamilies.map(async (family) => {
        const membersCount = await Member.countDocuments({
          familyTreeId: family._id,
        })

        return {
          id: family._id.toString(),
          name: family.name,
          origin: family.origin || "Chưa cập nhật",
          members: membersCount,
          lastUpdated: new Date(family.updatedAt).toLocaleDateString("vi-VN"),
          image: "/placeholder.svg?height=200&width=300",
        }
      }),
    )

    return NextResponse.json(familiesWithMemberCount)
  } catch (error) {
    console.error("Error fetching recent families:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

