import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ilBul, ilceBul, kategoriBul } from '@/lib/veri'
import { sayfaMeta } from '@/lib/meta'
import { IlceSayfasi } from '@/components/site/IlceSayfasi'
import { KategoriSayfasi } from '@/components/site/KategoriSayfasi'

export const dynamic = 'force-dynamic'

type Props = { params: { a: string; b: string } }

/** PHP router: /{il}/{b} — b once ilce, degilse kategori olarak denenir. */
async function coz({ a, b }: { a: string; b: string }) {
  const il = await ilBul(a)
  if (!il) return null
  const ilce = await ilceBul(il.id, b)
  if (ilce) return { il, ilce, kat: null }
  const kat = await kategoriBul(b)
  if (kat) return { il, ilce: null, kat }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await coz(params)
  if (!c) return {}
  const { il, ilce, kat } = c

  if (ilce) {
    return sayfaMeta({
      baslik: ilce.baslik || `${ilce.ad} Evden Eve Nakliyat Firmaları`,
      aciklama: ilce.aciklama || `${il.ad} ${ilce.ad} evden eve nakliyat firmaları listesi.`,
      yol: `/${il.slug}/${ilce.slug}/`,
      canonical: ilce.canonical,
      ogGorsel: ilce.gorsel,
    })
  }

  const baslik = `${il.ad} ${kat!.ad} Firmaları`
  return sayfaMeta({
    baslik,
    aciklama: `${il.ad} bölgesinde ${kat!.ad.toLocaleLowerCase('tr')} hizmeti veren firmalar. Telefon, adres ve ücretsiz teklif.`,
    yol: `/${il.slug}/${kat!.slug}/`,
    canonical: kat!.canonical,
    ogGorsel: kat!.gorsel,
  })
}

export default async function IlceVeyaKategori({ params }: Props) {
  const c = await coz(params)
  if (!c) notFound()
  return c.ilce
    ? <IlceSayfasi il={c.il} ilce={c.ilce} />
    : <KategoriSayfasi il={c.il} kat={c.kat!} />
}
