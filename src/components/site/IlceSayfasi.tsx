import {
  ayarlar, ilceFirmalari, kategoriFirmalari, kategoriler, sssGetir,
} from '@/lib/veri'
import { gorselUrl } from '@/lib/supabase'
import { uFirma, uIl, uIlce, uKat } from '@/lib/url'
import type { Il, Ilce } from '@/lib/tipler'
import { SiteKabuk } from './SiteKabuk'
import { GuvenKutulari } from './GuvenKutulari'
import { TeklifFormu } from './TeklifFormu'
import { FirmaKart } from './FirmaKart'
import { SssBlok } from './Sss'

export async function IlceSayfasi({ il, ilce }: { il: Il; ilce: Ilce }) {
  const a = await ayarlar()
  const D = (a.domain || '').replace(/\/+$/, '')

  const [liste, katlar] = await Promise.all([ilceFirmalari(ilce.id), kategoriler()])

  // Bu ilcede firmasi olan kategoriler
  const katSayilari = await Promise.all(
    katlar.map(async (k) => [k, (await kategoriFirmalari(k.id, il.id, ilce.id)).length] as const))
  const doluKatlar = katSayilari.filter(([, n]) => n > 0).map(([k]) => k)

  const sss = (await sssGetir('ilce', ilce.id)).length
    ? await sssGetir('ilce', ilce.id)
    : await sssGetir('genel')

  const ld = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: `${ilce.ad} Nakliyat Firmaları`,
    itemListElement: liste.map((f, i) => ({
      '@type': 'ListItem', position: i + 1, url: D + uFirma(f), name: f.ad,
    })),
  }

  return (
    <SiteKabuk il={il} yol={uIlce(il, ilce)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="hero"><div className="kap">
        <div className="hero-sol">
          <nav className="kirinti">
            <a href="/">Ana sayfa</a> / <a href={uIl(il)}>{il.ad}</a> / {ilce.ad}
          </nav>
          {ilce.gorsel && <img className="sayfa-gorsel" src={gorselUrl(ilce.gorsel)!} alt={ilce.ad} />}
          <h1>{ilce.ad} evden eve nakliyat firmaları</h1>
          <p className="hero-alt">{ilce.ozet}</p>
          <div className="rakamlar">
            <div className="rakam"><b>{liste.length}</b><span>{ilce.ad}&apos;da firma</span></div>
          </div>
          <div className="ilce-hizli">
            {doluKatlar.map((k) => <a href={uKat(il, k, ilce)} key={k.id}>{k.ad}</a>)}
          </div>
          <GuvenKutulari />
        </div>
        <TeklifFormu />
      </div></section>

      <section className="bolum"><div className="kap">
        <div className="bolum-bas"><div className="koli-cizgi" />
          <h2>{ilce.ad} bölgesinde çalışan firmalar</h2>
        </div>
        <div className="firmalar">
          {liste.map((f) => <FirmaKart firma={f} key={f.id} />)}
          {!liste.length && (
            <div className="yorum-yok">
              Bu ilçede henüz kayıtlı firma yok. <a href="/firma-ekle">Firmanızı ekleyin</a>.
            </div>
          )}
        </div>
      </div></section>

      {ilce.metin && (
        <section className="bolum"><div className="kap"><div className="metin">
          <h2>{il.ad} {ilce.ad} taşıma şirketleri hakkında</h2>
          <div dangerouslySetInnerHTML={{ __html: ilce.metin }} />
          <h3>{ilce.ad}&apos;da taşınma öncesi kontrol listesi</h3>
          <ul>
            <li>Firma eve gelip ekspertiz yapsın, telefonda verilen fiyatla yetinmeyin</li>
            <li>Asansör ücretinin fiyata dahil olup olmadığını sorun</li>
            <li>Montaj-demontaj ve paketleme malzemesi ayrı mı, netleştirin</li>
            <li>Sigorta talep edin ve eşya listesini sözleşmeye ekletin</li>
            <li>Site veya apartman yönetiminden taşınma izni alın</li>
          </ul>
        </div></div></section>
      )}

      <section className="bolum"><div className="kap">
        <div className="bolum-bas"><div className="koli-cizgi" /><h2>Sık sorulan sorular</h2></div>
        <SssBlok liste={sss} />
      </div></section>
    </SiteKabuk>
  )
}
