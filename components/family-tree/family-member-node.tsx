import { memo } from "react"
import { Handle, Position } from "reactflow"
import Image from "next/image"
import { User } from "lucide-react"

interface FamilyMemberNodeProps {
  data: {
    id: string
    name: string
    gender: "male" | "female"
    birthYear?: number
    deathYear?: number
    generation: number
    image?: string
    isRoot?: boolean
  }
}

export const FamilyMemberNode = memo(({ data }: FamilyMemberNodeProps) => {
  const { name, gender, birthYear, deathYear, generation, image, isRoot } = data
  const isMale = gender === "male"

  return (
    <div
      className={`family-member-node rounded-md border border-amber-400 bg-white p-3 shadow-md w-[160px] transition-all duration-300 hover:shadow-lg ${
        isRoot ? "border-2 border-amber-500 bg-amber-50" : ""
      }`}
    >
      {/* Node kết nối phía trên - biểu thị mối quan hệ cha mẹ */}
      <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 bg-amber-500" />

      {/* Node kết nối bên trái hoặc phải tùy thuộc vào giới tính */}
      {isMale ? (
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="w-2 h-2 bg-blue-500"
          style={{ right: -8 }}
        />
      ) : (
        <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 bg-pink-500" style={{ left: -8 }} />
      )}

      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-200 mb-2 bg-amber-100">
          {image ? (
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-amber-700" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm">{name}</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {birthYear && (
              <span>
                {birthYear}
                {deathYear ? ` - ${deathYear}` : ""}
              </span>
            )}
          </div>
          <div className="text-xs text-amber-700 mt-1">Đời {generation}</div>
        </div>
      </div>
    </div>
  )
})

FamilyMemberNode.displayName = "FamilyMemberNode"
