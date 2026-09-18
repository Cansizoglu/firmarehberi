import type { Metadata } from 'next'
import { ayarlar, varsayilanIl } from '@/lib/veri'
import { sayfaMeta } from '@/lib/meta'
import { SiteKabuk } from '@/components/site/SiteKabuk'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const a = await ayarlar()
  return sayfaMeta({
    baslik: `Talebiniz Alındı | ${a.site_adi}`,
    aciklama: 'Talebiniz başarıyla iletildi.',
    yol: '/tesekkurler',
  })
}

const HATA: Record<string, string> = {
  captcha: 'Güvenlik sorusunun cevabı yanlıştı, talebiniz kaydedilmedi. Lütfen formu tekrar doldurun.',
  eksik: 'Zorunlu alanlar boş kaldığı için talebiniz kaydedilmedi. Lütfen formu tekrar doldurun.',
  kayit: 'Teknik bir sorun nedeniyle talebiniz kaydedilemedi. Lütfen tekrar deneyin veya telefonla ulaşın.',
}

export default async function Tesekkurler({
  searchParams,
}: { searchParams: { hata?: string } }) {
  const hata = searchParams.hata ? HATA[searchParams.hata] : null

  return (
    <SiteKabuk il={await varsayilanIl()} yol="/tesekkurler">
      <section className="bolum"><div className="kap"><div className="metin">
        <div className="koli-cizgi" />
        {hata ? (
          <>
            <h1>Talebiniz gönderilemedi</h1>
            <p>{hata}</p>
            <p><a className="btn btn-ara" href="/#teklif" style={{ marginTop: 10 }}>Formu tekrar doldur</a></p>
          </>
        ) : (
          <>
            <h1>Talebiniz bize ulaştı</h1>
            <p>Talebiniz kaydedildi. En kısa sürede size dönüş yapılacak.</p>
            <p>Bu arada rehberdeki firmaların sayfalarına göz atabilir, hizmet ve puanlarını karşılaştırabilirsiniz.</p>
            <p><a className="btn btn-ara" href="/" style={{ marginTop: 10 }}>Firma listesine dön</a></p>
          </>
        )}
      </div></div></section>
    </SiteKabuk>
  )
}
