import { ayarlar, varsayilanIl } from '@/lib/veri'
import type { Il } from '@/lib/tipler'
import { Header } from './Header'
import { Footer } from './Footer'
import { BannerSerit } from './Banner'
import { UyariPopup } from './Popup'
import { YildizDefs } from './Yildiz'

/**
 * PHP'deki sayfa_bas() + sayfa_son() ciftinin karsiligi.
 * Her sayfa kendi il'ini veriyor ki menuler o ilin ilce/hizmetlerini gostersin.
 */
export async function SiteKabuk({
  il, yol, children,
}: { il?: Il | null; yol: string; children: React.ReactNode }) {
  const aktifIl = il !== undefined ? il : await varsayilanIl()
  const a = await ayarlar()

  return (
    <>
      {a.ozel_body && <div dangerouslySetInnerHTML={{ __html: a.ozel_body }} />}
      <YildizDefs />

      <Header il={aktifIl} yol={yol} />
      <BannerSerit konum="ust" />

      {children}

      <Footer il={aktifIl} />
      <BannerSerit konum="alt" />
      <UyariPopup />

      <div className="sabit">
        <a href="/#teklif" className="vurgu">Ücretsiz Teklif Al</a>
        <a href={a.sabit_link || '/talepler'}>{a.sabit_yazi || 'Gelen Talepler'}</a>
      </div>
    </>
  )
}
