import { bannerKonum } from '@/lib/veri'
import { gorselUrl } from '@/lib/supabase'
import type { Banner, BannerKonum } from '@/lib/tipler'

/** Tiklama sayaci uzerinden yonlendiren adres (PHP'deki banner-git.php). */
const git = (b: Banner, harita = false) =>
  `/api/banner-git?b=${b.id}${harita ? '&h=harita' : ''}`

/** Ayni konumda birden fazla banner varsa donusumlu goster (PHP: array_rand). */
function sec(liste: Banner[]): Banner | null {
  if (!liste.length) return null
  return liste[Math.floor(Math.random() * liste.length)]
}

/** Header alti sari serit / sayfa alti banner. */
export async function BannerSerit({ konum }: { konum: 'ust' | 'alt' | 'firma' }) {
  const b = sec(await bannerKonum(konum))
  if (!b) return null

  if (b.gorsel) {
    return (
      <div className="baraj banner-gorsel">
        <div className="kap">
          <a href={git(b)} target="_blank" rel="noopener sponsored">
            <img src={gorselUrl(b.gorsel)!} alt={b.baslik} loading="lazy" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="baraj">
      <div className="kap">
        <a className="baraj-yazi" href={git(b)} target="_blank" rel="noopener sponsored">
          {b.rozet && <span className="baraj-rozet">{b.rozet}</span>}
          <span className="baraj-ad">{b.baslik}</span>
          {b.alt_yazi && <span className="baraj-alt">{b.alt_yazi}</span>}
        </a>
        <div className="baraj-btnler">
          <a className="baraj-btn" href={git(b)} target="_blank" rel="noopener sponsored">Siteye Git</a>
          {b.harita && (
            <a className="baraj-btn ikincil" href={git(b, true)}
               target="_blank" rel="noopener sponsored">Haritada Gör</a>
          )}
        </div>
      </div>
    </div>
  )
}

/** Hero altindaki 4 kutu alani. */
export async function BannerKutular({ adet = 4 }: { adet?: number }) {
  const liste = (await bannerKonum('kutu')).slice(0, adet)
  if (!liste.length) return null
  return (
    <>
      {liste.map((b) => (
        <a className="kutu-banner" key={b.id} href={git(b)}
           target="_blank" rel="noopener sponsored">
          {b.gorsel && <img src={gorselUrl(b.gorsel)!} alt={b.baslik} loading="lazy" />}
          {b.rozet && <span className="baraj-rozet">{b.rozet}</span>}
          <b>{b.baslik}</b>
          {b.alt_yazi && <small>{b.alt_yazi}</small>}
        </a>
      ))}
    </>
  )
}

/** Sidebar banner kutulari. */
export async function BannerYan({ adet = 2 }: { adet?: number }) {
  const liste = (await bannerKonum('yan')).slice(0, adet)
  if (!liste.length) return null
  return (
    <>
      {liste.map((b) => (
        <div className="yan-kutu yan-banner" key={b.id}>
          <a href={git(b)} target="_blank" rel="noopener sponsored">
            {b.gorsel ? (
              <img src={gorselUrl(b.gorsel)!} alt={b.baslik} loading="lazy" />
            ) : (
              <>
                {b.rozet && <span className="baraj-rozet">{b.rozet}</span>}
                <b>{b.baslik}</b>
                {b.alt_yazi && <small>{b.alt_yazi}</small>}
              </>
            )}
          </a>
        </div>
      ))}
    </>
  )
}
