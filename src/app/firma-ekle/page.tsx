import type { Metadata } from 'next'
import { ayarlar, iller, varsayilanIl } from '@/lib/veri'
import { sayfaMeta } from '@/lib/meta'
import { basvuruGonder } from '@/app/eylemler/gonder'
import { SiteKabuk } from '@/components/site/SiteKabuk'
import { GuvenKutulari } from '@/components/site/GuvenKutulari'
import { Captcha } from '@/components/site/Captcha'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const a = await ayarlar()
  return sayfaMeta({
    baslik: `Firmanızı Ekleyin | ${a.site_adi}`,
    aciklama: 'Nakliyat hizmeti veriyorsanız firmanızı ücretsiz olarak rehbere ekleyin.',
    yol: '/firma-ekle',
  })
}

export default async function FirmaEkle() {
  const ilListe = await iller()

  return (
    <SiteKabuk il={await varsayilanIl()} yol="/firma-ekle">
      <section className="hero"><div className="kap">
        <div className="hero-sol">
          <h1>Firmanızı rehbere ekleyin</h1>
          <p className="hero-alt">
            Evden eve nakliyat, asansörlü taşımacılık veya şehirler arası taşıma yapıyorsanız
            firmanızı ücretsiz ekleyebilirsiniz. Bilgileriniz kontrol edildikten sonra ilçe
            sayfasında, kategori sayfalarında ve kendi firma sayfanızda yayınlanır.
          </p>
          <div className="ilce-hizli"><a href="/">Firma listesine dön</a></div>
          <GuvenKutulari />
        </div>

        <div className="form-kart" id="teklif">
          <h2>Firma Başvuru Formu</h2>
          <p className="aciklama">Formu doldurun, en kısa sürede sizinle iletişime geçelim.</p>

          <form action={basvuruGonder}>
            <input type="hidden" name="tur" value="firma" />
            <input type="text" name="_bot" className="botfield" tabIndex={-1} autoComplete="off" />

            <div className="alan">
              <label htmlFor="fad">Firma Adı</label>
              <input id="fad" type="text" name="firma_adi" required />
            </div>

            <div className="grid2">
              <div className="alan">
                <label htmlFor="yet">Yetkili Kişi</label>
                <input id="yet" type="text" name="ad" required />
              </div>
              <div className="alan">
                <label htmlFor="ft">Telefon</label>
                <input id="ft" type="tel" name="tel" required />
              </div>
            </div>

            <div className="grid2">
              <div className="alan">
                <label htmlFor="fil">İl</label>
                <select id="fil" name="il">
                  {ilListe.map((x) => <option key={x.id}>{x.ad}</option>)}
                  <option>Diğer</option>
                </select>
              </div>
              <div className="alan">
                <label htmlFor="fi">İlçe</label>
                <input id="fi" type="text" name="ilce" required />
              </div>
            </div>

            <div className="alan">
              <label htmlFor="fa">Açık Adres</label>
              <input id="fa" type="text" name="adres" />
            </div>

            <div className="grid2">
              <div className="alan">
                <label htmlFor="fw">Web Sitesi</label>
                <input id="fw" type="url" name="web" placeholder="https://" />
              </div>
              <div className="alan">
                <label htmlFor="fg">Harita Linki</label>
                <input id="fg" type="url" name="harita" placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>

            <div className="alan">
              <label htmlFor="fh">Verdiğiniz Hizmetler</label>
              <textarea id="fh" name="hizmetler"
                placeholder="Evden eve, asansörlü taşıma, eşya depolama, şehirler arası..." />
            </div>

            <Captcha />

            <button type="submit" className="gonder">Başvuruyu Gönder</button>
            <p className="kvkk">
              Başvurular yönetici onayından sonra yayınlanır. Vergi levhası ve K3 yetki belgesi
              olmayan firmalar rehbere kaydedilmez.
            </p>
          </form>
        </div>
      </div></section>

      <section className="bolum"><div className="kap"><div className="metin">
        <h2>Rehbere eklenme şartları</h2>
        <ul>
          <li>Bulunduğunuz ilde fiilen nakliyat hizmeti veriyor olmanız</li>
          <li>Ulaşılabilir bir telefon numarası ve açık adres bildirmeniz</li>
          <li>Bildirdiğiniz bilgilerin doğru ve güncel olması</li>
        </ul>
        <h3>Ne kazanırsınız?</h3>
        <p>
          Her firmaya kendi sayfası açılıyor: adres, telefon, hizmet listesi, harita, fotoğraf
          galerisi ve yorum bölümü. Sayfanız arama motorlarına ayrı gönderiliyor. Listeleme ücretsizdir.
        </p>
      </div></div></section>
    </SiteKabuk>
  )
}
