import { varsayilanIl } from '@/lib/veri'
import { SiteKabuk } from '@/components/site/SiteKabuk'

export default async function Bulunamadi() {
  return (
    <SiteKabuk il={await varsayilanIl()} yol="/404">
      <section className="bolum"><div className="kap"><div className="metin">
        <div className="koli-cizgi" />
        <h1>Sayfa bulunamadı</h1>
        <p>Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
        <p><a className="btn btn-ara" href="/">Ana sayfaya dön</a></p>
      </div></div></section>
    </SiteKabuk>
  )
}
