import { acikTalepSayisi, ayar, ilceler, ilceSayilari, kategoriler, kategoriSayilari } from '@/lib/veri'
import { uIlce, uKat } from '@/lib/url'
import type { Il } from '@/lib/tipler'
import { BannerYan } from './Banner'

export async function YanSutun({ il }: { il?: Il | null }) {
  const [siteAdi, sidebarMetin, taleplerAktif] = await Promise.all([
    ayar('site_adi'), ayar('sidebar_metin'), ayar('talepler_aktif'),
  ])

  const tanitim = sidebarMetin ||
    `${siteAdi} olarak bölgenizde evden eve nakliyat yapan firmaları tek çatı altında ` +
    'topluyoruz. Firmaları karşılaştırır, tek formla hepsinden birden fiyat alırsınız. ' +
    'Kullanımı tamamen ücretsizdir.'

  const katlar    = il ? await kategoriler() : []
  const katAdet   = il ? await kategoriSayilari(il.id) : {}
  const ilceListe = il ? await ilceler(il.id) : []
  const ilceAdet  = il ? await ilceSayilari(il.id) : {}
  const talep     = taleplerAktif ? await acikTalepSayisi() : 0

  return (
    <aside className="yan-sutun">
      <div className="yan-kutu">
        <h3>{siteAdi} nedir?</h3>
        <p>{tanitim}</p>
        <a className="btn btn-ara" href="/#teklif">Ücretsiz Teklif Al</a>
      </div>

      {il && (
        <>
          <div className="yan-kutu">
            <h3>Hizmetler</h3>
            <ul className="yan-liste">
              {katlar.filter((k) => katAdet[k.id]).map((k) => (
                <li key={k.id}>
                  <a href={uKat(il, k)}>{k.ad}<span>{katAdet[k.id]}</span></a>
                </li>
              ))}
            </ul>
          </div>

          <div className="yan-kutu">
            <h3>İlçeler</h3>
            <ul className="yan-liste">
              {ilceListe.map((i) => (
                <li key={i.id}>
                  <a href={uIlce(il, i)}>{i.ad}<span>{ilceAdet[i.id] ?? 0}</span></a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="yan-kutu yan-uyari">
        <h3>Önce güvenlik</h3>
        <ul>
          <li>Emin olmadan kapora veya ön ödeme yapmayın.</li>
          <li>Vergi levhası ve K3 belgesi isteyin.</li>
          <li>Firmanın ofisini ve adresini araştırın.</li>
          <li>Sözleşme ve eşya listesi olmadan taşıtmayın.</li>
        </ul>
        <a className="btn btn-harita" href="/bilgi-al"
           style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
          Firma Hakkında Bilgi Al
        </a>
      </div>

      <BannerYan />

      {talep > 0 && (
        <div className="yan-kutu">
          <h3>Açık talepler</h3>
          <p>Şu an {talep} taşınma talebi yayında. Nakliyeciyseniz inceleyebilirsiniz.</p>
          <a className="btn btn-harita" href="/talepler">Talepleri Gör</a>
        </div>
      )}
    </aside>
  )
}
