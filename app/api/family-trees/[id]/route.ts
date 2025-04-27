import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import FamilyTree from "@/models/FamilyTree"
import Membership from "@/models/Membership"
import mongoose from "mongoose"

// Get a specific family tree
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id

    // Check access rights
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

    // Get family tree
    const familyTree = await FamilyTree.findById(new mongoose.Types.ObjectId(familyTreeId))

    if (!familyTree) {
      return NextResponse.json({ error: "Family tree not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: familyTree._id.toString(),
      name: familyTree.name,
      description: familyTree.description,
      origin: familyTree.origin,
      foundingYear: familyTree.foundingYear,
      isPublic: familyTree.isPublic,
      createdAt: familyTree.createdAt,
      updatedAt: familyTree.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching family tree:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update a family tree
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id

    // Check access rights
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
    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Update family tree
    const familyTree = await FamilyTree.findByIdAndUpdate(
      new mongoose.Types.ObjectId(familyTreeId),
      {
        name: data.name,
        description: data.description,
        origin: data.origin,
        foundingYear: data.foundingYear,
        isPublic: data.isPublic,
      },
      { new: true },
    )

    if (!familyTree) {
      return NextResponse.json({ error: "Family tree not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: familyTree._id.toString(),
      name: familyTree.name,
      description: familyTree.description,
      origin: familyTree.origin,
      foundingYear: familyTree.foundingYear,
      isPublic: familyTree.isPublic,
      createdAt: familyTree.createdAt,
      updatedAt: familyTree.updatedAt,
    })
  } catch (error) {
    console.error("Error updating family tree:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete a family tree
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const familyTreeId = params.id

    // Check access rights
    const isCreator = await FamilyTree.findOne({
      _id: new mongoose.Types.ObjectId(familyTreeId),
      creatorId: new mongoose.Types.ObjectId(session.user.id),
    })

    if (!isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete family tree
    const result = await FamilyTree.deleteOne({
      _id: new mongoose.Types.ObjectId(familyTreeId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Family tree not found" }, { status: 404 })
    }

    // Delete all memberships
    await Membership.deleteMany({
      familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting family tree:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

