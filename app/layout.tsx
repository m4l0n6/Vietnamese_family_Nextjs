import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import AuthProvider from "@/components/providers/session-provider"
import LayoutWrapper from "@/components/layout-wrapper"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

export const metadata = {
  title: "Gia Phả Việt Nam",
  description: "Xây dựng, lưu trữ và chia sẻ gia phả của bạn với công nghệ hiện đại",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
