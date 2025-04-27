import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Member from "@/models/Member"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Lấy tất cả thành viên trong gia phả
    const members = await Member.find({
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    }).lean()

    // Tạo map để tra cứu nhanh
    const memberMap = new Map()
    members.forEach((member) => {
      memberMap.set(member._id.toString(), member)
    })

    // Tìm thành viên gốc (không có parentId)
    const rootMembers = members.filter((member) => !member.parentId && !member.fatherId && !member.motherId)

    // Nếu không có thành viên gốc, trả về tất cả thành viên
    if (rootMembers.length === 0 && members.length > 0) {
      // Chuyển đổi dữ liệu để phù hợp với client
      const formattedMembers = members.map((member) => ({
        id: member._id.toString(),
        fullName: member.fullName,
        generation: member.generation || 1,
        birthYear: member.birthYear,
        birthDate: member.birthDate,
        deathDate: member.deathDate,
        isAlive: member.isAlive,
        gender: member.gender,
        image: member.image,
        occupation: member.occupation,
        parentId: member.parentId ? member.parentId.toString() : undefined,
        fatherId: member.fatherId ? member.fatherId.toString() : undefined,
        motherId: member.motherId ? member.motherId.toString() : undefined,
        spouseId: member.spouseId ? member.spouseId.toString() : undefined,
        spouseName: member.spouseId ? memberMap.get(member.spouseId.toString())?.fullName : undefined,
      }))

      return NextResponse.json(formattedMembers)
    }

    // Đảm bảo tất cả thành viên có giá trị generation
    const assignGenerations = () => {
      // Bắt đầu với thành viên gốc (đời 1)
      const queue = [...rootMembers.map((m) => ({ member: m, generation: 1 }))]
      const processed = new Set()

      while (queue.length > 0) {
        const { member, generation } = queue.shift()!
        const memberId = member._id.toString()

        if (processed.has(memberId)) continue
        processed.add(memberId)

        // Cập nhật generation cho thành viên này
        member.generation = generation

        // Tìm tất cả con của thành viên này
        const children = members.filter(
          (m) =>
            (m.parentId && m.parentId.toString() === memberId) ||
            (m.fatherId && m.fatherId.toString() === memberId) ||
            (m.motherId && m.motherId.toString() === memberId),
        )

        // Thêm con vào hàng đợi với generation tăng 1
        children.forEach((child) => {
          queue.push({ member: child, generation: generation + 1 })
        })

        // Nếu có vợ/chồng, đảm bảo họ cùng đời
        if (member.spouseId) {
          const spouse = memberMap.get(member.spouseId.toString())
          if (spouse && !processed.has(spouse._id.toString())) {
            queue.push({ member: spouse, generation: generation })
          }
        }
      }

      // Xử lý các thành viên chưa được gán generation
      members.forEach((member) => {
        if (!member.generation) {
          member.generation = 1 // Mặc định là đời 1 nếu không xác định được
        }
      })
    }

    // Gán generation cho tất cả thành viên
    assignGenerations()

    // Chuyển đổi dữ liệu để phù hợp với client
    const formattedMembers = members.map((member) => ({
      id: member._id.toString(),
      fullName: member.fullName,
      generation: member.generation,
      birthYear: member.birthYear,
      birthDate: member.birthDate,
      deathDate: member.deathDate,
      isAlive: member.isAlive,
      gender: member.gender,
      image: member.image,
      occupation: member.occupation,
      parentId: member.parentId ? member.parentId.toString() : undefined,
      fatherId: member.fatherId ? member.fatherId.toString() : undefined,
      motherId: member.motherId ? member.motherId.toString() : undefined,
      spouseId: member.spouseId ? member.spouseId.toString() : undefined,
      spouseName: member.spouseId ? memberMap.get(member.spouseId.toString())?.fullName : undefined,
    }))

    return NextResponse.json(formattedMembers)
  } catch (error) {
    console.error("Error fetching family tree hierarchy:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

