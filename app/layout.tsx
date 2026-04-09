import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Litiqo — AI-Powered Legal Case Intelligence',
  description: 'Streamline your practice with intelligent case tracking, document automation, and seamless client collaboration.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
