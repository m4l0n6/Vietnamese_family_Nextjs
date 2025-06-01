import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { BookOpen, Home, Info, Menu, Search, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  return (
    <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b w-full">
      <div className="flex items-center h-16 container">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="md:hidden hover:bg-transparent focus-visible:bg-transparent mr-2 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base hover:text-accent-foreground"
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav />
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <BookOpen className="w-6 h-6" />
          <span className="inline-block font-bold">Gia Phả Việt Nam</span>
        </Link>
        <div className="hidden md:flex">
          <DesktopNav />
        </div>
        <div className="flex flex-1 justify-end items-center space-x-2">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
              <span className="sr-only">Tìm kiếm</span>
            </Button>
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hidden md:inline-flex">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button className="hidden md:inline-flex">Đăng ký</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function DesktopNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Trang chủ
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Khám phá</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="gap-3 grid lg:grid-cols-2 p-4 md:w-[400px] lg:w-[500px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex flex-col justify-end bg-gradient-to-b from-muted/50 to-muted focus:shadow-md p-6 rounded-md outline-none w-full h-full no-underline select-none"
                    href="/explore"
                  >
                    <Users className="w-6 h-6" />
                    <div className="mt-4 mb-2 font-medium text-lg">
                      Gia phả nổi bật
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Khám phá các gia phả nổi bật và phổ biến nhất
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/explore/recent" title="Mới cập nhật">
                Các gia phả mới được tạo và cập nhật gần đây
              </ListItem>
              <ListItem href="/explore/origins" title="Xuất đinh">
                Tìm kiếm theo nguồn gốc xuất phát của dòng họ
              </ListItem>
              <ListItem href="/explore/map" title="Bản đồ">
                Xem phân bố các dòng họ trên bản đồ Việt Nam
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Hướng dẫn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="gap-3 grid md:grid-cols-2 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
              <ListItem href="/guides/getting-started" title="Bắt đầu">
                Hướng dẫn cơ bản để bắt đầu xây dựng gia phả
              </ListItem>
              <ListItem href="/guides/adding-members" title="Thêm thành viên">
                Cách thêm và quản lý thông tin thành viên gia đình
              </ListItem>
              <ListItem href="/guides/documents" title="Tài liệu">
                Lưu trữ và quản lý tài liệu, hình ảnh gia đình
              </ListItem>
              <ListItem href="/guides/sharing" title="Chia sẻ">
                Mời và cộng tác với các thành viên khác
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Giới thiệu
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNav() {
  return (
    <div className="gap-2 grid py-6">
      <Link
        href="/"
        className="flex items-center gap-2 px-2 py-1 font-semibold text-lg"
      >
        <Home className="w-5 h-5" />
        <span>Trang chủ</span>
      </Link>
      <div className="px-2 py-4">
        <h4 className="mb-2 font-semibold text-sm">Khám phá</h4>
        <div className="grid grid-flow-row auto-rows-max text-sm">
          <Link
            href="/explore"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <Users className="mr-2 w-4 h-4" />
            <span>Gia phả nổi bật</span>
          </Link>
          <Link
            href="/explore/recent"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <span>Mới cập nhật</span>
          </Link>
          <Link
            href="/explore/origins"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <span>Xuất đinh</span>
          </Link>
          <Link
            href="/explore/map"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <span>Bản đồ</span>
          </Link>
        </div>
      </div>
      <div className="px-2 py-4">
        <h4 className="mb-2 font-semibold text-sm">Hướng dẫn</h4>
        <div className="grid grid-flow-row auto-rows-max text-sm">
          <Link
            href="/guides/getting-started"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <span>Bắt đầu</span>
          </Link>
          <Link
            href="/guides/adding-members"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <span>Thêm thành viên</span>
          </Link>
          <Link
            href="/guides/documents"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <span>Tài liệu</span>
          </Link>
          <Link
            href="/guides/sharing"
            className="group flex items-center hover:bg-muted px-2 py-2 rounded-md w-full"
          >
            <span>Chia sẻ</span>
          </Link>
        </div>
      </div>
      <Link
        href="/about"
        className="flex items-center gap-2 px-2 py-1 font-semibold text-lg"
      >
        <Info className="w-5 h-5" />
        <span>Giới thiệu</span>
      </Link>
      <div className="mt-4 px-2">
        <Link href="/login">
          <Button variant="outline" className="mb-2 w-full">
            Đăng nhập
          </Button>
        </Link>
        <Link href="/register">
          <Button className="w-full">Đăng ký</Button>
        </Link>
      </div>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="font-medium text-sm leading-none">{title}</div>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
