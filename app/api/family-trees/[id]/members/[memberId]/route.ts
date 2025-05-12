import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Member from "@/models/Member"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

// Lấy thông tin chi tiết của thành viên
export async function GET(req: NextRequest, { params }: { params: { id: string; memberId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id
    const memberId = params.memberId

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

    // Lấy thông tin thành viên
    const member = await Member.findOne({
      _id: new mongoose.Types.ObjectId(memberId),
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: member._id.toString(),
      fullName: member.fullName,
      gender: member.gender,
      birthYear: member.birthYear,
      birthDate: member.birthDate,
      birthDateLunar: member.birthDateLunar,
      birthPlace: member.birthPlace,
      deathDate: member.deathDate,
      deathDateLunar: member.deathDateLunar,
      deathPlace: member.deathPlace,
      biography: member.biography,
      image: member.image,
      isAlive: member.isAlive,
      parentId: member.parentId?.toString(),
      fatherId: member.fatherId?.toString(),
      motherId: member.motherId?.toString(),
      spouseId: member.spouseId?.toString(),
      occupation: member.occupation,
      generation: member.generation || 1,
      role: member.role,
      notes: member.notes,
      hometown: member.hometown,
      ethnicity: member.ethnicity,
      nationality: member.nationality,
      religion: member.religion,
      title: member.title,
      childrenIds: member.childrenIds?.map((id) => id.toString()),
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Cập nhật thông tin thành viên
export async function PUT(req: NextRequest, { params }: { params: { id: string; memberId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id
    const memberId = params.memberId

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
      return NextResponse.json({ error: "Họ tên là bắt buộc" }, { status: 400 })
    }

    if (!data.gender) {
      return NextResponse.json({ error: "Giới tính là bắt buộc" }, { status: 400 })
    }

    if (!data.hometown) {
      return NextResponse.json({ error: "Nguyên quán là bắt buộc" }, { status: 400 })
    }

    if (!data.ethnicity) {
      return NextResponse.json({ error: "Dân tộc là bắt buộc" }, { status: 400 })
    }

    if (!data.nationality) {
      return NextResponse.json({ error: "Quốc tịch là bắt buộc" }, { status: 400 })
    }

    // Validate birth year
    if (data.birthYear) {
      const birthYear = Number.parseInt(data.birthYear)
      if (birthYear > 2200) {
        return NextResponse.json({ error: "Năm sinh không được vượt quá năm 2200" }, { status: 400 })
      }
    }

    // Validate death year
    if (!data.isAlive && data.deathYear) {
      const deathYear = Number.parseInt(data.deathYear)
      const currentYear = new Date().getFullYear()
      if (deathYear > currentYear) {
        return NextResponse.json({ error: "Năm mất không được vượt quá năm hiện tại" }, { status: 400 })
      }
    }

    // Validate father-child age difference
    if (data.fatherId && data.fatherId !== "none" && data.birthYear) {
      const father = await Member.findById(data.fatherId)
      if (father && father.birthYear) {
        const fatherBirthYear = Number.parseInt(father.birthYear)
        const childBirthYear = Number.parseInt(data.birthYear)
        if (childBirthYear - fatherBirthYear < 16) {
          return NextResponse.json({ error: "Tuổi con phải cách tuổi bố ít nhất 16 năm" }, { status: 400 })
        }
      }
    }

    // Cập nhật thông tin thành viên
    const member = await Member.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(memberId),
        familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
      },
      {
        fullName: data.fullName,
        gender: data.gender,
        birthYear: data.birthYear,
        birthDate: data.birthDate,
        birthDateLunar: data.birthDateLunar,
        deathYear: data.deathYear,
        deathDate: data.deathDate,
        deathDateLunar: data.deathDateLunar,
        role: data.role,
        generation: data.generation,
        occupation: data.occupation,
        birthPlace: data.birthPlace,
        deathPlace: data.deathPlace,
        notes: data.notes,
        isAlive: data.isAlive,
        hometown: data.hometown,
        ethnicity: data.ethnicity,
        nationality: data.nationality,
        religion: data.religion,
        title: data.title,
        fatherId: data.fatherId && data.fatherId !== "none" ? new mongoose.Types.ObjectId(data.fatherId) : undefined,
        motherId: data.motherId && data.motherId !== "none" ? new mongoose.Types.ObjectId(data.motherId) : undefined,
        spouseId: data.spouseId && data.spouseId !== "none" ? new mongoose.Types.ObjectId(data.spouseId) : undefined,
        updatedById: new mongoose.Types.ObjectId(session.user.id),
      },
      { new: true },
    )

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

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({
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
      fatherId: member.fatherId?.toString(),
      motherId: member.motherId?.toString(),
      spouseId: member.spouseId?.toString(),
      occupation: member.occupation,
      generation: member.generation || 1,
      role: member.role,
      notes: member.notes,
      hometown: member.hometown,
      ethnicity: member.ethnicity,
      nationality: member.nationality,
      religion: member.religion,
      title: member.title,
      childrenIds: member.childrenIds?.map((id) => id.toString()),
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    })
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Xóa thành viên
export async function DELETE(req: NextRequest, { params }: { params: { id: string; memberId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id
    const memberId = params.memberId

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

    // Xóa thành viên
    const result = await Member.deleteOne({
      _id: new mongoose.Types.ObjectId(memberId),
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
