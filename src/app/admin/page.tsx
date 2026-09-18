import { yonetimIstemcisi } from '@/lib/supabase'
import { ayarlar } from '@/lib/veri'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Panel' }

async function say(tablo: string, filtre?: (q: any) => any) {
  const db = yonetimIstemcisi()
  let q = db.from(tablo).select('id', { count: 'exact', head: true })
  if (filtre) q = filtre(q)
  const { count } = await q
  return count ?? 0
}

export default async function Gosterge() {
  const a = await ayarlar()

  const [firma, aktifFirma, ilce, kategori, yorumBekleyen, basvuruOkunmamis, yayindaTalep, banner, sayfa, blog] =
    await Promise.all([
      say('firmalar'),
      say('firmalar', (q) => q.eq('aktif', true)),
      say('ilceler'),
      say('kategoriler'),
      say('yorumlar', (q) => q.eq('onayli', false)),
      say('basvurular', (q) => q.eq('okundu', false)),
      say('basvurular', (q) => q.eq('yayinda', true)),
      say('bannerlar', (q) => q.eq('aktif', true)),
      say('sayfalar'),
      say('blog_yazi'),
    ])

  const kutular = [
    { etiket: 'Firma', deger: `${aktifFirma} / ${firma}`, alt: 'yayında / toplam', yol: '/admin/firmalar' },
    { etiket: 'Onay bekleyen yorum', deger: yorumBekleyen, alt: 'yorumlar', yol: '/admin/yorumlar', uyari: yorumBekleyen > 0 },
    { etiket: 'Okunmamış başvuru', deger: basvuruOkunmamis, alt: 'teklif ve firma başvuruları', yol: '/admin/basvurular', uyari: basvuruOkunmamis > 0 },
    { etiket: 'Yayında talep', deger: yayindaTalep, alt: '/talepler sayfasında', yol: '/admin/basvurular' },
    { etiket: 'İlçe', deger: ilce, alt: 'kayıtlı ilçe', yol: '/admin/ilceler' },
    { etiket: 'Kategori', deger: kategori, alt: 'hizmet türü', yol: '/admin/kategoriler' },
    { etiket: 'Aktif banner', deger: banner, alt: 'sponsor alanı', yol: '/admin/bannerlar' },
    { etiket: 'Sayfa / Blog', deger: `${sayfa} / ${blog}`, alt: 'statik sayfa / yazı', yol: '/admin/sayfalar' },
  ]

  return (
    <>
      <div className="baslik-satir">
        <h1>Panel</h1>
        <a className="btn" href="/" target="_blank" rel="noopener">Siteyi görüntüle ↗</a>
      </div>

      <div className="kutular">
        {kutular.map((k) => (
          <a className={'kutu' + (k.uyari ? ' kutu-uyari' : '')} href={k.yol} key={k.etiket}>
            <span className="kutu-sayi">{k.deger}</span>
            <b>{k.etiket}</b>
            <small>{k.alt}</small>
          </a>
        ))}
      </div>

      <div className="kart" style={{ marginTop: 24 }}>
        <h2>Hızlı başlangıç</h2>
        <ul className="liste-ipucu">
          <li><b>Yeni firma eklemek:</b> Firmalar → Yeni firma. İl, ilçe ve kategorileri seçmeyi unutma.</li>
          <li><b>Gelen teklifleri görmek:</b> Başvurular. Bir talebi nakliyecilere açmak istersen &quot;Yayına al&quot; de.</li>
          <li><b>Yorum onaylamak:</b> Yorumlar. Onaylanan yorum firma puanını hesaplar ve Google yıldızlarını besler.</li>
          <li><b>Site adı, logo, SMTP:</b> Ayarlar.</li>
        </ul>
        <p className="ipucu">
          Sitenin adresi: <b>{a.domain || '—'}</b> · Varsayılan il: <b>{a.varsayilan_il || '—'}</b>
        </p>
      </div>
    </>
  )
}
