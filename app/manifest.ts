import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cíclica — Tu ciclo en WhatsApp',
    short_name: 'Cíclica',
    description: 'Conocé tu cuerpo. Asistente de salud menstrual.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FFF9FB',
    theme_color: '#EC4899',
    orientation: 'portrait',
    icons: [
      { src: '/logoflor.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/logoflor.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logoflor.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['health', 'lifestyle', 'wellness'],
    lang: 'es-AR',
  }
}
