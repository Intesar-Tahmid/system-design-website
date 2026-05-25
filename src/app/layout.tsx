import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Engineering with Inte',
  description: 'Master AI Engineering — from system design and ML theory to NLP, deep learning, and production infrastructure. It covers a bit of everything, and that\'s the point.',
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
