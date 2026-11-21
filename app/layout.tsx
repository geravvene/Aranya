import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ARANYA • Botanical Dispensary & Lounge Bangkok',
  description: 'Zero-overhead digital menu management platform designed for ARANYA Bangkok.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian text-cream min-h-screen">
        {children}
      </body>
    </html>
  )
}
