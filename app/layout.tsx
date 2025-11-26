import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/hooks/use-toast'

export const metadata: Metadata = {
  title: 'Dubboard - Personal Dashboard',
  description: 'Self-hosted personal dashboard with Weather, Calendar, and To-Do List',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
