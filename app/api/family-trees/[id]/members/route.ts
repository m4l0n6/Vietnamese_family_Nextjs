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
        generation: member.generation || 1,
        childrenIds: member.childrenIds?.map((id) => id.toString()),
        hometown: member.hometown,
        ethnicity: member.ethnicity,
        nationality: member.nationality,
        religion: member.religion,
        title: member.title,
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

    if (!data.role) {
      return NextResponse.json({ error: "Vai trò trong gia đình là bắt buộc" }, { status: 400 })
    }

    // Kiểm tra xem có phải là thành viên đầu tiên không
    const membersCount = await Member.countDocuments({
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    })

    const isFirstMember = membersCount === 0

    // Nếu không phải thành viên đầu tiên, kiểm tra quan hệ gia đình
    if (!isFirstMember && !data.fatherId && !data.motherId) {
      return NextResponse.json({ error: "Phải chọn ít nhất một trong hai: Cha hoặc Mẹ" }, { status: 400 })
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
    if (data.fatherId && data.birthYear) {
      const father = await Member.findById(data.fatherId)
      if (father && father.birthYear) {
        const fatherBirthYear = Number.parseInt(father.birthYear)
        const childBirthYear = Number.parseInt(data.birthYear)
        if (childBirthYear - fatherBirthYear < 16) {
          return NextResponse.json({ error: "Tuổi con phải cách tuổi bố ít nhất 16 năm" }, { status: 400 })
        }
      }
    }

    // Determine generation
    let generation = 1
    if (data.generation) {
      generation = Number.parseInt(data.generation)
    } else if (data.fatherId) {
      const father = await Member.findById(data.fatherId)
      if (father && father.generation) {
        generation = father.generation + 1
      }
    } else if (data.motherId) {
      const mother = await Member.findById(data.motherId)
      if (mother && mother.generation) {
        // Thường thì thế hệ của mẹ giống với thế hệ của cha
        generation = mother.generation
      }
    } else {
      // Nếu là thành viên đầu tiên hoặc không có thông tin về cha mẹ
      if (isFirstMember) {
        generation = 1
      }
    }

    // Create new member
    const member = new Member({
      fullName: data.fullName,
      gender: data.gender,
      birthYear: data.birthYear,
      birthDate: data.birthDate,
      birthDateLunar: data.birthDateLunar,
      deathYear: data.deathYear,
      deathDate: data.deathDate,
      deathDateLunar: data.deathDateLunar,
      role: data.role,
      generation: generation,
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
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
      fatherId: data.fatherId ? new mongoose.Types.ObjectId(data.fatherId) : undefined,
      motherId: data.motherId ? new mongoose.Types.ObjectId(data.motherId) : undefined,
      spouseId: data.spouseId ? new mongoose.Types.ObjectId(data.spouseId) : undefined,
      childrenIds: [],
      createdById: new mongoose.Types.ObjectId(session.user.id),
      updatedById: new mongoose.Types.ObjectId(session.user.id),
    })

    await member.save()

    // Cập nhật mối quan hệ
    if (data.fatherId) {
      await Member.findByIdAndUpdate(data.fatherId, { $addToSet: { childrenIds: member._id } })
    }

    if (data.motherId) {
      await Member.findByIdAndUpdate(data.motherId, { $addToSet: { childrenIds: member._id } })
    }

    if (data.spouseId) {
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
