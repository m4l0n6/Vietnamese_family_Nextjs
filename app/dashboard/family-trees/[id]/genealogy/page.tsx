"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImprovedTreeVisualization } from "@/components/family-tree/improved-tree-visualization"
import { FamilyTreeHierarchy } from "@/components/family-tree/family-tree-hierarchy"

export default function GenealogyPage() {
  const params = useParams()
  const familyTreeId = params.id as string
  const [loading, setLoading] = useState(true)
  const [treeData, setTreeData] = useState(null)
  const [familyName, setFamilyName] = useState("Gia phả")
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tree-diagram")

  // Lấy tab từ URL nếu có
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get("tab")
    if (tabParam && (tabParam === "tree-diagram" || tabParam === "generations")) {
      setActiveTab(tabParam)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch tree data
        const treeResponse = await fetch(`/api/family-trees/${familyTreeId}/tree-data`)
        if (!treeResponse.ok) {
          throw new Error("Failed to fetch family tree data")
        }

        const treeData = await treeResponse.json()
        setTreeData(treeData)

        // Fetch family tree info
        const familyResponse = await fetch(`/api/family-trees/${familyTreeId}`)
        if (familyResponse.ok) {
          const familyData = await familyResponse.json()
          setFamilyName(familyData.name)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Không thể tải dữ liệu gia phả. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    if (familyTreeId) {
      fetchData()
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
        <h1 className="text-3xl font-bold tracking-tight">Phả đồ & Phả hệ: {familyName}</h1>
        <p className="text-muted-foreground">Xem và quản lý cây phả hệ của gia đình bạn</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tree-diagram">Phả đồ</TabsTrigger>
          <TabsTrigger value="generations">Phả hệ</TabsTrigger>
        </TabsList>

        <TabsContent value="tree-diagram" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Phả đồ gia tộc</CardTitle>
              <CardDescription>Hiển thị trực quan các mối quan hệ trong gia đình dưới dạng cây</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                  <Skeleton className="h-[400px] w-full" />
                  <div className="text-center text-muted-foreground">Đang tải dữ liệu cây gia phả...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center text-red-500">{error}</div>
                </div>
              ) : (
                <div className="h-[600px] w-full">
                  {treeData && <ImprovedTreeVisualization data={treeData} familyTreeId={familyTreeId} />}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Phả hệ theo đời</CardTitle>
              <CardDescription>Hiển thị các thành viên trong gia phả theo từng đời</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : error ? (
                <div className="text-red-500 p-4">{error}</div>
              ) : (
                <FamilyTreeHierarchy familyTreeId={familyTreeId} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

