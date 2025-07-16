"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Dùng thử",
    price: "0",
    originalPrice: null,
    duration: "VND",
    color: "bg-gray-50",
    popular: false,
    features: ["30 thành viên lưu trữ", "Sử dụng 30 ngày", "1 quản trị", "0 MB dung lượng album", "Cây phả đồ"],
  },
  {
    name: "300 Thành viên",
    price: "1.100.000",
    originalPrice: "2.000.000",
    duration: "VND",
    color: "bg-orange-50",
    popular: false,
    features: [
      "300 thành viên lưu trữ",
      "Sử dụng 12 tháng",
      "3 quản trị viên",
      "2000 MB cho dung lượng",
      "Phả đồ, sự kiện,...",
      "Có thể mua thêm thành viên lẻ từ 100 thành viên",
      "Có thể mua thêm dung lượng từ 1000 MB",
      "Trang chủ đồng họ",
    ],
  },
  {
    name: "500 Thành viên",
    price: "1.300.000",
    originalPrice: "2.500.000",
    duration: "VND",
    color: "bg-green-50",
    popular: true,
    features: [
      "500 thành viên lưu trữ",
      "Sử dụng 12 tháng",
      "5 quản trị viên",
      "2000 MB cho dung lượng",
      "Phả đồ, sự kiện,...",
      "Có thể mua thêm thành viên lẻ từ 100 thành viên",
      "Có thể mua thêm dung lượng từ 1000 MB",
      "Trang chủ đồng họ",
    ],
  },
  {
    name: "1000 Thành viên",
    price: "1.800.000",
    originalPrice: "3.000.000",
    duration: "VND",
    color: "bg-red-50",
    popular: false,
    features: [
      "1000 thành viên lưu trữ",
      "Sử dụng 12 tháng",
      "5 quản trị viên",
      "2000 MB cho dung lượng",
      "Phả đồ, sự kiện,...",
      "Có thể mua thêm thành viên lẻ từ 100 thành viên",
      "Có thể mua thêm dung lượng từ 1000 MB",
      "Trang chủ đồng họ",
    ],
  },
  {
    name: "Không giới hạn TV",
    price: "2.990.000",
    originalPrice: "6.000.000",
    duration: "VND",
    color: "bg-purple-50",
    popular: false,
    features: [
      "Không giới hạn thành viên lưu trữ",
      "Sử dụng 12 tháng",
      "5 quản trị viên",
      "2000 MB cho dung lượng",
      "Phả đồ, sự kiện,...",
      "Có thể mua thêm dung lượng từ 1000 MB",
      "Trang chủ đồng họ",
    ],
  },
]

export function PricingSection() {
  return (
    <section className="py-12 md:py-24 lg:py-32 w-full">
      <div className="px-4 md:px-6 container">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tighter">
              Chọn gói phù hợp với gia đình bạn
            </h2>
            <p className="max-w-[900px] text-muted-foreground lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
              Các gói dịch vụ linh hoạt để quản lý gia phả từ nhỏ đến lớn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.color} border-2 ${plan.popular ? "border-primary shadow-lg scale-105" : "border-gray-200"} transition-all duration-300 hover:shadow-lg`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Phổ biến nhất
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-bold mb-2">{plan.name}</CardTitle>

                <div className="space-y-1">
                  {plan.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">giá gốc {plan.originalPrice} VND</p>
                  )}
                  <div className="flex items-baseline justify-center">
                    <span className="text-sm text-muted-foreground mr-1">{plan.duration}</span>
                    <span
                      className={`font-bold ${plan.name === "Dùng thử" ? "text-4xl text-orange-500" : "text-2xl text-blue-600"}`}
                    >
                      {plan.name === "Dùng thử" ? "0" : plan.price}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link href={plan.name === "Dùng thử" ? "/register" : "/register"}>
                    <Button
                      className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/80"}`}
                      variant={plan.popular ? "default" : "secondary"}
                    >
                      {plan.name === "Dùng thử" ? "Đăng ký" : "Chọn gói"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Cần tư vấn thêm? Liên hệ với chúng tôi</p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Liên hệ tư vấn
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
