import { cache } from 'react'
import { yonetimIstemcisi, gorselUrl } from './supabase'
import type {
  Ayarlar, Banner, BannerKonum, Firma, FirmaGenis, Galeri,
  Il, Ilce, Kategori, Sayfa, Sss, Yorum,
} from './tipler'

/** PHP'deki firma_sorgu SELECT'inin karsiligi: firma + il/ilce adlari. */
const FIRMA_ALAN = '*, ilceler(ad, slug), iller(ad, slug)'

/** Join'li satiri PHP'nin duz sekline cevirir (ilce_ad, il_slug ...). */
function duzlestir(r: any): FirmaGenis {
  const { ilceler, iller, ...f } = r
  return {
    ...f,
    ilce_ad: ilceler?.ad ?? null,
    ilce_slug: ilceler?.slug ?? null,
    il_ad: iller?.ad ?? null,
    il_slug: iller?.slug ?? null,
  }
}

/** PHP: ORDER BY FIELD(paket,'gold','plus','standart'), one_cikan DESC, sira, id */
function firmaSirala<T extends { order: Function }>(q: T): T {
  return (q as any)
    .order('paket_sira', { ascending: true })
    .order('one_cikan', { ascending: false })
    .order('sira', { ascending: true })
    .order('id', { ascending: true })
}

// ---------------------------------------------------------------- ayarlar

/** Tum ayarlar tek sorguda; istek boyunca tekrar kullanilir (PHP'deki static $a). */
export const ayarlar = cache(async (): Promise<Ayarlar> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('ayarlar').select('anahtar, deger')
  if (error) throw error
  const a: Ayarlar = {}
  for (const r of data ?? []) a[r.anahtar] = r.deger ?? ''
  return a
})

export async function ayar(k: string, varsayilan = ''): Promise<string> {
  const a = await ayarlar()
  return a[k] ?? varsayilan
}

// ---------------------------------------------------------------- il / ilce / kategori

export const iller = cache(async (): Promise<Il[]> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('iller').select('*')
    .eq('aktif', true).order('sira').order('ad')
  if (error) throw error
  return (data ?? []) as Il[]
})

export const ilBul = cache(async (slug: string): Promise<Il | null> => {
  const db = yonetimIstemcisi()
  const { data } = await db.from('iller').select('*')
    .eq('slug', slug).eq('aktif', true).maybeSingle()
  return (data as Il) ?? null
})

/** Varsayilan il — PHP'de ayar('varsayilan_il','adana'). Yoksa ilk il. */
export const varsayilanIl = cache(async (): Promise<Il | null> => {
  const il = await ilBul(await ayar('varsayilan_il', 'adana'))
  if (il) return il
  const hepsi = await iller()
  return hepsi[0] ?? null
})

export const ilceler = cache(async (ilId: number): Promise<Ilce[]> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('ilceler').select('*')
    .eq('il_id', ilId).eq('aktif', true).order('sira').order('ad')
  if (error) throw error
  return (data ?? []) as Ilce[]
})

export const ilceBul = cache(async (ilId: number, slug: string): Promise<Ilce | null> => {
  const db = yonetimIstemcisi()
  const { data } = await db.from('ilceler').select('*')
    .eq('il_id', ilId).eq('slug', slug).eq('aktif', true).maybeSingle()
  return (data as Ilce) ?? null
})

export const kategoriler = cache(async (): Promise<Kategori[]> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('kategoriler').select('*')
    .eq('aktif', true).order('sira').order('ad')
  if (error) throw error
  return (data ?? []) as Kategori[]
})

export const kategoriBul = cache(async (slug: string): Promise<Kategori | null> => {
  const db = yonetimIstemcisi()
  const { data } = await db.from('kategoriler').select('*')
    .eq('slug', slug).eq('aktif', true).maybeSingle()
  return (data as Kategori) ?? null
})

// ---------------------------------------------------------------- firmalar

export const ilFirmalari = cache(async (ilId: number): Promise<FirmaGenis[]> => {
  const db = yonetimIstemcisi()
  const { data, error } = await firmaSirala(
    db.from('firmalar').select(FIRMA_ALAN).eq('aktif', true).eq('il_id', ilId))
  if (error) throw error
  return (data ?? []).map(duzlestir)
})

export const ilceFirmalari = cache(async (ilceId: number): Promise<FirmaGenis[]> => {
  const db = yonetimIstemcisi()
  const { data, error } = await firmaSirala(
    db.from('firmalar').select(FIRMA_ALAN).eq('aktif', true).eq('ilce_id', ilceId))
  if (error) throw error
  return (data ?? []).map(duzlestir)
})

/** PHP: kategori_firmalari($kat_id, $il_id, $ilce_id) */
export const kategoriFirmalari = cache(async (
  katId: number, ilId?: number | null, ilceId?: number | null,
): Promise<FirmaGenis[]> => {
  const db = yonetimIstemcisi()
  let q = db.from('firmalar')
    .select(`${FIRMA_ALAN}, firma_kategori!inner(kategori_id)`)
    .eq('aktif', true)
    .eq('firma_kategori.kategori_id', katId)
  if (ilId) q = q.eq('il_id', ilId)
  if (ilceId) q = q.eq('ilce_id', ilceId)
  const { data, error } = await firmaSirala(q)
  if (error) throw error
  return (data ?? []).map(({ firma_kategori, ...r }: any) => duzlestir(r))
})

export const firmaBul = cache(async (slug: string): Promise<FirmaGenis | null> => {
  const db = yonetimIstemcisi()
  const { data } = await db.from('firmalar').select(FIRMA_ALAN)
    .eq('slug', slug).eq('aktif', true).maybeSingle()
  return data ? duzlestir(data) : null
})

