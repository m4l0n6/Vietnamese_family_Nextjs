import { memo } from "react"
import { Handle, Position } from "reactflow"

interface ConnectionNodeProps {
  data: {
    id: string
    label?: string
  }
}

export const ConnectionNode = memo(({ data }: ConnectionNodeProps) => {
  const { label } = data

  return (
    <div className="connection-node relative">
      {/* Node kết nối từ chồng (bên trái) */}
      <Handle
        type="target"
        position={Position.Left}
        id="from-husband"
        className="w-2 h-2 bg-amber-500"
        style={{ left: -8 }}
      />

      {/* Node kết nối từ vợ (bên phải) */}
      <Handle
        type="target"
        position={Position.Right}
        id="from-wife"
        className="w-2 h-2 bg-amber-500"
        style={{ right: -8 }}
      />

      {/* Node kết nối đến con */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="to-child"
        className="w-2 h-2 bg-amber-500"
        style={{ bottom: -8 }}
      />

      {/* Điểm nối chung */}
      <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
        {label && (
          <div className="absolute whitespace-nowrap text-xs font-medium bg-white px-1 py-0.5 rounded border border-amber-300 -translate-y-6">
            {label}
          </div>
        )}
      </div>
    </div>
  )
})

ConnectionNode.displayName = "ConnectionNode"
