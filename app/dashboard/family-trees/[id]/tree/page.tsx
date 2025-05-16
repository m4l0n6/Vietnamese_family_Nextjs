"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { VietnameseFamilyTree } from "@/components/family-tree/vietnamese-family-tree"
import { convertApiDataToFamilyTree } from "@/lib/family-tree-converter"
import type { FamilyData } from "@/lib/family-tree-types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FamilyTreePage() {
  const params = useParams()
  const familyTreeId = params.id as string
  const [familyData, setFamilyData] = useState<FamilyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [familyName, setFamilyName] = useState("Gia phả")

  useEffect(() => {
    const fetchFamilyTreeData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch family tree info
        const familyResponse = await fetch(`/api/family-trees/${familyTreeId}`)
        if (familyResponse.ok) {
          const familyData = await familyResponse.json()
          setFamilyName(familyData.name)
        }

        const response = await fetch(`/api/family-trees/${familyTreeId}/members`)

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu gia phả")
        }

        const members = await response.json()

        if (!members || !Array.isArray(members) || members.length === 0) {
          setError("Gia phả này chưa có thành viên")
          setLoading(false)
          return
        }

        const convertedData = convertApiDataToFamilyTree(members)

        if (!convertedData.rootId || convertedData.familyNodes.length === 0) {
          setError("Không thể tạo cây gia phả từ dữ liệu hiện có")
          setLoading(false)
          return
        }

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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/family-trees/${familyTreeId}`}>
          <Button variant="outline" size="sm" className="w-fit gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Phả đồ: {familyName}</h1>
        <p className="text-muted-foreground">Xem biểu đồ cây gia phả của gia đình bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phả đồ gia tộc</CardTitle>
          <CardDescription>Hiển thị trực quan các mối quan hệ trong gia đình dưới dạng cây</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-[600px]">
              <Skeleton className="w-full h-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : familyData ? (
            <VietnameseFamilyTree familyData={familyData} />
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
