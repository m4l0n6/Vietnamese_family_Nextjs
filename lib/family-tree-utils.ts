// Define the data structures
export interface FlatMember {
  id: string
  name: string
  gender: "male" | "female"
  birthYear?: number
  deathYear?: number
  generation: number
  parentId?: string
  children?: string[]
  spouse?: string
  occupation?: string
}

export interface TreeNode {
  name: string
  attributes?: {
    birthYear?: number
    deathYear?: number
    gender?: "male" | "female"
    occupation?: string
    spouse?: string
  }
  children?: TreeNode[]
}

/**
 * Converts flat member data to hierarchical tree data
 * @param members Array of flat member objects
 * @param rootId ID of the root member (ancestor)
 * @returns Hierarchical tree structure
 */
export function convertToTreeData(members: FlatMember[], rootId?: string): TreeNode | null {
  if (!members.length) return null

  // If rootId is not provided, find the member with the lowest generation
  let root: FlatMember | undefined
  if (rootId) {
    root = members.find((m) => m.id === rootId)
  } else {
    // Find the member with the lowest generation number
    root = members.reduce((prev, current) => (prev.generation < current.generation ? prev : current))
  }

  if (!root) return null

  // Create a map for quick lookup
  const membersMap = new Map<string, FlatMember>()
  members.forEach((member) => {
    membersMap.set(member.id, member)
  })

  // Recursive function to build the tree
  function buildTree(member: FlatMember): TreeNode {
    const node: TreeNode = {
      name: member.name,
      attributes: {
        birthYear: member.birthYear,
        deathYear: member.deathYear,
        gender: member.gender,
        occupation: member.occupation,
        spouse: member.spouse,
      },
    }

    // Find all children
    const childrenIds = member.children || []
    if (childrenIds.length > 0) {
      node.children = childrenIds
        .map((id) => membersMap.get(id))
        .filter((child): child is FlatMember => !!child)
        .map((child) => buildTree(child))
    }

    return node
  }

  return buildTree(root)
}

/**
 * Converts hierarchical tree data to flat member data
 * @param treeData Hierarchical tree structure
 * @returns Array of flat member objects
 */
export function convertToFlatData(treeData: TreeNode): FlatMember[] {
  const members: FlatMember[] = []
  let idCounter = 1

  function traverse(node: TreeNode, parentId?: string, generation = 1) {
    const id = String(idCounter++)
    const childrenIds: string[] = []

    // Create the member
    const member: FlatMember = {
      id,
      name: node.name,
      gender: node.attributes?.gender || "male",
      birthYear: node.attributes?.birthYear,
      deathYear: node.attributes?.deathYear,
      generation,
      parentId,
      children: childrenIds,
      spouse: node.attributes?.spouse,
      occupation: node.attributes?.occupation,
    }

    members.push(member)

    // Process children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        const childId = String(idCounter)
        childrenIds.push(childId)
        traverse(child, id, generation + 1)
      })
    }

    // Update the member with children IDs
    member.children = childrenIds
  }

  traverse(treeData)
  return members
}

