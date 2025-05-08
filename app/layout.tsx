import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import '@/styles/custom.css';
import "@/styles/app-responsive.css"
import "bootstrap-icons/font/bootstrap-icons.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "appqa.paolozada",
  description: "Created by paolozada.com whit help to IA V0",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