export const firmaKategorileri = cache(async (firmaId: number): Promise<Kategori[]> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('firma_kategori')
    .select('kategoriler!inner(*)')
    .eq('firma_id', firmaId)
    .eq('kategoriler.aktif', true)
  if (error) throw error
  return (data ?? [])
    .map((r: any) => r.kategoriler as Kategori)
    .sort((a, b) => a.sira - b.sira || a.ad.localeCompare(b.ad, 'tr'))
})

// ---------------------------------------------------------------- galeri / yorum

export const galeri = cache(async (firmaId: number): Promise<Galeri[]> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('galeri').select('*')
    .eq('firma_id', firmaId)
    .order('kapak', { ascending: false }).order('sira').order('id')
  if (error) throw error
  return (data ?? []) as Galeri[]
})

/** Firma kart gorseli: kapak isaretli, yoksa ilk gorsel. */
export const kapak = cache(async (firmaId: number): Promise<string | null> => {
  const g = await galeri(firmaId)
  return g.length ? gorselUrl(g[0].dosya) : null
})

export const yorumlar = cache(async (firmaId: number | null): Promise<Yorum[]> => {
  const db = yonetimIstemcisi()
  let q = db.from('yorumlar').select('*').eq('onayli', true)
  q = firmaId === null ? q.is('firma_id', null) : q.eq('firma_id', firmaId)
  const { data, error } = await q.order('tarih', { ascending: false }).order('id', { ascending: false })
  if (error) throw error
  return (data ?? []) as Yorum[]
})

/** Onayli yorumlardan ortalama puan ve adet — PHP'deki firma_puan(). */
export const firmaPuan = cache(async (firmaId: number): Promise<[number | null, number]> => {
  const y = await yorumlar(firmaId)
  if (!y.length) return [null, 0]
  const ort = y.reduce((t, x) => t + x.puan, 0) / y.length
  return [Math.round(ort * 10) / 10, y.length]
})

// ---------------------------------------------------------------- sss / banner / sayfa

export const sssGetir = cache(async (kapsam = 'genel', kapsamId?: number | null): Promise<Sss[]> => {
  const db = yonetimIstemcisi()
  let q = db.from('sss').select('*').eq('kapsam', kapsam).eq('aktif', true)
  q = kapsamId ? q.eq('kapsam_id', kapsamId) : q.is('kapsam_id', null)
  const { data, error } = await q.order('sira')
  if (error) throw error
  return (data ?? []) as Sss[]
})

/** Yayin tarihi gecerli olan tum bannerlar, konuma gore gruplu. */
export const bannerlar = cache(async (): Promise<Record<string, Banner[]>> => {
  const db = yonetimIstemcisi()
  const bugun = new Date().toISOString().slice(0, 10)
  const { data, error } = await db.from('bannerlar').select('*')
    .eq('aktif', true)
    .or(`baslangic.is.null,baslangic.lte.${bugun}`)
    .or(`bitis.is.null,bitis.gte.${bugun}`)
    .order('konum').order('sira').order('id')
  if (error) throw error
  const g: Record<string, Banner[]> = {}
  for (const b of (data ?? []) as Banner[]) (g[b.konum] ??= []).push(b)
  return g
})

export async function bannerKonum(konum: BannerKonum): Promise<Banner[]> {
  return (await bannerlar())[konum] ?? []
}

export const menuSayfalari = cache(async (): Promise<Pick<Sayfa, 'baslik' | 'slug'>[]> => {
  const db = yonetimIstemcisi()
  const { data } = await db.from('sayfalar').select('baslik, slug')
    .eq('aktif', true).eq('menude', true).order('sira').order('id')
  return data ?? []
})

export const footerSayfalari = cache(async (): Promise<Pick<Sayfa, 'baslik' | 'slug'>[]> => {
  const db = yonetimIstemcisi()
  const { data } = await db.from('sayfalar').select('baslik, slug')
    .eq('aktif', true).eq('footerda', true).order('sira').order('id')
  return data ?? []
})

export const sayfaBul = cache(async (slug: string): Promise<Sayfa | null> => {
  const db = yonetimIstemcisi()
  const { data } = await db.from('sayfalar').select('*')
    .eq('slug', slug).eq('aktif', true).maybeSingle()
  return (data as Sayfa) ?? null
})

// ---------------------------------------------------------------- sayimlar

/** Menu ve sidebar'daki firma sayilari — ilce_id -> adet. */
export const ilceSayilari = cache(async (ilId: number): Promise<Record<number, number>> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('firmalar').select('ilce_id')
    .eq('aktif', true).eq('il_id', ilId)
  if (error) throw error
  const s: Record<number, number> = {}
  for (const r of data ?? []) if (r.ilce_id) s[r.ilce_id] = (s[r.ilce_id] ?? 0) + 1
  return s
})

/** kategori_id -> o ildeki firma adedi. */
export const kategoriSayilari = cache(async (ilId: number): Promise<Record<number, number>> => {
  const db = yonetimIstemcisi()
  const { data, error } = await db.from('firma_kategori')
    .select('kategori_id, firmalar!inner(il_id, aktif)')
    .eq('firmalar.il_id', ilId).eq('firmalar.aktif', true)
  if (error) throw error
  const s: Record<number, number> = {}
  for (const r of (data ?? []) as any[]) s[r.kategori_id] = (s[r.kategori_id] ?? 0) + 1
  return s
})

/** Nakliyecilere acilmis talep sayisi. */
export const acikTalepSayisi = cache(async (): Promise<number> => {
  const db = yonetimIstemcisi()
  const { count } = await db.from('basvurular')
    .select('id', { count: 'exact', head: true }).eq('yayinda', true)
  return count ?? 0
})
