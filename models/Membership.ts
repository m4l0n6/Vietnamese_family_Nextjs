import mongoose, { Schema, type Document } from "mongoose"

export interface IMembership extends Document {
  userId: mongoose.Types.ObjectId
  familyTreeId: mongoose.Types.ObjectId
  role: "OWNER" | "EDITOR" | "VIEWER"
  createdAt: Date
  updatedAt: Date
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    familyTreeId: { type: Schema.Types.ObjectId, ref: "FamilyTree", required: true },
    role: { type: String, enum: ["OWNER", "EDITOR", "VIEWER"], default: "VIEWER" },
  },
  { timestamps: true },
)

// Đảm bảo mỗi người dùng chỉ có một vai trò trong mỗi gia phả
MembershipSchema.index({ userId: 1, familyTreeId: 1 }, { unique: true })

export default mongoose.models.Membership || mongoose.model<IMembership>("Membership", MembershipSchema)
