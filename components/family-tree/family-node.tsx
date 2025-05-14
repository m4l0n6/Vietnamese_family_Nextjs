"use client"

import type React from "react"

import { useTheme } from "next-themes"
import type { ExtNode } from "@/lib/family-tree-types"

interface FamilyNodeProps {
  node: ExtNode
  isRoot: boolean
  onClick: (nodeId: string) => void
  style?: React.CSSProperties
}

export const FamilyNode: React.FC<FamilyNodeProps> = ({ node, isRoot, onClick, style }) => {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const handleClick = () => {
    onClick(node.id)
  }

  const getNodeBorderColor = (gender: string) => {
    if (gender === "female") {
      return "#EC4899" // pink-500 cho nữ
    } else {
      return "#0EA5E9" // sky-500 cho nam
    }
  }

  const getNodeBackgroundColor = (gender: string) => {
    if (gender === "female") {
      return "#FCE7F3" // pink-100 cho nữ
    } else {
      return "#E0F2FE" // sky-100 cho nam
    }
  }

  const borderColor = getNodeBorderColor(node.gender)
  const backgroundColor = getNodeBackgroundColor(node.gender)
  const textColor = isDarkMode ? "white" : "black"

  return (
    <div
      onClick={handleClick}
      style={{
        ...style,
        width: 100,
        height: 120,
        backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        cursor: "pointer",
        boxShadow: isRoot ? "0 0 10px rgba(0, 0, 0, 0.3)" : "none",
      }}
    >
      {node.image ? (
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            overflow: "hidden",
            marginBottom: 4,
          }}
        >
          <img
            src={node.image || "/placeholder.svg"}
            alt={node.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            crossOrigin="anonymous"
          />
        </div>
      ) : (
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: borderColor,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 20,
          }}
        >
          {node.name.charAt(0)}
        </div>
      )}
      <div
        style={{
          fontSize: 12,
          fontWeight: "bold",
          textAlign: "center",
          color: textColor,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        {node.name}
      </div>
      {node.birthYear && (
        <div
          style={{
            fontSize: 10,
            color: textColor,
          }}
        >
          {node.birthYear}
          {node.deathYear ? ` - ${node.deathYear}` : ""}
        </div>
      )}
      <div
        style={{
          fontSize: 10,
          color: textColor,
          marginTop: 2,
        }}
      >
        {`Đời: ${node.generation}`}
      </div>
    </div>
  )
}
