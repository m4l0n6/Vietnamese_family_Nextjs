import type { FamilyNode, FamilyData } from "./family-tree-types"

interface ApiMember {
  _id: string
  fullName: string
  gender: string
  birthYear?: number
  birthDate?: string
  deathYear?: number
  deathDate?: string
  generation: number
  parentId?: string
  fatherId?: string
  motherId?: string
  spouseId?: string
  image?: string
  occupation?: string
  childrenIds?: string[]
}

export function convertApiDataToFamilyTree(apiData: ApiMember[]): FamilyData {
  try {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      console.log("No API data provided or empty array")
      return { familyNodes: [], rootId: "" }
    }

    // Tìm thành viên gốc (không có parentId, fatherId, motherId)
    const rootMembers = apiData.filter((member) => !member.parentId && !member.fatherId && !member.motherId)

    let rootId = ""
    if (rootMembers.length === 0 && apiData.length > 0) {
      // Nếu không tìm thấy thành viên gốc, lấy thành viên đời thấp nhất làm gốc
      const lowestGeneration = Math.min(...apiData.map((m) => m.generation || 1))
      const potentialRoots = apiData.filter((m) => (m.generation || 1) === lowestGeneration)

      if (potentialRoots.length > 0) {
        rootId = potentialRoots[0]._id?.toString() || ""
      }
    } else if (rootMembers.length > 0) {
      // Sử dụng thành viên gốc đầu tiên
      rootId = rootMembers[0]._id?.toString() || ""
    } else {
      // Fallback to first member if no root found
      rootId = apiData[0]._id?.toString() || ""
    }

    // Chuyển đổi tất cả thành viên
    const familyNodes = apiData.map((member) => convertMemberToFamilyNode(member, apiData))

    console.log(`Converted ${familyNodes.length} family nodes with root ID: ${rootId}`)

    return { familyNodes, rootId }
  } catch (error) {
    console.error("Error converting API data to family tree:", error)
    return { familyNodes: [], rootId: "" }
  }
}

function convertMemberToFamilyNode(member: ApiMember, allMembers: ApiMember[]): FamilyNode {
  try {
    const id = member._id?.toString() || ""

    // Tìm cha mẹ
    const parents: string[] = []
    if (member.fatherId) parents.push(member.fatherId.toString())
    if (member.motherId) parents.push(member.motherId.toString())
    if (member.parentId && !parents.includes(member.parentId.toString())) {
      parents.push(member.parentId.toString())
    }

    // Tìm vợ/chồng
    const spouses: string[] = []
    if (member.spouseId) spouses.push(member.spouseId.toString())

    // Tìm con cái
    let children: string[] = []
    if (member.childrenIds && Array.isArray(member.childrenIds)) {
      children = member.childrenIds.map((id) => id.toString())
    } else {
      // Tìm con cái (những thành viên có parentId, fatherId hoặc motherId là id của thành viên này)
      children = allMembers
        .filter(
          (m) =>
            (m.parentId && m.parentId.toString() === id) ||
            (m.fatherId && m.fatherId.toString() === id) ||
            (m.motherId && m.motherId.toString() === id),
        )
        .map((child) => child._id?.toString() || "")
        .filter((id) => id !== "")
    }

    // Tìm anh chị em
    const siblings = allMembers
      .filter((m) => {
        // Không tính chính mình là anh chị em
        if (m._id?.toString() === id) return false

        // Kiểm tra có cùng cha hoặc mẹ không
        const sameFather = member.fatherId && m.fatherId && member.fatherId.toString() === m.fatherId.toString()
        const sameMother = member.motherId && m.motherId && member.motherId.toString() === m.motherId.toString()
        const sameParent = member.parentId && m.parentId && member.parentId.toString() === m.parentId.toString()

        return sameFather || sameMother || sameParent
      })
      .map((sibling) => sibling._id?.toString() || "")
      .filter((id) => id !== "")

    return {
      id,
      gender: member.gender === "MALE" ? "male" : "female",
      parents,
      children,
      siblings,
      spouses,
      name: member.fullName || "Không có tên",
      birthYear: member.birthYear || (member.birthDate ? new Date(member.birthDate).getFullYear() : undefined),
      deathYear: member.deathYear || (member.deathDate ? new Date(member.deathDate).getFullYear() : undefined),
      generation: member.generation || 1,
      image: member.image,
      occupation: member.occupation,
    }
  } catch (error) {
    console.error("Error converting member to family node:", error)
    return {
      id: member._id?.toString() || "",
      gender: "male",
      parents: [],
      children: [],
      siblings: [],
      spouses: [],
      name: member.fullName || "Lỗi dữ liệu",
      generation: 1,
    }
  }
}
