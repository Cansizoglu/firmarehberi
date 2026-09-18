import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ilBul, ilceBul, kategoriBul } from '@/lib/veri'
import { sayfaMeta } from '@/lib/meta'
import { KategoriSayfasi } from '@/components/site/KategoriSayfasi'

export const dynamic = 'force-dynamic'

type Props = { params: { a: string; b: string; c: string } }

async function coz({ a, b, c }: { a: string; b: string; c: string }) {
  const il = await ilBul(a)
  if (!il) return null
  const ilce = await ilceBul(il.id, b)
  if (!ilce) return null
  const kat = await kategoriBul(c)
  if (!kat) return null
  return { il, ilce, kat }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await coz(params)
  if (!r) return {}
  const baslik = `${r.ilce.ad} ${r.kat.ad} Firmaları`
  return sayfaMeta({
    baslik,
    aciklama: `${r.ilce.ad} bölgesinde ${r.kat.ad.toLocaleLowerCase('tr')} hizmeti veren firmalar. Telefon, adres ve ücretsiz teklif.`,
    yol: `/${r.il.slug}/${r.ilce.slug}/${r.kat.slug}/`,
    canonical: r.kat.canonical,
    ogGorsel: r.kat.gorsel,
  })
}

export default async function IlceKategori({ params }: Props) {
  const r = await coz(params)
  if (!r) notFound()
  return <KategoriSayfasi il={r.il} ilce={r.ilce} kat={r.kat} />
}
