import {
  ayarlar, ilceler, ilceSayilari, ilFirmalari, kategoriler, kategoriSayilari,
  sssGetir, yorumlar,
} from '@/lib/veri'
import { gorselUrl } from '@/lib/supabase'
import { uFirma, uIlce, uKat } from '@/lib/url'
import type { Il } from '@/lib/tipler'
import { SiteKabuk } from './SiteKabuk'
import { GuvenKutulari } from './GuvenKutulari'
import { TeklifFormu } from './TeklifFormu'
import { FirmaKart } from './FirmaKart'
import { AmbalajBlok } from './Ambalaj'
import { Gorusler } from './Gorusler'
import { SssBlok } from './Sss'
import { YanSutun } from './YanSutun'

/**
 * Il sayfasi — ana sayfa da bunu kullaniyor (PHP'de il.php, $anasayfa bayragiyla).
 * Bolum basliklari/metinleri panelden as_*_b / as_*_m anahtarlariyla degistirilebiliyor,
 * as_*_gizle ile bolum tamamen kapatilabiliyor.
 */
export async function IlSayfasi({ il, anasayfa = false }: { il: Il; anasayfa?: boolean }) {
  const a = await ayarlar()
  const D = (a.domain || '').replace(/\/+$/, '')
  const yol = anasayfa ? '/' : `/${il.slug}/`

  const [firmalar, ilceListe, katlar, gorus, sss] = await Promise.all([
    ilFirmalari(il.id), ilceler(il.id), kategoriler(), yorumlar(null), sssGetir('genel'),
  ])
  const [ilceAdet, katAdet] = await Promise.all([ilceSayilari(il.id), kategoriSayilari(il.id)])

  const merkez = firmalar.filter((f) => f.merkez)
  const one = firmalar.filter((f) => !f.merkez && (f.one_cikan || f.g_puan_n)).slice(0, 9)

  // Panelden duzenlenebilir blok yardimcilari
  const doldur = (s: string) => s.replace(/\{il\}/g, il.ad).replace(/\{sayi\}/g, String(firmalar.length))
  const B = (k: string, v: string) => doldur(a[`as_${k}_b`] || v)
  const M = (k: string, v: string) => doldur(a[`as_${k}_m`] || v)
  const gizli = (k: string) => Boolean(a[`as_${k}_gizle`])

  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: a.site_adi, url: D + '/' },
    {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: `${il.ad} Nakliyat Firmaları`,
      itemListElement: firmalar.map((f, i) => ({
        '@type': 'ListItem', position: i + 1, url: D + uFirma(f), name: f.ad,
      })),
    },
  ]

  const makale = M('makale', '')

  return (
    <SiteKabuk il={il} yol={yol}>
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}

      <section className="hero">
        <div className="kap">
          <div className="hero-sol">
            {il.gorsel && <img className="sayfa-gorsel" src={gorselUrl(il.gorsel)!} alt={il.ad} />}
            <h1>{B('hero', '{il} evden eve nakliyat firmaları')}</h1>
            <p className="hero-alt">
              {M('hero', (il.ozet || '{il} merkez ve ilçelerde çalışan nakliyat firmalarını adres, telefon ve puanlarıyla listeledik.') + ' Toplam {sayi} firma listeleniyor.')}
            </p>
            <div className="ilce-hizli">
              {ilceListe.map((x) => <a href={uIlce(il, x)} key={x.id}>{x.ad}</a>)}
            </div>
            <GuvenKutulari />
          </div>
          <TeklifFormu />
        </div>
      </section>

      {merkez.length > 0 && !gizli('merkez') && (
        <section className="bolum"><div className="kap">
          <div className="bolum-bas"><div className="koli-cizgi" />
            <h2>{B('merkez', '{il} merkezdeki nakliyat firmaları')}</h2>
            <p>{M('merkez', 'Şehir merkezinde ofisi bulunan firmalar. Merkezdeki apartmanlarda sokak darlığı nedeniyle çoğu firma dış cephe asansörüyle çalışır.')}</p>
          </div>
          <div className="firmalar">
            {merkez.map((f) => <FirmaKart firma={f} key={f.id} />)}
          </div>
        </div></section>
      )}

      {!gizli('ilce') && (
        <section className="bolum"><div className="kap">
          <div className="bolum-bas"><div className="koli-cizgi" />
            <h2>{B('ilce', 'İlçelere göre firmalar')}</h2>
            {M('ilce', '') && <p>{M('ilce', '')}</p>}
          </div>
          <div className="ilceler">
            {ilceListe.map((x) => (
              <a className="ilce-kart" href={uIlce(il, x)} key={x.id}>
                <h3>{x.ad} Nakliyat</h3>
                <span>{ilceAdet[x.id] ?? 0} firma listeleniyor</span>
              </a>
            ))}
          </div>
        </div></section>
      )}

      {!gizli('hizmet') && (
        <section className="bolum"><div className="kap">
          <div className="bolum-bas"><div className="koli-cizgi" />
            <h2>{B('hizmet', 'Hizmet türüne göre firmalar')}</h2>
            {M('hizmet', '') && <p>{M('hizmet', '')}</p>}
          </div>
          <div className="ilceler">
            {katlar.filter((k) => katAdet[k.id]).map((k) => (
              <a className="ilce-kart" href={uKat(il, k)} key={k.id}>
                <h3>{k.ad}</h3><span>{katAdet[k.id]} firma</span>
              </a>
            ))}
          </div>
        </div></section>
      )}

      {one.length > 0 && !gizli('one') && (
        <section className="bolum"><div className="kap">
          <div className="bolum-bas"><div className="koli-cizgi" />
            <h2>{B('one', 'Öne çıkan nakliyat firmaları')}</h2>
            {M('one', '') && <p>{M('one', '')}</p>}
          </div>
          <div className="firmalar">{one.map((f) => <FirmaKart firma={f} key={f.id} />)}</div>
        </div></section>
      )}

      {!gizli('ambalaj') && (
        <section className="bolum"><div className="kap">
          <div className="bolum-bas"><div className="koli-cizgi" />
            <h2>{B('ambalaj', 'Taşınmada kullanılan ambalaj malzemeleri')}</h2>
            <p>{M('ambalaj', 'Eşyanızın hasarsız gitmesi büyük ölçüde paketlemeye bağlı.')}</p>
          </div>
          <AmbalajBlok />
        </div></section>
      )}

      <Gorusler liste={gorus} baslik={B('gorus', 'Rehberi kullananlar ne diyor?')} metin={M('gorus', '')} />

      <section className="bolum"><div className="kap"><div className="iki-kolon">
        <div className="metin icerik">
          {!gizli('makale') && (
            <>
              <h2>{B('makale', '{il} nakliye firmaları hakkında bilmeniz gerekenler')}</h2>
              <div dangerouslySetInnerHTML={{ __html: makale || il.metin || '' }} />
            </>
          )}
          {!gizli('sss') && (
            <>
              <h2 style={{ marginTop: 30 }}>{B('sss', 'Sık sorulan sorular')}</h2>
              {M('sss', '') && <p>{M('sss', '')}</p>}
              <SssBlok liste={sss} />
            </>
          )}
        </div>
        <YanSutun il={il} />
      </div></div></section>
    </SiteKabuk>
  )
}
