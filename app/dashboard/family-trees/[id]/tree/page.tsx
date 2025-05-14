"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FamilyTreeNew } from "@/components/family-tree/family-tree-new"
import { convertApiDataToFamilyTree } from "@/lib/family-tree-converter"
import type { FamilyData } from "@/lib/family-tree-types"
import { Skeleton } from "@/components/ui/skeleton"

export default function FamilyTreePage() {
  const params = useParams()
  const familyTreeId = params.id as string
  const [familyData, setFamilyData] = useState<FamilyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFamilyTreeData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/family-trees/${familyTreeId}/members`)

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu gia phả")
        }

        const members = await response.json()

        if (!members || members.length === 0) {
          setError("Gia phả này chưa có thành viên")
          setLoading(false)
          return
        }

        const convertedData = convertApiDataToFamilyTree(members)
        setFamilyData(convertedData)
      } catch (error) {
        console.error("Error fetching family tree data:", error)
        setError(error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    if (familyTreeId) {
      fetchFamilyTreeData()
    }
  }, [familyTreeId])

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Phả đồ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-[600px]">
              <Skeleton className="w-full h-full" />
            </div>
          ) : error ? (
            <div className="w-full h-[600px] flex items-center justify-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : familyData ? (
            <FamilyTreeNew familyData={familyData} />
          ) : (
            <div className="w-full h-[600px] flex items-center justify-center">
              <p className="text-muted-foreground">Không có dữ liệu gia phả</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
