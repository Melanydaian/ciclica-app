import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Cíclica — Tu ciclo en WhatsApp',
  description: 'Registrá tu ciclo, síntomas y estado de ánimo chateando naturalmente.',
  icons: {
    icon: [
      { url: '/logoflor.png', type: 'image/png' },
    ],
    apple: '/logoflor.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-[#FFF9FB]">{children}</body>
    </html>
  )
}
