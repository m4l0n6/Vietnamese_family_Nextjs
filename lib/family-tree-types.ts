import type React from "react"

export interface FamilyNode {
  id: string
  gender: "male" | "female"
  parents: string[]
  children: string[]
  siblings: string[]
  spouses: string[]
  name: string
  birthYear?: number
  deathYear?: number
  generation: number
  image?: string
  occupation?: string
}

export interface ExtNode extends FamilyNode {
  top?: number
  left?: number
  hasSubTree?: boolean
}

export interface FamilyData {
  familyNodes: FamilyNode[]
  rootId: string
}

export interface NodeDisplayProps {
  node: ExtNode
  isRoot: boolean
  onClick: (nodeId: string) => void
  style?: React.CSSProperties
  className?: string
}

export interface FamilyTreeProps {
  familyData: FamilyData
  width: number
  height: number
  className?: string
  renderNode?: (props: NodeDisplayProps) => React.ReactNode
  onNodeClick?: (nodeId: string) => void
}
