import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Users } from "lucide-react"

export default function RecentFamilies() {
  const recentFamilies = [
    {
      id: 1,
      name: "Gia phả họ Nguyễn",
      origin: "Hà Nam",
      members: 156,
      lastUpdated: "15/03/2025",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Gia phả họ Trần",
      origin: "Nam Định",
      members: 98,
      lastUpdated: "12/03/2025",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Gia phả họ Lê",
      origin: "Thanh Hóa",
      members: 124,
      lastUpdated: "10/03/2025",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-8">
      {recentFamilies.map((family) => (
        <Link href={`/family/${family.id}`} key={family.id}>
          <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
            <div className="relative h-48 w-full">
              <Image src={family.image || "/placeholder.svg"} alt={family.name} fill className="object-cover" />
              <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Mới cập nhật</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-bold">{family.name}</h3>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Xuất đinh: {family.origin}</span>
              </div>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{family.members} thành viên</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3 mr-1" />
                <span>Cập nhật: {family.lastUpdated}</span>
              </div>
              <span className="text-xs font-medium text-primary">Xem chi tiết →</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

