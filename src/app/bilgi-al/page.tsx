import type { Metadata } from 'next'
import { ayarlar, varsayilanIl } from '@/lib/veri'
import { sayfaMeta } from '@/lib/meta'
import { basvuruGonder } from '@/app/eylemler/gonder'
import { SiteKabuk } from '@/components/site/SiteKabuk'
import { YanSutun } from '@/components/site/YanSutun'
import { Captcha } from '@/components/site/Captcha'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const a = await ayarlar()
  return sayfaMeta({
    baslik: `Bilgi Al | ${a.site_adi}`,
    aciklama: 'Bir firma hakkında bilgi almak, şikayet iletmek veya rehberle ilgili soru sormak için kısa formu doldurun.',
    yol: '/bilgi-al',
  })
}

export default async function BilgiAl() {
  const il = await varsayilanIl()

  return (
    <SiteKabuk il={il} yol="/bilgi-al">
      <section className="bolum"><div className="kap">
        <nav className="kirinti"><a href="/">Ana sayfa</a> / Bilgi Al</nav>

        <div className="iki-kolon">
          <div>
            <div className="koli-cizgi" />
            <h1>Bilgi al</h1>
            <p style={{ fontSize: '1.08rem', color: 'var(--murekkep-2)', maxWidth: '58ch', marginTop: 14 }}>
              Bir firma hakkında emin olamadıysanız, şikayetiniz varsa ya da rehberle ilgili
              sormak istediğiniz bir şey varsa formu doldurun. Size dönüş yapalım.
            </p>

            <div className="form-kart bilgi-form" id="teklif" style={{ marginTop: 24 }}>
              <h2>Kısa bilgi formu</h2>
              <p className="aciklama">
                Tek yapmanız gereken adınızı, ulaşabileceğimiz bir bilgiyi ve sorunuzu yazmak.
              </p>

              <form action={basvuruGonder}>
                <input type="hidden" name="tur" value="bilgi" />
                <input type="text" name="_bot" className="botfield" tabIndex={-1} autoComplete="off" />

                <div className="grid2">
                  <div className="alan">
                    <label htmlFor="bad">Adınız</label>
                    <input id="bad" type="text" name="ad" required />
                  </div>
                  <div className="alan">
                    <label htmlFor="btel">Telefon</label>
                    <input id="btel" type="tel" name="tel" required placeholder="05__ ___ __ __" />
                  </div>
                </div>

                <div className="grid2">
                  <div className="alan">
                    <label htmlFor="bmail">E-posta (isteğe bağlı)</label>
                    <input id="bmail" type="email" name="eposta" />
                  </div>
                  <div className="alan">
                    <label htmlFor="bkonu">Konu</label>
                    <select id="bkonu" name="konu">
                      <option>Bir firma hakkında bilgi</option>
                      <option>Şikayet bildirimi</option>
                      <option>Firma kaydı hakkında</option>
                      <option>Reklam ve sponsorluk</option>
                      <option>Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="alan">
                  <label htmlFor="bfirma">İlgili firma (biliyorsanız)</label>
                  <input id="bfirma" type="text" name="firma" placeholder="Firma adı" />
                </div>

                <div className="alan">
                  <label htmlFor="bmesaj">Mesajınız</label>
                  <textarea id="bmesaj" name="mesaj" required rows={4}
                    placeholder="Sormak istediğinizi kısaca yazın." />
                </div>

                <Captcha />

                <button type="submit" className="gonder">Gönder</button>
                <p className="kvkk">Bilgileriniz yalnızca size dönüş yapmak için kullanılır.</p>
              </form>
            </div>

            <div className="metin" style={{ marginTop: 34 }}>
              <h2>Sık gelen sorular</h2>
              <h3>Bir firmanın belgeleri var mı, nasıl öğrenirim?</h3>
              <p>
                Firma adını yazıp formu gönderin. Rehbere kayıt sırasında vergi levhası ve K3
                yetki belgesi istiyoruz; kaydı olan firmalar için bu bilgiyi size iletebiliriz.
              </p>
              <h3>Bir firmadan zarar gördüm, ne yapmalıyım?</h3>
              <p>
                Konu olarak &quot;Şikayet bildirimi&quot; seçip detayı yazın. Hakkında tekrarlayan
                şikayet gelen firmaları rehberden çıkarıyoruz.
              </p>
              <h3>Firmamı nasıl eklerim?</h3>
              <p>
                <a href="/firma-ekle">Firma ekle sayfasındaki</a> formu doldurmanız yeterli.
                Başvurular yönetici onayından sonra yayınlanır.
              </p>
            </div>
          </div>

          <YanSutun il={il} />
        </div>
      </div></section>
    </SiteKabuk>
  )
}
