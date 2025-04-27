import mongoose from "mongoose"

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
    },
    type: {
      type: String,
      enum: ["family", "personal"],
      default: "family",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    familyTreeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyTree",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Event || mongoose.model("Event", EventSchema)

