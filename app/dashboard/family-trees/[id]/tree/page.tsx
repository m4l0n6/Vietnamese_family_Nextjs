"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { ImprovedTreeVisualization } from "@/components/family-tree/improved-tree-visualization"
import { useToast } from "@/hooks/use-toast"

export default function FamilyTreePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [familyTreeName, setFamilyTreeName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchFamilyTreeName = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/family-trees/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch family tree")
        }
        const data = await response.json()
        setFamilyTreeName(data.name)
      } catch (error) {
        console.error("Error fetching family tree:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin gia phả",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFamilyTreeName()
  }, [params.id, toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/family-trees/${params.id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phả đồ</h1>
          <p className="text-muted-foreground">
            {loading ? "Đang tải..." : `Biểu diễn trực quan gia phả ${familyTreeName}`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cây gia phả</CardTitle>
        </CardHeader>
        <CardContent>
          <ImprovedTreeVisualization familyTreeId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}
