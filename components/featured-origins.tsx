"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export function FeaturedOrigins() {
  const origins = [
    {
      id: 1,
      name: "Họ Nguyễn",
      location: "Hà Nam",
      description: "Một trong những dòng họ lớn nhất Việt Nam, có nguồn gốc từ thời Lý - Trần",
      count: 45,
      tags: ["Lịch sử", "Đông dân"],
    },
    {
      id: 2,
      name: "Họ Trần",
      location: "Nam Định",
      description: "Dòng họ có nhiều đóng góp trong lịch sử chống ngoại xâm của dân tộc",
      count: 32,
      tags: ["Hoàng tộc", "Lịch sử"],
    },
    {
      id: 3,
      name: "Họ Lê",
      location: "Thanh Hóa",
      description: "Dòng họ có nhiều nhân tài, đặc biệt trong thời kỳ nhà Lê",
      count: 28,
      tags: ["Hoàng tộc", "Văn hóa"],
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {origins.map((origin) => (
            <CarouselItem key={origin.id} className="basis-full md:basis-1/3 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>{origin.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center">
                        <span>{origin.location}</span>
                        <span className="mx-2">•</span>
                        <span>{origin.count} gia phả</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{origin.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {origin.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative static mr-2" />
          <CarouselNext className="relative static ml-2" />
        </div>
      </Carousel>
    </div>
  )
}
