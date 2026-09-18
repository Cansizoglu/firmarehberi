import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  ayarlar, firmaBul, firmaKategorileri, firmaPuan, galeri, ilBul,
  ilceFirmalari, yorumlar,
} from '@/lib/veri'
import { gorselUrl } from '@/lib/supabase'
import { haritaEmbed, haritaLink, mono, telefonLink, uFirma, uIl, uIlce, uKat, wpLink } from '@/lib/url'
import { sayfaMeta } from '@/lib/meta'
import { SiteKabuk } from '@/components/site/SiteKabuk'
import { TeklifFormu } from '@/components/site/TeklifFormu'
import { FirmaKart } from '@/components/site/FirmaKart'
import { PuanSatir } from '@/components/site/PuanSatir'
import { Yildiz } from '@/components/site/Yildiz'
import { YorumFormu } from '@/components/site/YorumFormu'

export const dynamic = 'force-dynamic'

type Props = { params: { slug: string } }

/** Adresler /firma/xxx.html seklinde — uzantiyi kirp. */
const cozSlug = (s: string) => decodeURIComponent(s).replace(/\.html$/, '')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await firmaBul(cozSlug(params.slug))
  if (!f) return {}
  const g = await galeri(f.id)
  return sayfaMeta({
    baslik: `${f.ad} | ${f.ilce_ad} ${f.il_ad} — Telefon, Adres ve Yorumlar`,
    aciklama: `${f.ad} iletişim bilgileri. ${f.mahalle}, ${f.ilce_ad} / ${f.il_ad}. Telefon ${f.tel}. Ücretsiz teklif alın.`,
    yol: uFirma(f),
    canonical: f.canonical,
    ogGorsel: g[0]?.dosya ?? null,
  })
}

