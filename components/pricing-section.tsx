"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Dùng thử",
    price: "0",
    originalPrice: null,
    duration: "VND",
    color: "bg-gray-50",
    popular: false,
    features: [
      "30 thành viên lưu trữ",
      "Sử dụng 30 ngày",
      "1 quản trị",
      "Cây phả đồ",
    ],
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
      "5 quản trị viên",
      "2000 MB cho dung lượng",
      "Phả đồ, sự kiện,...",
      "Có thể mua thêm dung lượng từ 1000 MB",
      "Trang chủ đồng họ",
    ],
  },
];

export function PricingSection() {
  return (
    <section className="py-12 md:py-24 lg:py-32 w-full">
      <div className="px-4 md:px-6 container">
        <div className="flex flex-col items-center space-y-4 mb-12 text-center">
          <div className="space-y-2">
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tighter">
              Chọn gói phù hợp với gia đình bạn
            </h2>
            <p className="max-w-[900px] text-muted-foreground lg:text-base/relaxed md:text-xl/relaxed xl:text-xl/relaxed">
              Các gói dịch vụ linh hoạt để quản lý gia phả từ nhỏ đến lớn
            </p>
          </div>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mx-auto max-w-7xl">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.color} border-2 ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-gray-200"
              } transition-all duration-300 hover:shadow-lg`}
            >
              {plan.popular && (
                <Badge className="-top-3 left-1/2 absolute bg-primary text-primary-foreground -translate-x-1/2 transform">
                  Phổ biến nhất
                </Badge>
              )}

              <CardHeader className="pb-4 text-center">
                <CardTitle className="mb-2 font-bold text-lg">
                  {plan.name}
                </CardTitle>

                <div className="space-y-1">
                  {plan.originalPrice && (
                    <p className="text-muted-foreground text-sm line-through">
                      giá gốc {plan.originalPrice} VND
                    </p>
                  )}
                  <div className="flex justify-center items-baseline">
                    <span
                      className={`font-bold ${
                        plan.name === "Dùng thử"
                          ? "text-4xl text-orange-500"
                          : "text-lg text-blue-600"
                      }`}
                    >
                      {plan.name === "Dùng thử" ? "0" : `${plan.price}/năm`}
                    </span>
                    <span className="mr-1 text-muted-foreground text-sm">
                      {plan.duration}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link
                    href={plan.name === "Dùng thử" ? "/register" : "/register"}
                  >
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                      variant={plan.popular ? "default" : "secondary"}
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Cần tư vấn thêm? Liên hệ với chúng tôi
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Liên hệ tư vấn
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
