"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function TreeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Tree visualization error:", error)
  }, [error])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/family-trees">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lỗi hiển thị phả đồ</h1>
          <p className="text-muted-foreground">Đã xảy ra lỗi khi tải dữ liệu gia phả</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Không thể hiển thị cây gia phả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-6">
              Đã xảy ra lỗi khi tải dữ liệu cây gia phả. Vui lòng thử lại sau.
            </p>
            <div className="flex gap-4">
              <Button onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
              <Link href="/dashboard/family-trees">
                <Button variant="outline">Quay lại danh sách gia phả</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
