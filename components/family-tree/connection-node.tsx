import { memo } from "react";
import { Handle, Position } from "reactflow";

interface ConnectionNodeProps {
  data: {
    id: string;
    label?: string;
  };
}

export const ConnectionNode = memo(({ data }: ConnectionNodeProps) => {
  // Node ẩn có handle trên và dưới để nối edge
  return (
    <div
      className="relative connection-node"
      style={{
        width: 16,
        height: 16,
        minWidth: 0,
        minHeight: 0,
        padding: 0,
        background: "transparent",
      }}
    >
      {/* Handle trên và dưới để nối edge */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: "#f59e42" }}
      />
      <div
        className="absolute bg-amber-500 border-2 border-amber-700 rounded-full"
        style={{
          width: 12,
          height: 12,
          left: 2,
          top: 2,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: "#f59e42" }}
      />
    </div>
  );
});

ConnectionNode.displayName = "ConnectionNode";
