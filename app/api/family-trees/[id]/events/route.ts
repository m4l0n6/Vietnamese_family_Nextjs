import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

// Giả lập dữ liệu sự kiện - trong thực tế sẽ cần tạo model Event
const mockEvents = [
  {
    id: "1",
    title: "Ngày giỗ tổ",
    description: "Lễ giỗ tổ hàng năm của dòng họ",
    date: "2023-10-15",
    location: "Đền thờ họ Nguyễn, Hà Nội",
    type: "family",
    familyTreeId: "family1",
  },
  {
    id: "2",
    title: "Sinh nhật",
    description: "Sinh nhật của Nguyễn Văn A",
    date: "1980-05-20",
    type: "personal",
    memberId: "member1",
    memberName: "Nguyễn Văn A",
    familyTreeId: "family1",
  },
  {
    id: "3",
    title: "Ngày mất",
    description: "Ngày mất của cụ Nguyễn Văn B",
    date: "2010-08-12",
    location: "Hà Nội",
    type: "personal",
    memberId: "member2",
    memberName: "Nguyễn Văn B",
    familyTreeId: "family1",
  },
  {
    id: "4",
    title: "Ngày cưới",
    description: "Lễ cưới của Nguyễn Văn C và Trần Thị D",
    date: "2005-11-30",
    location: "Hà Nội",
    type: "family",
    familyTreeId: "family1",
  },
]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id

    // Kiểm tra quyền truy cập
    const membership = await Membership.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    })

    const isCreator = await FamilyTree.findOne({
      _id: new mongoose.Types.ObjectId(familyTreeId),
      creatorId: new mongoose.Types.ObjectId(session.user.id),
    })

    if (!membership && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Trong thực tế, bạn sẽ truy vấn từ database
    // const events = await Event.find({ familyTreeId: new mongoose.Types.ObjectId(familyTreeId) })

    // Giả lập dữ liệu
    const events = mockEvents.filter((event) => event.familyTreeId === "family1")

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id

    // Kiểm tra quyền truy cập
    const membership = await Membership.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    })

    const isCreator = await FamilyTree.findOne({
      _id: new mongoose.Types.ObjectId(familyTreeId),
      creatorId: new mongoose.Types.ObjectId(session.user.id),
    })

    if (!membership && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await req.json()

    // Trong thực tế, bạn sẽ lưu vào database
    // const event = new Event({
    //   ...data,
    //   familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    //   createdBy: new mongoose.Types.ObjectId(session.user.id),
    // })
    // await event.save()

    // Giả lập tạo sự kiện mới
    const newEvent = {
      id: Date.now().toString(),
      ...data,
      familyTreeId,
    }

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

