import type { Metadata } from 'next'
import './globals.css'
import '../styles/custom.css';


export const metadata: Metadata = {
  title: 'appqa.paolozada',
  description: 'Created by paolozada.com whit help to IA V0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
