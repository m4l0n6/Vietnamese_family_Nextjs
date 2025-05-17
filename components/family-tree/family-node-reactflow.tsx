import { memo } from "react"
import { Handle, Position } from "reactflow"
import Image from "next/image"
import { User } from "lucide-react"

interface FamilyNodeProps {
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

export const FamilyNode = memo(({ data }: FamilyNodeProps) => {
  const { name, gender, birthYear, deathYear, generation, image, isRoot } = data

  return (
    <div
      className={`family-node rounded-md border border-amber-400 bg-white p-3 shadow-md w-[160px] transition-all duration-300 hover:shadow-lg ${
        isRoot ? "border-2 border-amber-500 bg-amber-50" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-amber-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-amber-500" />

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

FamilyNode.displayName = "FamilyNode"
