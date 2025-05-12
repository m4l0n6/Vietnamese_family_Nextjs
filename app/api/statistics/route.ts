import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Member from "@/models/Member"
import Event from "@/models/Event"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Lấy tổng số thành viên
    const totalMembers = await Member.countDocuments({})

    // Lấy số thành viên còn sống
    const livingMembers = await Member.countDocuments({ isAlive: true })

    // Lấy số thành viên đã mất
    const deceasedMembers = await Member.countDocuments({ isAlive: false })

    // Lấy tổng số sự kiện
    const totalEvents = await Event.countDocuments({})

    return NextResponse.json({
      totalMembers,
      livingMembers,
      deceasedMembers,
      totalEvents,
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
