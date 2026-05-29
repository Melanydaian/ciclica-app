import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.ciclica.pro'),
  title: { default: 'Cíclica — Tu ciclo en WhatsApp', template: '%s · Cíclica' },
  description: 'Tu asistente de salud menstrual. Registrá tu ciclo, síntomas y estado de ánimo chateando naturalmente con Cíclica por WhatsApp.',
  keywords: ['ciclo menstrual', 'salud femenina', 'whatsapp', 'tracking ciclo', 'menstruación', 'fertilidad', 'período'],
  authors: [{ name: 'Cíclica' }],
  icons: {
    icon: [
      { url: '/logoflor.svg', type: 'image/svg+xml' },
      { url: '/logoflor.png', type: 'image/png' },
    ],
    apple: '/logoflor.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: 'Cíclica',
    title: 'Cíclica — Tu ciclo en WhatsApp',
    description: 'Conocé tu cuerpo. Cíclica te ayuda a entender tu ciclo menstrual chateando por WhatsApp.',
    images: [{ url: '/logoflor.png', width: 1200, height: 630, alt: 'Cíclica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cíclica — Tu ciclo en WhatsApp',
    description: 'Conocé tu cuerpo. Tu asistente de salud menstrual.',
    images: ['/logoflor.png'],
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#FFF9FB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-[#FFF9FB]">{children}</body>
    </html>
  )
}
