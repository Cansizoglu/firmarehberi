import type { Firma, Il, Ilce, Kategori } from './tipler'

/** PHP surumundeki u_* fonksiyonlarinin birebir karsiligi — adresler degismiyor. */
export const uIl   = (il: Pick<Il, 'slug'>) => `/${il.slug}/`
export const uIlce = (il: Pick<Il, 'slug'>, ilce: Pick<Ilce, 'slug'>) => `/${il.slug}/${ilce.slug}/`
export const uKat  = (il: Pick<Il, 'slug'>, kat: Pick<Kategori, 'slug'>, ilce?: Pick<Ilce, 'slug'> | null) =>
  `/${il.slug}/${ilce ? ilce.slug + '/' : ''}${kat.slug}/`
export const uFirma = (f: Pick<Firma, 'slug'>) => `/firma/${f.slug}.html`

export function telefonLink(t: string | null | undefined) {
  if (!t) return ''
  return '+9' + t.replace(/\s+/g, '')
}

export function wpLink(t: string | null | undefined, siteAdi: string) {
  if (!t) return ''
  const metin = `Merhaba, ${siteAdi} üzerinden ulaşıyorum. Fiyat almak istiyorum.`
  return `https://wa.me/9${t.replace(/\s+/g, '')}?text=${encodeURIComponent(metin)}`
}

type HaritaGirdi = {
  harita_link?: string | null; place_id?: string | null
  ad?: string | null; adres?: string | null; ilce_ad?: string | null
  enlem?: number | null; boylam?: number | null
}

export function haritaLink(f: HaritaGirdi) {
  if (f.harita_link) return f.harita_link
  if (f.place_id) return `https://www.google.com/maps/place/?q=place_id:${f.place_id}`
  const q = [f.ad, f.adres, f.ilce_ad, 'Adana'].filter(Boolean).join(' ').trim()
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

export function haritaEmbed(f: HaritaGirdi) {
  const q = f.enlem && f.boylam
    ? `${f.enlem},${f.boylam}`
    : [f.ad, f.adres, f.ilce_ad, 'Adana'].filter(Boolean).join(' ').trim()
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=tr&z=15&output=embed`
}

/** Firma adindan iki harfli monogram — PHP'deki mono(). */
export function mono(ad: string) {
  const atla = ['adana', 'öz', 've', 'm.', '']
  for (const x of ad.replace(/-/g, ' ').split(/\s+/)) {
    if (!atla.includes(x.toLocaleLowerCase('tr'))) return x.slice(0, 2).toLocaleUpperCase('tr')
  }
  return ad.slice(0, 2).toLocaleUpperCase('tr')
}

/** Turkce karakterleri sadelestirip slug uretir — PHP'deki slugla(). */
export function slugla(s: string) {
  const tr: Record<string, string> = {
    'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u',
    'Ç':'c','Ğ':'g','İ':'i','I':'i','Ö':'o','Ş':'s','Ü':'u',
  }
  return s.replace(/[çğıöşüÇĞİIÖŞÜ]/g, (c) => tr[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180)
}
