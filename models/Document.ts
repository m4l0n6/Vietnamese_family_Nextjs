import mongoose, { Schema, type Document as IDocument } from "mongoose"

export interface IFamilyDocument extends IDocument {
  title: string
  description?: string
  fileUrl: string
  fileType: string
  userId: mongoose.Types.ObjectId
  familyTreeId: mongoose.Types.ObjectId
  memberId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IFamilyDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    familyTreeId: { type: Schema.Types.ObjectId, ref: "FamilyTree", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true },
)

export default mongoose.models.FamilyDocument || mongoose.model<IFamilyDocument>("FamilyDocument", DocumentSchema)

