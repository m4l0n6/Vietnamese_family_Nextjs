import mongoose, { Schema, type Document } from "mongoose"

export interface IFamilyTree extends Document {
  name: string
  description?: string
  origin?: string
  foundingYear?: number
  isPublic: boolean
  creatorId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const FamilyTreeSchema = new Schema<IFamilyTree>(
  {
    name: { type: String, required: true },
    description: { type: String },
    origin: { type: String },
    foundingYear: { type: Number },
    isPublic: { type: Boolean, default: false },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default mongoose.models.FamilyTree || mongoose.model<IFamilyTree>("FamilyTree", FamilyTreeSchema)
