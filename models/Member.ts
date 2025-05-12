import mongoose, { Schema, type Document } from "mongoose"

export interface IMember extends Document {
  fullName: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  birthYear?: string
  birthDate?: Date
  birthDateLunar?: string // Ngày sinh âm lịch
  birthPlace?: string
  deathYear?: string
  deathDate?: Date
  deathDateLunar?: string // Ngày mất âm lịch
  deathPlace?: string
  biography?: string
  image?: string
  familyTreeId: mongoose.Types.ObjectId
  parentId?: mongoose.Types.ObjectId
  fatherId?: mongoose.Types.ObjectId
  motherId?: mongoose.Types.ObjectId
  spouseId?: mongoose.Types.ObjectId
  childrenIds?: mongoose.Types.ObjectId[]
  isAlive?: boolean
  generation?: number
  role?: string
  occupation?: string
  notes?: string
  hometown?: string // Nguyên quán
  ethnicity?: string // Dân tộc
  nationality?: string // Quốc tịch
  religion?: string // Tôn giáo
  title?: string // Danh hiệu
  createdById: mongoose.Types.ObjectId
  updatedById: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>(
  {
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    birthYear: { type: String },
    birthDate: { type: Date },
    birthDateLunar: { type: String },
    birthPlace: { type: String },
    deathYear: { type: String },
    deathDate: { type: Date },
    deathDateLunar: { type: String },
    deathPlace: { type: String },
    biography: { type: String },
    image: { type: String },
    familyTreeId: { type: Schema.Types.ObjectId, ref: "FamilyTree", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Member" },
    fatherId: { type: Schema.Types.ObjectId, ref: "Member" },
    motherId: { type: Schema.Types.ObjectId, ref: "Member" },
    spouseId: { type: Schema.Types.ObjectId, ref: "Member" },
    childrenIds: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    isAlive: { type: Boolean, default: true },
    generation: { type: Number, default: 1 },
    role: { type: String },
    occupation: { type: String },
    notes: { type: String },
    hometown: { type: String }, // Nguyên quán
    ethnicity: { type: String }, // Dân tộc
    nationality: { type: String }, // Quốc tịch
    religion: { type: String }, // Tôn giáo
    title: { type: String }, // Danh hiệu
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema)
