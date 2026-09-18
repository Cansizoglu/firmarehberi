import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ayarlar, varsayilanIl } from '@/lib/veri'
import { sayfaMeta } from '@/lib/meta'
import { IlSayfasi } from '@/components/site/IlSayfasi'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const il = await varsayilanIl()
  const a = await ayarlar()
  if (!il) return {}
  return sayfaMeta({
    baslik: a.meta_baslik || il.baslik || `${il.ad} Evden Eve Nakliyat Firmaları`,
    aciklama: a.meta_aciklama || il.aciklama || `${il.ad} evden eve nakliyat firmaları rehberi.`,
    yol: '/',
    canonical: il.canonical,
    ogGorsel: il.gorsel,
  })
}

export default async function AnaSayfa() {
  const il = await varsayilanIl()
  if (!il) notFound()
  return <IlSayfasi il={il} anasayfa />
}
