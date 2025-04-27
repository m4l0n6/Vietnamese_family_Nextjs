"use client"

import { useState, useEffect } from "react"
import FamilyTreeDiagram from "@/components/family-tree/family-tree-diagram"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FamilyTreePage() {
  const [treeData, setTreeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/family-tree")
        if (!response.ok) {
          throw new Error("Failed to fetch family tree data")
        }
        const data = await response.json()
        setTreeData(data)
      } catch (error) {
        console.error("Error fetching family tree data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleDownloadJson = () => {
    if (!treeData) return

    const dataStr = JSON.stringify(treeData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = "family-tree-data.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Tải xuống thành công",
      description: "Dữ liệu JSON đã được tải xuống",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Phả Đồ Gia Đình</CardTitle>
              <CardDescription>
                Sơ đồ phả hệ gia đình Họ Nguyễn theo cấu trúc cây với tổ tiên ở trên cùng
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleDownloadJson}>
              <Download className="h-4 w-4" />
              <span>Tải xuống JSON</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tree" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="tree">Sơ Đồ Cây</TabsTrigger>
              <TabsTrigger value="json">Dữ Liệu JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="tree" className="w-full">
              {loading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <FamilyTreeDiagram data={treeData} />
              )}
            </TabsContent>
            <TabsContent value="json">
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                <pre className="text-sm">{JSON.stringify(treeData, null, 2)}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-200 border border-blue-300 dark:bg-blue-800 dark:border-blue-700"></div>
            <span className="text-sm">Nam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-200 border border-pink-300 dark:bg-pink-800 dark:border-pink-700"></div>
            <span className="text-sm">Nữ</span>
          </div>
        </div>
        <Button variant="outline">Xuất PDF</Button>
      </div>
    </div>
  )
}

