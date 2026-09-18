import type { Metadata } from 'next'
import { ayarlar } from './veri'
import { gorselUrl } from './supabase'

/** PHP'deki sayfa_bas() head bolumunun Next.js Metadata karsiligi. */
export async function sayfaMeta({
  baslik, aciklama, yol, canonical, ogGorsel,
}: {
  baslik: string; aciklama: string; yol: string
  canonical?: string | null; ogGorsel?: string | null
}): Promise<Metadata> {
  const a = await ayarlar()
  const D = (a.domain || '').replace(/\/+$/, '')
  const gorsel = gorselUrl(ogGorsel || a.og_gorsel)
  const adres = canonical || D + yol

  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: adres },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: 'website',
      siteName: a.site_adi,
      title: baslik,
      description: aciklama,
      url: D + yol,
      locale: 'tr_TR',
      images: gorsel ? [gorsel] : undefined,
    },
    twitter: {
      card: gorsel ? 'summary_large_image' : 'summary',
      title: baslik,
      description: aciklama,
      images: gorsel ? [gorsel] : undefined,
    },
    icons: { icon: gorselUrl(a.favicon) || '/assets/favicon.svg' },
  }
}
