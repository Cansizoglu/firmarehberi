import {
  ayar, ilceler, ilceSayilari, kategoriler, kategoriSayilari, menuSayfalari,
} from '@/lib/veri'
import { uIlce, uKat } from '@/lib/url'
import type { Il } from '@/lib/tipler'
import { SiteLogo } from './Logo'

export async function Header({ il, yol }: { il: Il | null; yol: string }) {
  const [siteAdi, domain, taleplerAktif, katlar, sayfalar] = await Promise.all([
    ayar('site_adi'), ayar('domain'), ayar('talepler_aktif'),
    kategoriler(), menuSayfalari(),
  ])
  const ilceListe = il ? await ilceler(il.id) : []
  const ilceAdet  = il ? await ilceSayilari(il.id) : {}
  const katAdet   = il ? await kategoriSayilari(il.id) : {}

  return (
    <>
      <div className="ustbar">
        <div className="kap">
          <span>{il?.ad ?? ''} nakliyat firmaları rehberi</span>
          <span><a href="/firma-ekle">Firmanızı ücretsiz ekleyin</a></span>
        </div>
      </div>

      <header className="header">
        <div className="kap">
          <a className="logo" href="/">
            <SiteLogo />
            <span>
              <span className="logo-ad">{siteAdi}</span>
              <span className="logo-alt">{domain.replace(/^https?:\/\//, '')}</span>
            </span>
          </a>

          <button className="mnu" aria-expanded="false" aria-label="Menüyü aç">☰</button>

          <nav className="nav">
            <a href="/" aria-current={yol === '/' ? 'page' : undefined}>Ana Sayfa</a>

            {ilceListe.length > 0 && il && (
              <div className="mnu-grup">
                <button type="button">İlçeler</button>
                <div className="mnu-ac">
                  {ilceListe.map((i) => (
                    <a href={uIlce(il, i)} key={i.id}>{i.ad}<i>{ilceAdet[i.id] ?? 0}</i></a>
                  ))}
                </div>
              </div>
            )}

            {il && katlar.some((k) => katAdet[k.id]) && (
              <div className="mnu-grup">
                <button type="button">Hizmetler</button>
                <div className="mnu-ac">
                  {katlar.filter((k) => katAdet[k.id]).map((k) => (
                    <a href={uKat(il, k)} key={k.id}>{k.ad}<i>{katAdet[k.id]}</i></a>
                  ))}
                </div>
              </div>
            )}

            <div className="mnu-grup">
              <button type="button">Rehber</button>
              <div className="mnu-ac">
                {taleplerAktif && <a href="/talepler">Açık Talepler</a>}
                <a href="/firma-ekle">Firma Ekle</a>
                <a href="/bilgi-al">Bilgi Al</a>
                {sayfalar.length > 0 && <hr />}
                {sayfalar.map((s) => <a href={`/${s.slug}`} key={s.slug}>{s.baslik}</a>)}
              </div>
            </div>

            <a className="nav-ara" href="#teklif">Teklif Al</a>
          </nav>
        </div>
      </header>
    </>
  )
}
