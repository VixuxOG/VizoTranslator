import type { Metadata } from 'next'
import './styles/globals.css'

export const metadata: Metadata = {
  title: 'VizoTranslator - AI-Powered Translation',
  description: 'Professional AI-powered translation tool with 50+ languages support',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {children}
      </body>
    </html>
  )
}
