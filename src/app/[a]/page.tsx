import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ilBul, sayfaBul, varsayilanIl } from '@/lib/veri'
import { sayfaMeta } from '@/lib/meta'
import { IlSayfasi } from '@/components/site/IlSayfasi'
import { SiteKabuk } from '@/components/site/SiteKabuk'
import { YanSutun } from '@/components/site/YanSutun'
import { gorselUrl } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Props = { params: { a: string } }

/** PHP router gibi: once il, olmazsa panelden eklenen statik sayfa. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const il = await ilBul(params.a)
  if (il) {
    return sayfaMeta({
      baslik: il.baslik || `${il.ad} Evden Eve Nakliyat Firmaları`,
      aciklama: il.aciklama || `${il.ad} evden eve nakliyat firmaları rehberi.`,
      yol: `/${il.slug}/`,
      canonical: il.canonical,
      ogGorsel: il.gorsel,
    })
  }

  const s = await sayfaBul(params.a)
  if (!s) return {}
  return sayfaMeta({
    baslik: s.meta_baslik || s.baslik,
    aciklama: s.meta_aciklama || '',
    yol: `/${s.slug}`,
    canonical: s.canonical,
    ogGorsel: s.gorsel,
  })
}

export default async function IlVeyaSayfa({ params }: Props) {
  const il = await ilBul(params.a)
  if (il) return <IlSayfasi il={il} />

  const s = await sayfaBul(params.a)
  if (!s) notFound()

  return (
    <SiteKabuk il={await varsayilanIl()} yol={`/${s.slug}`}>
      <section className="bolum"><div className="kap"><div className="iki-kolon">
        <div className="metin icerik">
          <div className="koli-cizgi" />
          <h1>{s.baslik}</h1>
          {s.gorsel && <img className="sayfa-gorsel" src={gorselUrl(s.gorsel)!} alt={s.baslik} />}
          <div dangerouslySetInnerHTML={{ __html: s.icerik || '' }} />
        </div>
        <YanSutun il={await varsayilanIl()} />
      </div></div></section>
    </SiteKabuk>
  )
}
