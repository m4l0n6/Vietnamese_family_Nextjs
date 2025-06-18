import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Membership from "@/models/Membership"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import mongoose from "mongoose"

// Lấy danh sách gia phả của người dùng
export async function GET(req: NextRequest) {
  try {
    console.log("Starting GET /api/family-trees")
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session)

    if (!session?.user) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    console.log("User ID:", userId)

    await connectDB()
    console.log("Connected to database")

    try {
      // Lấy các gia phả mà người dùng có quyền truy cập
      const memberships = await Membership.find({ 
        userId: new mongoose.Types.ObjectId(userId) 
      }).populate("familyTreeId").lean()
      
      console.log("Memberships found:", memberships.length)

      // Lấy các gia phả mà người dùng đã tạo
      const createdFamilyTrees = await FamilyTree.find({
        creatorId: new mongoose.Types.ObjectId(userId),
      }).lean()
      
      console.log("Created family trees found:", createdFamilyTrees.length)

      // Kết hợp và loại bỏ trùng lặp
      const membershipFamilyTrees = memberships
        .map((m) => m.familyTreeId)
        .filter((tree) => tree !== null) // Lọc bỏ các tree null

      const allFamilyTrees = [
        ...createdFamilyTrees,
        ...membershipFamilyTrees.filter(
          (tree) => !createdFamilyTrees.some((created: any) => created._id.toString() === tree._id.toString()),
        ),
      ]

      console.log("Total unique family trees:", allFamilyTrees.length)

      // Chuyển đổi dữ liệu
      const formattedFamilyTrees = allFamilyTrees.map((tree: any) => ({
        id: tree._id.toString(),
        name: tree.name,
        description: tree.description,
        origin: tree.origin,
        foundingYear: tree.foundingYear,
        isPublic: tree.isPublic,
        createdAt: tree.createdAt,
        updatedAt: tree.updatedAt,
      }))

      console.log("Returning formatted family trees")
      return NextResponse.json(formattedFamilyTrees)
    } catch (dbError) {
      console.error("Database operation error:", dbError)
      return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching family trees:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Tạo gia phả mới
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const data = await req.json()

    const { name, description, origin, foundingYear, isPublic } = data

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!origin) {
      return NextResponse.json({ error: "Origin is required" }, { status: 400 })
    }

    await connectDB()

    // Tạo gia phả mới
    const familyTree = new FamilyTree({
      name,
      description,
      origin,
      foundingYear: foundingYear || null,
      isPublic: isPublic || false,
      creatorId: new mongoose.Types.ObjectId(userId),
    })

    await familyTree.save()

    // Tạo quyền OWNER cho người tạo
    const membership = new Membership({
      userId: new mongoose.Types.ObjectId(userId),
      familyTreeId: familyTree._id,
      role: "OWNER",
    })

    await membership.save()

    return NextResponse.json(
      {
        id: familyTree._id.toString(),
        name: familyTree.name,
        description: familyTree.description,
        origin: familyTree.origin,
        foundingYear: familyTree.foundingYear,
        isPublic: familyTree.isPublic,
        createdAt: familyTree.createdAt,
        updatedAt: familyTree.updatedAt,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating family tree:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
