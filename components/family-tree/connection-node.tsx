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
    <div className="relative bg-transparent p-0 w-4 min-w-0 h-4 min-h-0 connection-node">
      {/* Handle trên và dưới để nối edge */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: "#f59e42" }}
      />
      <div className="absolute bg-amber-500 p-0 border-2 border-amber-700 rounded-full w-4 min-w-0 h-4 min-h-0" />
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
