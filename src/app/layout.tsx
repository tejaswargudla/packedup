import type { Metadata } from 'next'
import { Playfair_Display, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'PackedUp — Plan Trips Together',
  description: 'One shared space where your group suggests, votes, and decides — without the group chat chaos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${jetbrains.variable} ${jakarta.variable} bg-bg text-offwhite antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