export default async function FirmaSayfasi({ params }: Props) {
  const f = await firmaBul(cozSlug(params.slug))
  if (!f) notFound()

  const a = await ayarlar()
  const D = (a.domain || '').replace(/\/+$/, '')

  const [il, kats, gal, yor, [ort, adet]] = await Promise.all([
    f.il_slug ? ilBul(f.il_slug) : Promise.resolve(null),
    firmaKategorileri(f.id),
    galeri(f.id),
    yorumlar(f.id),
    firmaPuan(f.id),
  ])

  const benzer = f.ilce_id
    ? (await ilceFirmalari(f.ilce_id)).filter((x) => x.id !== f.id).slice(0, 3)
    : []

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: f.ad,
    '@id': D + uFirma(f),
    url: D + uFirma(f),
    telephone: telefonLink(f.tel),
    areaServed: { '@type': 'City', name: f.il_ad },
    address: {
      '@type': 'PostalAddress', streetAddress: f.adres,
      addressLocality: f.ilce_ad, addressRegion: f.il_ad, addressCountry: 'TR',
    },
    makesOffer: kats.map((k) => ({
      '@type': 'Offer', itemOffered: { '@type': 'Service', name: k.ad },
    })),
  }
  if (f.enlem && f.boylam) {
    ld.geo = { '@type': 'GeoCoordinates', latitude: Number(f.enlem), longitude: Number(f.boylam) }
  }
  if (gal.length) ld.image = gal.map((g) => gorselUrl(g.dosya)).filter(Boolean)
  if (f.web) ld.sameAs = [f.web]
  if (yor.length) {
    ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: ort, reviewCount: adet, bestRating: 5 }
    ld.review = yor.map((y) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: y.isim },
      datePublished: y.tarih,
      reviewBody: y.yorum,
      reviewRating: { '@type': 'Rating', ratingValue: y.puan, bestRating: 5 },
    }))
  }

  return (
    <SiteKabuk il={il} yol={uFirma(f)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="firma-hero"><div className="kap">
        <div>
          <nav className="kirinti">
            <a href="/">Ana sayfa</a>
            {il && <> / <a href={uIl(il)}>{f.il_ad}</a></>}
            {il && f.ilce_slug && <> / <a href={`/${f.il_slug}/${f.ilce_slug}/`}>{f.ilce_ad}</a></>}
            {' '}/ {f.ad}
          </nav>

          <div className="fh-ust">
            <span className="mono" aria-hidden="true">{mono(f.ad)}</span>
            <div>
              <h1 style={{ fontSize: '2rem' }}>{f.ad}</h1>
              <p className="adres" style={{ margin: '6px 0 0' }}>
                {f.mahalle} — {f.ilce_ad} / {f.il_ad}
              </p>
              <PuanSatir firma={f} />
            </div>
          </div>

          <div className="etiketler" style={{ marginTop: 16 }}>
            {kats.map((k) => (
              <a className="etiket" href={il ? uKat(il, k) : '#'} key={k.id}>{k.ad}</a>
            ))}
          </div>

          <table className="bilgi-tablo">
            <tbody>
              <tr><th>Telefon</th><td>
                <a href={`tel:${telefonLink(f.tel)}`}>{f.tel}</a>
                {f.tel2 && <><br /><a href={`tel:${telefonLink(f.tel2)}`}>{f.tel2}</a></>}
              </td></tr>
              <tr><th>Adres</th><td>
                {f.adres}<br />{f.mahalle} Mah. — {f.ilce_ad} / {f.il_ad}
              </td></tr>
              {f.eposta && (
                <tr><th>E-posta</th><td><a href={`mailto:${f.eposta}`}>{f.eposta}</a></td></tr>
              )}
              {f.web && (
                <tr><th>Web sitesi</th><td>
                  <a href={f.web} target="_blank" rel="noopener nofollow">
                    {f.web.replace(/^https?:\/\//, '')}
                  </a>
                </td></tr>
              )}
              <tr><th>Hizmetler</th><td>{kats.map((k) => k.ad).join(', ')}</td></tr>
              <tr><th>Harita</th><td>
                <a href={haritaLink(f)} target="_blank" rel="noopener nofollow">Google Haritalar&apos;da aç</a>
              </td></tr>
            </tbody>
          </table>

          <div className="fh-butonlar">
            <a className="btn btn-ara" href={`tel:${telefonLink(f.tel)}`}>Hemen Ara: {f.tel}</a>
            <a className="btn btn-wp" href={wpLink(f.tel, a.site_adi)} target="_blank" rel="noopener">
              WhatsApp&apos;tan Yaz
            </a>
            <a className="btn btn-harita" href={haritaLink(f)} target="_blank" rel="noopener nofollow">
              Yol Tarifi Al
            </a>
          </div>
        </div>

        <TeklifFormu
          baslik="Bu Firmadan Teklif Alın"
          aciklama={`Formu doldurun, talebiniz ${f.ilce_ad} bölgesindeki firmalara iletilsin.`}
          firma={f.ad}
        />
      </div></section>

      {gal.length > 0 && (
        <section className="bolum"><div className="kap">
          <div className="bolum-bas"><div className="koli-cizgi" /><h2>Firma galerisi</h2></div>
          <div className="galeri">
            {gal.map((g) => (
              <a className="gal-oge" href={gorselUrl(g.dosya)!} target="_blank" rel="noopener" key={g.id}>
                <img src={gorselUrl(g.dosya)!} alt={g.alt_yazi || f.ad} loading="lazy" />
              </a>
            ))}
          </div>
        </div></section>
      )}

      <section className="bolum"><div className="kap">
        <div className="bolum-bas"><div className="koli-cizgi" />
          <h2>Konum ve ulaşım</h2>
          <p>{f.adres}, {f.mahalle} — {f.ilce_ad} / {f.il_ad}</p>
        </div>
        <div className="harita-kutu">
          <iframe src={haritaEmbed(f)} loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${f.ad} konumu`} allowFullScreen />
        </div>
        <p style={{ marginTop: 12 }}>
          <a className="btn btn-harita" href={haritaLink(f)} target="_blank" rel="noopener nofollow">
            Google Haritalar&apos;da aç
          </a>
        </p>
      </div></section>

      <section className="bolum"><div className="kap">
        <div className="bolum-bas"><div className="koli-cizgi" /><h2>Yorumlar ve değerlendirmeler</h2></div>

        {yor.length > 0 ? (
          <>
            <div className="puan-satir" style={{ marginBottom: 18 }}>
              <Yildiz puan={ort} buyuk /><b>{ort}</b><span>{adet} yorum</span>
            </div>
            <div className="yorumlar">
              {yor.map((y) => (
                <div className="yorum" key={y.id}>
                  <div className="yorum-ust">
                    <span className="yorum-ad">{y.isim}</span>
                    <span className="yorum-tarih">{y.tarih}</span>
                  </div>
                  <Yildiz puan={y.puan} />
                  <p>{y.yorum}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="yorum-yok">Bu firma için henüz yorum yapılmamış. İlk yorumu siz yazın.</div>
        )}

        <YorumFormu firmaId={f.id} geri={uFirma(f)} />
      </div></section>

      <section className="bolum"><div className="kap"><div className="metin">
        <h2>{f.ad} hakkında</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{f.aciklama}</p>
        <p>
          Fiyat bilgisi almadan önce evinizin oda sayısını, çıkış ve varış katını, binada
          asansör olup olmadığını hazır tutun. Sağlıklı bir fiyat için firmanın eve gelip
          ekspertiz yapmasını isteyin.
        </p>
      </div></div></section>

      {benzer.length > 0 && (
        <section className="bolum"><div className="kap">
          <div className="bolum-bas"><div className="koli-cizgi" />
            <h2>{f.ilce_ad} bölgesindeki diğer firmalar</h2>
          </div>
          <div className="firmalar">
            {benzer.map((x) => <FirmaKart firma={x} key={x.id} />)}
          </div>
        </div></section>
      )}
    </SiteKabuk>
  )
}
