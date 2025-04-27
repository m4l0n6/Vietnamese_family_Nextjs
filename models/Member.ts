import mongoose, { Schema, type Document } from "mongoose"

export interface IMember extends Document {
  fullName: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  birthYear?: string
  birthDate?: Date
  birthPlace?: string
  deathYear?: string
  deathDate?: Date
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
    birthPlace: { type: String },
    deathYear: { type: String },
    deathDate: { type: Date },
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
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema)

