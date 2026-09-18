import type { Metadata } from 'next'
import { ayarlar } from '@/lib/veri'
import { eksikDegiskenler } from '@/lib/ortam'
import KurulumUyarisi from '@/components/site/KurulumUyarisi'

// Admin panelden yapilan degisiklikler aninda yansisin
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  // Ortam degiskenleri eksikken ayarlar() Supabase'e baglanamaz ve hata firlatir
  if (eksikDegiskenler().length) return { title: 'Kurulum tamamlanmadı', robots: { index: false } }

  const a = await ayarlar()
  return {
    title: { default: a.meta_baslik || a.site_adi || 'Nakliyat Rehberi', template: '%s' },
    description: a.meta_aciklama || '',
    metadataBase: a.domain ? new URL(a.domain) : undefined,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const eksik = eksikDegiskenler()
  if (eksik.length) {
    return (
      <html lang="tr">
        <head><meta name="robots" content="noindex" /></head>
        <body><KurulumUyarisi eksik={eksik} /></body>
      </html>
    )
  }

  const a = await ayarlar()

  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/style.css" />
        {a.yapisal_veri && <div dangerouslySetInnerHTML={{ __html: a.yapisal_veri }} />}
        {a.ozel_head && <div dangerouslySetInnerHTML={{ __html: a.ozel_head }} />}
      </head>
      <body>
        {children}
        <script src="/assets/site.js" defer />
      </body>
    </html>
  )
}
