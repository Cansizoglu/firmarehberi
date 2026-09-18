import { firmaKategorileri, kapak, ayar } from '@/lib/veri'
import { mono, telefonLink, uFirma, wpLink } from '@/lib/url'
import type { FirmaGenis } from '@/lib/tipler'
import { PuanSatir } from './PuanSatir'

export async function FirmaKart({ firma }: { firma: FirmaGenis }) {
  const [kategoriler, kapakUrl, siteAdi] = await Promise.all([
    firmaKategorileri(firma.id),
    kapak(firma.id),
    ayar('site_adi'),
  ])

  const gold = firma.paket === 'gold'

  return (
    <article className={'firma' + (gold ? ' paket-gold' : '')}>
      {gold
        ? <span className="paket-rz gold">GOLD</span>
        : firma.one_cikan ? <span className="paket-rz one">ÖNE ÇIKAN</span> : null}

      {kapakUrl && <img className="kart-gorsel" src={kapakUrl} alt={firma.ad} loading="lazy" />}

      <div className="firma-ust">
        <span className="mono" aria-hidden="true">{mono(firma.ad)}</span>
        <div>
          <h3><a href={uFirma(firma)}>{firma.ad}</a></h3>
          <p className="adres">
            {firma.adres}<br />
            {firma.mahalle} — {firma.ilce_ad} / {firma.il_ad}
          </p>
          <PuanSatir firma={firma} />
        </div>
      </div>

      <div className="etiketler">
        {kategoriler.slice(0, 3).map((k) => (
          <span className="etiket" key={k.id}>{k.ad}</span>
        ))}
      </div>

      <div className="firma-alt">
        {firma.tel && (
          <>
            <a className="btn btn-ara" href={`tel:${telefonLink(firma.tel)}`}>{firma.tel}</a>
            <a className="btn btn-wp" href={wpLink(firma.tel, siteAdi)}
               target="_blank" rel="noopener">WhatsApp</a>
          </>
        )}
        <a className="btn btn-detay" href={uFirma(firma)}>Detay</a>
      </div>
    </article>
  )
}
