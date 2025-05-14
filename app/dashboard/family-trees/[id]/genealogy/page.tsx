import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FamilyTreeHierarchy } from "@/components/family-tree/family-tree-hierarchy"

export default function GenealogyPage() {
  const params = useParams()
  const familyTreeId = params.id as string
  const [loading, setLoading] = useState(true)
  const [familyName, setFamilyName] = useState("Gia phả")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

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
        <h1 className="text-3xl font-bold tracking-tight">Phả hệ: {familyName}</h1>
        <p className="text-muted-foreground">Xem danh sách các thành viên trong gia phả theo từng đời</p>
      </div>

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
    </div>
  )
}
