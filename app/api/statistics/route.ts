import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Member from "@/models/Member"
import Event from "@/models/Event"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Lấy danh sách gia phả của người dùng
    const memberships = await Membership.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
    })

    const familyTreeIds = memberships.map((membership) => membership.familyTreeId)

    // Lấy tổng số thành viên trong các gia phả của người dùng
    const totalMembers = await Member.countDocuments({
      familyTreeId: { $in: familyTreeIds },
    })

    // Lấy số thành viên còn sống trong các gia phả của người dùng
    const livingMembers = await Member.countDocuments({
      familyTreeId: { $in: familyTreeIds },
      isAlive: true,
    })

    // Lấy số thành viên đã mất trong các gia phả của người dùng
    const deceasedMembers = await Member.countDocuments({
      familyTreeId: { $in: familyTreeIds },
      isAlive: false,
    })

    // Lấy tổng số sự kiện trong các gia phả của người dùng
    const totalEvents = await Event.countDocuments({
      familyTreeId: { $in: familyTreeIds },
    })

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
