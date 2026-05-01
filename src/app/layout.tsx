import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'System Design Mastery',
  description: '197 system design questions for AI and ML engineers — from beginner to advanced.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  )
}
