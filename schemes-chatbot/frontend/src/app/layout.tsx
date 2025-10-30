import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PostHogProvider } from "@/providers/PostHogProvider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BharatSetu AI Assistant - MSME Government Schemes",
  description: "Get expert guidance on Indian MSME government schemes, subsidies, and incentives with BharatSetu's AI assistant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}