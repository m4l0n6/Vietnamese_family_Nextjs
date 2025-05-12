import mongoose, { Schema, type Document } from "mongoose"
import { hash, compare } from "bcryptjs" // Thay đổi từ 'bcrypt' sang 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  image?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true },
)

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const hashedPassword = await hash(this.password, 10)
    this.password = hashedPassword
    next()
  } catch (error: any) {
    next(error)
  }
})

// Phương thức so sánh mật khẩu
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
