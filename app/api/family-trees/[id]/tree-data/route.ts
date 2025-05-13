import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Member from "@/models/Member"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

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

    // Lấy tất cả thành viên trong gia phả
    const members = await Member.find({
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    }).lean()

    if (members.length === 0) {
      return NextResponse.json({ error: "No members found" }, { status: 404 })
    }

    // Tạo map để tra cứu nhanh
    const memberMap = new Map()
    members.forEach((member) => {
      memberMap.set(member._id.toString(), member)
    })

    // Tìm thành viên gốc (không có parentId)
    const rootMembers = members.filter((member) => !member.parentId && !member.fatherId && !member.motherId)

    if (rootMembers.length === 0) {
      // Nếu không tìm thấy thành viên gốc, lấy thành viên đầu tiên làm gốc
      const firstMember = members[0]

      // Tạo cấu trúc cây đơn giản với thành viên đầu tiên
      const simpleTree = {
        name: firstMember.fullName,
        attributes: {
          birthYear:
            firstMember.birthYear || (firstMember.birthDate ? new Date(firstMember.birthDate).getFullYear() : null),
          deathYear: firstMember.deathDate ? new Date(firstMember.deathDate).getFullYear() : null,
          gender: firstMember.gender === "MALE" ? "male" : firstMember.gender === "FEMALE" ? "female" : "other",
          occupation: firstMember.occupation || null,
          generation: firstMember.generation || 1,
          image: firstMember.image || null,
        },
        children: [],
      }

      return NextResponse.json(simpleTree)
    }

    // Chỉnh sửa hàm buildTree để tạo cấu trúc cây phù hợp
    const buildTree = (member: any) => {
      if (!member) return null

      try {
        // Tìm tất cả con trực tiếp của thành viên này
        const children = members.filter(
          (m) =>
            (m.parentId && m.parentId.toString() === member._id.toString()) ||
            (m.fatherId && m.fatherId.toString() === member._id.toString()) ||
            (m.motherId && m.motherId.toString() === member._id.toString()),
        )

        // Tìm vợ/chồng
        let spouse = null
        if (member.spouseId) {
          spouse = memberMap.get(member.spouseId.toString())
        }

        // Tạo node cho thành viên hiện tại
        const node = {
          name: member.fullName,
          attributes: {
            birthYear: member.birthYear || (member.birthDate ? new Date(member.birthDate).getFullYear() : null),
            deathYear: member.deathDate ? new Date(member.deathDate).getFullYear() : null,
            gender: member.gender === "MALE" ? "male" : member.gender === "FEMALE" ? "female" : "other",
            occupation: member.occupation || null,
            generation: member.generation || 1,
            image: member.image || null,
          },
          children: [],
        }

        // Thêm thông tin về vợ/chồng nếu có
        if (spouse) {
          node.attributes.spouse = spouse.fullName
          node.attributes.spouseId = spouse._id.toString()
          node.attributes.spouseImage = spouse.image || null
          node.attributes.spouseBirthYear =
            spouse.birthYear || (spouse.birthDate ? new Date(spouse.birthDate).getFullYear() : null)
        }

        // Thêm các con vào node
        if (children.length > 0) {
          // Sắp xếp con theo thứ tự
          const sortedChildren = children.sort((a, b) => {
            // Sắp xếp theo giới tính (nam trước)
            if (a.gender !== b.gender) {
              return a.gender === "MALE" ? -1 : 1
            }
            // Nếu cùng giới tính, sắp xếp theo năm sinh
            const aYear = a.birthYear || (a.birthDate ? new Date(a.birthDate).getFullYear() : 0)
            const bYear = b.birthYear || (b.birthDate ? new Date(b.birthDate).getFullYear() : 0)
            return aYear - bYear
          })

          // Đệ quy xây dựng cây cho từng con
          node.children = sortedChildren.map((child) => buildTree(child)).filter(Boolean) // Lọc bỏ các giá trị null
        }

        return node
      } catch (error) {
        console.error("Error building tree node:", error)
        return null
      }
    }

    // Xây dựng cây từ thành viên gốc đầu tiên
    const treeData = buildTree(rootMembers[0])

    if (!treeData) {
      return NextResponse.json({ error: "Failed to build family tree" }, { status: 500 })
    }

    return NextResponse.json(treeData)
  } catch (error) {
    console.error("Error fetching family tree data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
