import { firmaPuan } from '@/lib/veri'
import { haritaLink } from '@/lib/url'
import type { FirmaGenis } from '@/lib/tipler'
import { Yildiz } from './Yildiz'

/**
 * PHP'deki puan_satir(): once kendi onayli yorumlarimizin ortalamasi,
 * o yoksa Google puani (kaynak linkiyle birlikte).
 */
export async function PuanSatir({ firma }: { firma: FirmaGenis }) {
  const [ort, adet] = await firmaPuan(firma.id)

  if (ort) {
    return (
      <div className="puan-satir">
        <Yildiz puan={ort} /><b>{ort}</b><span>{adet} yorum</span>
      </div>
    )
  }

  if (firma.g_puan) {
    return (
      <div className="puan-satir">
        <Yildiz puan={Number(firma.g_puan)} />
        <b>{firma.g_puan}</b>
        <span>{firma.g_puan_n ?? 0} değerlendirme</span>
        <a className="puan-kaynak" href={haritaLink(firma)}
           target="_blank" rel="noopener nofollow">Google</a>
      </div>
    )
  }

  return null
}
