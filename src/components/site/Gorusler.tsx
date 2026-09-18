import { ayarlar } from '@/lib/veri'
import type { Yorum } from '@/lib/tipler'
import { Yildiz } from './Yildiz'

/** Ana sayfadaki musteri gorusleri + Organization/AggregateRating yapisal verisi. */
export async function Gorusler({ liste, baslik, metin }: {
  liste: Yorum[]; baslik: string; metin?: string
}) {
  if (!liste.length) return null
  const a = await ayarlar()

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: a.site_adi,
    url: (a.domain || '').replace(/\/+$/, '') + '/',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Math.round((liste.reduce((t, g) => t + g.puan, 0) / liste.length) * 10) / 10,
      reviewCount: liste.length,
      bestRating: 5,
    },
    review: liste.map((g) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: g.isim },
      datePublished: g.tarih,
      reviewBody: g.yorum,
      reviewRating: { '@type': 'Rating', ratingValue: g.puan, bestRating: 5 },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="bolum">
        <div className="kap">
          <div className="bolum-bas">
            <div className="koli-cizgi" />
            <h2>{baslik}</h2>
            {metin && <p>{metin}</p>}
          </div>
          <div className="gorusler">
            {liste.slice(0, 6).map((g) => (
              <div className="gorus" key={g.id}>
                <Yildiz puan={g.puan} />
                <p>{g.yorum}</p>
                <footer><b>{g.isim}</b> — {g.ilce}</footer>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
