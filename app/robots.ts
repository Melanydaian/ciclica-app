import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.ciclica.pro'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/onboarding', '/api', '/preview', '/share', '/auth'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
