import { BannerKutular } from './Banner'
import { bannerKonum } from '@/lib/veri'

const IK = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#9C5A2C"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)

const KUTULAR = [
  [IK(<path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z" />),
   'Doğrulanmış kayıtlar', 'Firma adresi ve telefonu tek tek kontrol edilir.'],
  [IK(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
   'Aynı gün dönüş', 'Formu dolduranlara kısa sürede fiyat verilir.'],
  [IK(<path d="M3 10h18M6 10V6h12v4M4 10v8h16v-8" />),
   'Tüm ilçeler', 'Merkez ilçelerin yanı sıra uzak ilçeler de listede.'],
  [IK(<><path d="M12 3v18M5 8l7-5 7 5" /><path d="M5 8v9h14V8" /></>),
   'Ücretsiz kullanım', 'Teklif almak ve firma eklemek para istemez.'],
] as const

/**
 * Hero altindaki 4 kutu. Bu alana banner eklenmisse guven kutulari yerine
 * bannerlar gosterilir (PHP v3 davranisi).
 */
export async function GuvenKutulari() {
  const banner = await bannerKonum('kutu')
  if (banner.length) return <div className="guven"><BannerKutular /></div>

  return (
    <div className="guven">
      {KUTULAR.map(([ikon, baslik, alt]) => (
        <div className="guven-kutu" key={baslik as string}>
          {ikon}
          <span><b>{baslik}</b><span>{alt}</span></span>
        </div>
      ))}
    </div>
  )
}
