import { ayarlar, ilceler, kategoriFirmalari, sssGetir } from '@/lib/veri'
import { uFirma, uIl, uIlce, uKat } from '@/lib/url'
import type { Il, Ilce, Kategori } from '@/lib/tipler'
import { SiteKabuk } from './SiteKabuk'
import { GuvenKutulari } from './GuvenKutulari'
import { TeklifFormu } from './TeklifFormu'
import { FirmaKart } from './FirmaKart'
import { SssBlok } from './Sss'

export async function KategoriSayfasi({ il, kat, ilce }: {
  il: Il; kat: Kategori; ilce?: Ilce | null
}) {
  const a = await ayarlar()
  const D = (a.domain || '').replace(/\/+$/, '')

  const liste = await kategoriFirmalari(kat.id, il.id, ilce?.id ?? null)
  const yer = ilce ? ilce.ad : il.ad
  const baslik = `${yer} ${kat.ad} Firmaları`

  // Bu kategoride firmasi olan diger ilceler
  const digerIlceler = await ilceler(il.id)
  const digerler = (await Promise.all(
    digerIlceler
      .filter((x) => !ilce || x.id !== ilce.id)
      .map(async (x) => [x, (await kategoriFirmalari(kat.id, il.id, x.id)).length] as const)))
    .filter(([, n]) => n > 0).map(([x]) => x)

  const sss = (await sssGetir('kategori', kat.id)).length
    ? await sssGetir('kategori', kat.id)
    : await sssGetir('genel')

  const ld = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: baslik,
    itemListElement: liste.map((f, i) => ({
      '@type': 'ListItem', position: i + 1, url: D + uFirma(f), name: f.ad,
    })),
  }

  return (
    <SiteKabuk il={il} yol={uKat(il, kat, ilce)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="hero"><div className="kap">
        <div className="hero-sol">
          <nav className="kirinti">
            <a href="/">Ana sayfa</a> / <a href={uIl(il)}>{il.ad}</a>
            {ilce && <> / <a href={uIlce(il, ilce)}>{ilce.ad}</a></>} / {kat.ad}
          </nav>
          <h1>{baslik}</h1>
          <p className="hero-alt">{kat.ozet}</p>
          <div className="rakamlar">
            <div className="rakam"><b>{liste.length}</b><span>firma</span></div>
          </div>
          <div className="ilce-hizli">
            {digerler.map((x) => <a href={uKat(il, kat, x)} key={x.id}>{x.ad}</a>)}
            {ilce && <a href={uKat(il, kat)}>{il.ad} geneli</a>}
          </div>
          <GuvenKutulari />
        </div>
        <TeklifFormu />
      </div></section>

      <section className="bolum"><div className="kap">
        <div className="bolum-bas"><div className="koli-cizgi" /><h2>{baslik}</h2></div>
        <div className="firmalar">
          {liste.map((f) => <FirmaKart firma={f} key={f.id} />)}
          {!liste.length && <div className="yorum-yok">Bu kategoride henüz kayıtlı firma yok.</div>}
        </div>
      </div></section>

      {kat.metin && (
        <section className="bolum"><div className="kap"><div className="metin">
          <h2>{kat.ad} hakkında</h2>
          <div dangerouslySetInnerHTML={{ __html: kat.metin }} />
        </div></div></section>
      )}

      <section className="bolum"><div className="kap">
        <div className="bolum-bas"><div className="koli-cizgi" /><h2>Sık sorulan sorular</h2></div>
        <SssBlok liste={sss} />
      </div></section>
    </SiteKabuk>
  )
}
