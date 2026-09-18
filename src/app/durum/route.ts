import { GEREKLI_DEGISKENLER } from '@/lib/ortam'

export const dynamic = 'force-dynamic'

/**
 * Kurulum teshis sayfasi. Uretimde Next.js hata metnini gizliyor, o yuzden
 * "neden bos cikiyor" sorusunu cevaplayacak tek bir adres gerekiyor.
 *
 * Anahtarlarin DEGERI asla yazilmaz; sadece tanimli olup olmadigi ve
 * bicimi (yeni sb_ formati mi, iptal edilmis eski JWT mi) gosterilir.
 */

type Satir = { ad: string; durum: 'iyi' | 'kotu' | 'uyari'; not: string }

function anahtarBicimi(deger: string | undefined, beklenen: 'publishable' | 'secret'): Satir['not'] {
  const d = (deger || '').trim()
  if (!d) return 'tanımlı değil'
  if (d.startsWith('eyJ')) return 'ESKİ tip anahtar (JWT). Bu anahtarlar iptal edilmişti, yenisiyle değiştirin.'
  if (beklenen === 'publishable' && d.startsWith('sb_publishable_')) return 'tanımlı (sb_publishable_…)'
  if (beklenen === 'secret' && d.startsWith('sb_secret_')) return 'tanımlı (sb_secret_…)'
  if (d.startsWith('sb_publishable_')) return 'tanımlı ama bu bir Publishable key — burada Secret key olmalı.'
  if (d.startsWith('sb_secret_')) return 'tanımlı ama bu bir Secret key — burada Publishable key olmalı.'
  return 'tanımlı ama bilinen bir anahtar biçiminde değil'
}

async function sorgula(url: string, anahtar: string, yol: string, say = false) {
  try {
    const y = await fetch(`${url}/rest/v1/${yol}`, {
      headers: {
        apikey: anahtar,
        Authorization: `Bearer ${anahtar}`,
        // kayit sayisini ogrenmek icin; content-range basliginda doner
        ...(say ? { Prefer: 'count=exact' } : {}),
      },
      cache: 'no-store',
    })
    const govde = await y.text()
    return { kod: y.status, govde: govde.slice(0, 300), sayi: y.headers.get('content-range') }
  } catch (e: any) {
    return { kod: 0, govde: `Bağlantı kurulamadı: ${e?.message || e}`, sayi: null }
  }
}

export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '')
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  const gizli = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  const satirlar: Satir[] = [
    { ad: 'NEXT_PUBLIC_SUPABASE_URL', durum: url ? 'iyi' : 'kotu', not: url || 'tanımlı değil' },
    {
      ad: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      durum: !anon ? 'kotu' : anon.startsWith('sb_publishable_') ? 'iyi' : 'uyari',
      not: anahtarBicimi(anon, 'publishable'),
    },
    {
      ad: 'SUPABASE_SERVICE_ROLE_KEY',
      durum: !gizli ? 'kotu' : gizli.startsWith('sb_secret_') ? 'iyi' : 'uyari',
      not: anahtarBicimi(gizli, 'secret'),
    },
    {
      ad: 'NEXT_PUBLIC_SUPABASE_BUCKET',
      durum: 'iyi',
      not: (process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'images') + ' (boşsa images kullanılır)',
    },
  ]

  const testler: Satir[] = []
  if (url && gizli) {
    const r = await sorgula(url, gizli, 'firmalar?select=*&limit=1')
    testler.push({
      ad: 'Panel bağlantısı (Secret key ile firmalar tablosu)',
      durum: r.kod === 200 ? 'iyi' : 'kotu',
      not: r.kod === 200 ? 'çalışıyor' : `HTTP ${r.kod} — ${r.govde || 'yanıt yok'}`,
    })
    if (r.kod === 200) {
      for (const t of ['firmalar', 'ilceler', 'kategoriler', 'ayarlar', 'sss', 'bannerlar']) {
        const s = await sorgula(url, gizli, `${t}?select=*&limit=1`, true)
        const n = s.sayi?.split('/')?.[1]
        testler.push({
          ad: `Tablo: ${t}`,
          durum: s.kod === 200 ? 'iyi' : 'kotu',
          not: s.kod === 200 ? `${n && n !== '*' ? n + ' kayıt' : 'okunuyor'}` : `HTTP ${s.kod} — ${s.govde}`,
        })
      }
    }
  }
  if (url && anon) {
    const r = await sorgula(url, anon, 'firmalar?select=*&limit=1', true)
    testler.push({
      ad: 'Ziyaretçi okuma izni (Publishable key)',
      durum: r.kod === 200 ? 'iyi' : 'kotu',
      not: r.kod === 200
        ? `çalışıyor — siteye ${r.sayi?.split('/')?.[1] ?? '?'} firma görünüyor`
        : `HTTP ${r.kod} — ${r.govde || 'yanıt yok'}`,
    })
  }

  const renk = { iyi: '#1F7A46', kotu: '#B3261E', uyari: '#9C5A2C' }
  const isaret = { iyi: '✓', kotu: '✕', uyari: '!' }
  const blok = (baslik: string, ss: Satir[]) => ss.length ? `
    <h2 style="font-size:1.05rem;margin:28px 0 10px">${baslik}</h2>
    <table style="border-collapse:collapse;width:100%">
      ${ss.map((s) => `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #E4E1D8;color:${renk[s.durum]};font-weight:700;width:24px">${isaret[s.durum]}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #E4E1D8;white-space:nowrap"><code>${s.ad}</code></td>
        <td style="padding:8px 10px;border-bottom:1px solid #E4E1D8;color:#5B5B54;word-break:break-word">${s.not}</td>
      </tr>`).join('')}
    </table>` : ''

  const hepsi = [...satirlar, ...testler]
  const sorunVar = hepsi.some((s) => s.durum === 'kotu')
  const uyariVar = hepsi.some((s) => s.durum === 'uyari')
  const ozet = sorunVar
    ? { renk: renk.kotu, metin: 'Eksik veya hatalı ayar var.' }
    : uyariVar
      ? { renk: renk.uyari, metin: 'Dikkat edilmesi gereken bir ayar var.' }
      : { renk: renk.iyi, metin: 'Her şey yolunda görünüyor.' }
  const eksikAd = GEREKLI_DEGISKENLER.filter((d) => !(process.env[d.ad] || '').trim()).map((d) => d.ad)

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kurulum durumu</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:820px;margin:0 auto;padding:40px 20px;line-height:1.55;color:#2B2B28">
<div style="height:6px;width:64px;background:#F2C230;border-radius:3px;margin-bottom:18px"></div>
<h1 style="font-size:1.5rem;margin:0 0 6px">Kurulum durumu</h1>
<p style="margin:0 0 4px;color:${ozet.renk};font-weight:600">${ozet.metin}</p>
<p style="margin:0;color:#8A8A80;font-size:.9rem">Anahtarların kendisi bu sayfada gösterilmez, sadece tanımlı olup olmadıkları.</p>
${blok('Ortam değişkenleri', satirlar)}
${blok('Bağlantı testleri', testler)}
${eksikAd.length ? `<p style="margin-top:24px;color:#5B5B54">Eksik değişkenleri Vercel&apos;de <b>Settings → Environment Variables</b>
  altına (Production işaretli) ekleyip <b>Deployments → ⋯ → Redeploy</b> yapın: ${eksikAd.map((a) => `<code>${a}</code>`).join(', ')}</p>` : ''}
</body></html>`

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
  })
}
