import { memo } from "react";
import { Handle, Position } from "reactflow";
import Image from "next/image";
import { User } from "lucide-react";

interface FamilyMemberNodeProps {
  data: {
    id: string;
    name: string;
    gender: "male" | "female";
    birthYear?: number;
    deathYear?: number;
    generation: number;
    image?: string;
    isRoot?: boolean;
  };
}

export const FamilyMemberNode = memo(({ data }: FamilyMemberNodeProps) => {
  const { name, gender, birthYear, deathYear, generation, image, isRoot } =
    data;
  const isMale = gender === "male";

  return (
    <div
      className={`family-member-node rounded-md border border-amber-400 bg-white p-3 shadow-md w-[160px] transition-all duration-300 hover:shadow-lg ${
        isRoot ? "border-2 border-amber-500 bg-amber-50" : ""
      }`}
    >
      {/* Node kết nối phía trên - biểu thị mối quan hệ cha mẹ */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="bg-amber-500 w-2 h-2"
      />

      {/* Node kết nối bên trái hoặc phải tùy thuộc vào giới tính */}
      {isMale ? (
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="bg-blue-500 w-2 h-2"
          style={{ right: -8 }}
        />
      ) : (
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className="bg-pink-500 w-2 h-2"
          style={{ left: -8 }}
        />
      )}

      <div className="flex flex-col items-center">
        <div className="bg-amber-100 mb-2 border-2 border-amber-200 rounded-full w-16 h-16 overflow-hidden">
          {image ? (
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <User className="w-8 h-8 text-amber-700" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm">{name}</h3>
          <div className="text-gray-600 dark:text-gray-400 text-xs">
            {birthYear && (
              <span>
                {birthYear}
                {deathYear ? ` - ${deathYear}` : ""}
              </span>
            )}
          </div>
          <div className="mt-1 text-amber-700 text-xs">Đời {generation}</div>
        </div>
      </div>
    </div>
  );
});

FamilyMemberNode.displayName = "FamilyMemberNode";
