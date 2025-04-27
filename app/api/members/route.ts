import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import Member from "@/models/Member"
import FamilyTree from "@/models/FamilyTree"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Lấy danh sách gia phả mà người dùng có quyền truy cập
    const userFamilyTrees = await FamilyTree.find({
      creatorId: new mongoose.Types.ObjectId(session.user.id),
    })

    const userMemberships = await Membership.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
    })

    const familyTreeIds = [
      ...userFamilyTrees.map((tree) => tree._id),
      ...userMemberships.map((membership) => membership.familyTreeId),
    ]

    // Lấy danh sách thành viên trong các gia phả đó
    const members = await Member.find({
      familyTreeId: { $in: familyTreeIds },
    }).sort({ lastName: 1, fullName: 1 })

    // Lấy thông tin tên gia phả
    const familyTreesMap = new Map()
    for (const tree of userFamilyTrees) {
      familyTreesMap.set(tree._id.toString(), tree.name)
    }

    // Lấy thông tin tên gia phả từ memberships
    const membershipTreeIds = userMemberships.map((membership) => membership.familyTreeId)
    if (membershipTreeIds.length > 0) {
      const membershipTrees = await FamilyTree.find({
        _id: { $in: membershipTreeIds },
      })
      for (const tree of membershipTrees) {
        familyTreesMap.set(tree._id.toString(), tree.name)
      }
    }

    return NextResponse.json(
      members.map((member) => ({
        id: member._id.toString(),
        fullName: member.fullName,
        lastName: member.lastName,
        gender: member.gender,
        birthDate: member.birthDate,
        deathDate: member.deathDate,
        isAlive: member.isAlive,
        familyTreeId: member.familyTreeId.toString(),
        familyTreeName: familyTreesMap.get(member.familyTreeId.toString()) || "Không xác định",
      })),
    )
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

