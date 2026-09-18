import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ayarlar, varsayilanIl } from '@/lib/veri'
import { yonetimIstemcisi } from '@/lib/supabase'
import { sayfaMeta } from '@/lib/meta'
import { SiteKabuk } from '@/components/site/SiteKabuk'
import { YanSutun } from '@/components/site/YanSutun'
import type { Basvuru } from '@/lib/tipler'

export const dynamic = 'force-dynamic'

/** Sitede gosterilen alanlar — ad ve telefon ASLA yok. */
const ETIKET: [string, string][] = [
  ['Ev tipi', 'Ev tipi'], ['Çıkış katı', 'Çıkış katı'], ['Varış katı', 'Varış katı'],
  ['Asansör', 'Asansör'], ['İstenen hizmet', 'Hizmet'], ['Taşınma tarihi', 'Taşınma tarihi'],
]

export async function generateMetadata(): Promise<Metadata> {
  const a = await ayarlar()
  return sayfaMeta({
    baslik: `Açık Taşınma Talepleri | ${a.site_adi}`,
    aciklama: 'Rehbere ulaşan güncel taşınma talepleri. Nereden nereye, kaç kat, hangi tarihte. Nakliyat firmaları için.',
    yol: '/talepler',
  })
}

export default async function Talepler() {
  const a = await ayarlar()
  if (!a.talepler_aktif) notFound()

  const il = await varsayilanIl()
  const db = yonetimIstemcisi()
  const { data } = await db.from('basvurular')
    .select('id, veri, tarih')
    .eq('yayinda', true).eq('tur', 'teklif')
    .order('id', { ascending: false }).limit(60)

  const liste = (data ?? []) as Pick<Basvuru, 'id' | 'veri' | 'tarih'>[]

  return (
    <SiteKabuk il={il} yol="/talepler">
      <section className="bolum"><div className="kap">
        <nav className="kirinti"><a href="/">Ana sayfa</a> / Açık talepler</nav>

        <div className="bolum-bas"><div className="koli-cizgi" />
          <h1>Açık taşınma talepleri</h1>
          <p>
            Rehbere ulaşan güncel talepler. İletişim bilgileri gizlidir; talebi almak isteyen
            firmalar bizimle iletişime geçer.
          </p>
        </div>

        <div className="iki-kolon">
          <div>
            {!liste.length ? (
              <div className="yorum-yok">
                Şu an yayında açık talep yok. Yeni talepler geldikçe burada listelenir.
              </div>
            ) : (
              <div className="talep-liste">
                {liste.map((t) => {
                  let v: Record<string, string> = {}
                  try { v = JSON.parse(t.veri || '{}') } catch { v = {} }
                  return (
                    <article className="talep" key={t.id}>
                      <div className="talep-ust">
                        <span className="talep-no">Talep #{t.id}</span>
                        <span className="talep-tarih">
                          {new Date(t.tarih).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="talep-rota">
                        {v['Nereden'] || '—'} <span>→</span> {v['Nereye'] || '—'}
                      </p>
                      <dl>
                        {ETIKET.filter(([k]) => v[k]).map(([k, et]) => (
                          <div key={k}><dt>{et}</dt><dd>{v[k]}</dd></div>
                        ))}
                      </dl>
                      <p className="talep-gizli">
                        Ad ve telefon gizlidir. Bu talebi almak için bizimle iletişime geçin.
                      </p>
                    </article>
                  )
                })}
              </div>
            )}

            <div className="metin" style={{ marginTop: 36 }}>
              <h2>Nakliyat firmaları için</h2>
              <p>
                Bu sayfadaki talepler siteye gelen gerçek taşınma taleplerinden oluşur.
                Müşterinin adı ve telefonu burada gösterilmez; talebi yalnızca rehbere
                kayıtlı firmalara iletiriz.
              </p>
              <p>Firmanız listede değilse önce <a href="/firma-ekle">firma ekleme formunu</a> doldurun.</p>
            </div>
          </div>

          <YanSutun il={il} />
        </div>
      </div></section>
    </SiteKabuk>
  )
}
