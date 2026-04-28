import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'PackedUp — Plan Trips Together',
  description: 'One shared space where your group suggests, votes, and decides — without the group chat chaos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmMono.variable} font-serif bg-bg text-offwhite antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
