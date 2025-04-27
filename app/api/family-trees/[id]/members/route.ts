import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Member from "@/models/Member"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

// Lấy danh sách thành viên của gia phả
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

    // Lấy danh sách thành viên
    const members = await Member.find({
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    }).sort({ fullName: 1 })

    return NextResponse.json(
      members.map((member) => ({
        id: member._id.toString(),
        fullName: member.fullName,
        gender: member.gender,
        birthYear: member.birthYear,
        birthDate: member.birthDate,
        birthPlace: member.birthPlace,
        deathDate: member.deathDate,
        deathPlace: member.deathPlace,
        biography: member.biography,
        image: member.image,
        isAlive: member.isAlive,
        parentId: member.parentId?.toString(),
        fatherId: member.fatherId?.toString(),
        motherId: member.motherId?.toString(),
        spouseId: member.spouseId?.toString(),
        generation: member.generation || 1,
        childrenIds: member.childrenIds?.map((id) => id.toString()),
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      })),
    )
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Tạo thành viên mới
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
      role: { $in: ["OWNER", "EDITOR"] },
    })

    const isCreator = await FamilyTree.findOne({
      _id: new mongoose.Types.ObjectId(familyTreeId),
      creatorId: new mongoose.Types.ObjectId(session.user.id),
    })

    if (!membership && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.fullName) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 })
    }

    // Xử lý parentId và spouseId
    let parentId = undefined
    if (data.parentId && data.parentId !== "none") {
      parentId = new mongoose.Types.ObjectId(data.parentId)
    }

    let spouseId = undefined
    if (data.spouseId && data.spouseId !== "none") {
      spouseId = new mongoose.Types.ObjectId(data.spouseId)
    }

    // Create new member
    const member = new Member({
      fullName: data.fullName,
      gender: data.gender,
      birthYear: data.birthYear,
      birthDate: data.birthDate,
      deathYear: data.deathYear,
      deathDate: data.deathDate,
      role: data.role,
      generation: data.generation,
      occupation: data.occupation,
      birthPlace: data.birthPlace,
      deathPlace: data.deathPlace,
      notes: data.notes,
      isAlive: data.isAlive,
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
      fatherId: data.fatherId && data.fatherId !== "none" ? new mongoose.Types.ObjectId(data.fatherId) : undefined,
      motherId: data.motherId && data.motherId !== "none" ? new mongoose.Types.ObjectId(data.motherId) : undefined,
      spouseId: data.spouseId && data.spouseId !== "none" ? new mongoose.Types.ObjectId(data.spouseId) : undefined,
      childrenIds: [],
      createdById: new mongoose.Types.ObjectId(session.user.id),
      updatedById: new mongoose.Types.ObjectId(session.user.id),
    })

    await member.save()

    // Cập nhật mối quan hệ
    if (data.fatherId && data.fatherId !== "none") {
      await Member.findByIdAndUpdate(data.fatherId, { $addToSet: { childrenIds: member._id } })
    }

    if (data.motherId && data.motherId !== "none") {
      await Member.findByIdAndUpdate(data.motherId, { $addToSet: { childrenIds: member._id } })
    }

    if (data.spouseId && data.spouseId !== "none") {
      await Member.findByIdAndUpdate(data.spouseId, { spouseId: member._id })
    }

    return NextResponse.json(
      {
        id: member._id.toString(),
        fullName: member.fullName,
        gender: member.gender,
        birthDate: member.birthDate,
        birthPlace: member.birthPlace,
        deathDate: member.deathDate,
        deathPlace: member.deathPlace,
        biography: member.biography,
        image: member.image,
        isAlive: member.isAlive,
        parentId: member.parentId?.toString(),
        spouseId: member.spouseId?.toString(),
        childrenIds: member.childrenIds?.map((id) => id.toString()),
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

