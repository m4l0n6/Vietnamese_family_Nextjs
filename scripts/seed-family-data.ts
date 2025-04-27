import connectDB from "@/lib/mongodb"
import Member from "@/models/Member"
import mongoose from "mongoose"

async function seedFamilyData() {
  await connectDB()

  const familyTreeId = "your-family-tree-id" // Thay thế bằng ID gia phả thực tế
  const userId = "your-user-id" // Thay thế bằng ID người dùng thực tế

  // Xóa dữ liệu cũ
  await Member.deleteMany({ familyTreeId: new mongoose.Types.ObjectId(familyTreeId) })

  // Thế hệ 1 - Tổ tiên
  const ancestor = new Member({
    fullName: "Nguyễn Văn Tổ",
    gender: "MALE",
    birthDate: new Date("1920-01-01"),
    deathDate: new Date("2000-12-15"),
    occupation: "Nông dân",
    biography: "Người sáng lập dòng họ, đã có nhiều đóng góp cho làng xã.",
    familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    isAlive: false,
    createdById: new mongoose.Types.ObjectId(userId),
    updatedById: new mongoose.Types.ObjectId(userId),
  })

  await ancestor.save()

  // Thế hệ 2 - Con cái của tổ tiên
  const son1 = new Member({
    fullName: "Nguyễn Văn Trưởng",
    gender: "MALE",
    birthDate: new Date("1945-05-10"),
    deathDate: new Date("2015-08-22"),
    occupation: "Giáo viên",
    biography: "Con trai cả, từng là hiệu trưởng trường làng.",
    familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    parentId: ancestor._id,
    isAlive: false,
    createdById: new mongoose.Types.ObjectId(userId),
    updatedById: new mongoose.Types.ObjectId(userId),
  })

  const son2 = new Member({
    fullName: "Nguyễn Văn Thứ",
    gender: "MALE",
    birthDate: new Date("1950-03-15"),
    occupation: "Bác sĩ",
    biography: "Con trai thứ, hiện đang hành nghề y tại thành phố.",
    familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    parentId: ancestor._id,
    isAlive: true,
    createdById: new mongoose.Types.ObjectId(userId),
    updatedById: new mongoose.Types.ObjectId(userId),
  })

  const daughter = new Member({
    fullName: "Nguyễn Thị Út",
    gender: "FEMALE",
    birthDate: new Date("1955-11-20"),
    occupation: "Kế toán",
    biography: "Con gái út, làm việc tại công ty tư nhân.",
    familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    parentId: ancestor._id,
    isAlive: true,
    createdById: new mongoose.Types.ObjectId(userId),
    updatedById: new mongoose.Types.ObjectId(userId),
  })

  await son1.save()
  await son2.save()
  await daughter.save()

  // Cập nhật childrenIds cho tổ tiên
  ancestor.childrenIds = [son1._id, son2._id, daughter._id]
  await ancestor.save()

  // Thế hệ 3 - Cháu của tổ tiên (con của con trai cả)
  const grandson1 = new Member({
    fullName: "Nguyễn Văn Minh",
    gender: "MALE",
    birthDate: new Date("1970-07-25"),
    occupation: "Kỹ sư",
    biography: "Con trai cả của Nguyễn Văn Trưởng, làm việc trong lĩnh vực công nghệ.",
    familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    parentId: son1._id,
    isAlive: true,
    createdById: new mongoose.Types.ObjectId(userId),
    updatedById: new mongoose.Types.ObjectId(userId),
  })

  const granddaughter = new Member({
    fullName: "Nguyễn Thị Hương",
    gender: "FEMALE",
    birthDate: new Date("1975-04-12"),
    occupation: "Giáo viên",
    biography: "Con gái của Nguyễn Văn Trưởng, theo nghề của cha.",
    familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    parentId: son1._id,
    isAlive: true,
    createdById: new mongoose.Types.ObjectId(userId),
    updatedById: new mongoose.Types.ObjectId(userId),
  })

  await grandson1.save()
  await granddaughter.save()

  // Cập nhật childrenIds cho con trai cả
  son1.childrenIds = [grandson1._id, granddaughter._id]
  await son1.save()

  // Thế hệ 3 - Cháu của tổ tiên (con của con trai thứ)
  const grandson2 = new Member({
    fullName: "Nguyễn Văn Đức",
    gender: "MALE",
    birthDate: new Date("1980-09-30"),
    occupation: "Doanh nhân",
    biography: "Con trai của Nguyễn Văn Thứ, điều hành công ty riêng.",
    familyTreeId: new mongoose.Types.ObjectId(familyTreeId),
    parentId: son2._id,
    isAlive: true,
    createdById: new mongoose.Types.ObjectId(userId),
    updatedById: new mongoose.Types.ObjectId(userId),
  })

  await grandson2.save()

  // Cập nhật childrenIds cho con trai thứ
  son2.childrenIds = [grandson2._id]
  await son2.save()

  console.log("Đã tạo dữ liệu gia phả mẫu thành công!")
}

// Chạy hàm seed
seedFamilyData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Lỗi khi tạo dữ liệu:", error)
    process.exit(1)
  })

