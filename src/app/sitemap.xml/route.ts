import {
  ayarlar, firmaBul, ilceler, iller, kategoriFirmalari, kategoriler,
} from '@/lib/veri'
import { yonetimIstemcisi } from '@/lib/supabase'
import { uFirma, uIl, uIlce, uKat } from '@/lib/url'

export const dynamic = 'force-dynamic'

export async function GET() {
  const a = await ayarlar()
  const D = (a.domain || '').replace(/\/+$/, '')

  const kac = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

  const satirlar: string[] = []
  const ekle = (yol: string, oncelik: string) => {
    satirlar.push(
      `<url><loc>${kac(D + yol)}</loc><changefreq>weekly</changefreq><priority>${oncelik}</priority></url>`)
  }

  ekle('/', '1.0')

  const [ilListe, katListe] = await Promise.all([iller(), kategoriler()])

  for (const il of ilListe) {
    ekle(uIl(il), '0.9')

    for (const k of katListe) {
      if ((await kategoriFirmalari(k.id, il.id)).length) ekle(uKat(il, k), '0.8')
    }

    for (const i of await ilceler(il.id)) {
      ekle(uIlce(il, i), '0.8')
      for (const k of katListe) {
        if ((await kategoriFirmalari(k.id, il.id, i.id)).length) ekle(uKat(il, k, i), '0.7')
      }
    }
  }

  // Tum aktif firmalar
  const db = yonetimIstemcisi()
  const { data: firmalar } = await db.from('firmalar').select('slug')
    .eq('aktif', true).order('id')
  for (const f of firmalar ?? []) ekle(uFirma(f), '0.7')

  // Panelden eklenen statik sayfalar
  const { data: sayfalar } = await db.from('sayfalar').select('slug')
    .eq('aktif', true).order('sira')
  for (const s of sayfalar ?? []) ekle(`/${s.slug}`, '0.5')

  ekle('/firma-ekle', '0.5')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${satirlar.join('')}</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
