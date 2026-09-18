import { kategoriler } from '@/lib/veri'
import { basvuruGonder } from '@/app/eylemler/gonder'
import { Captcha } from './Captcha'

const KATLAR = [
  'Villa / Müstakil', 'Giriş Kat',
  ...Array.from({ length: 20 }, (_, i) => `${i + 1}. Kat`),
  '20+ Kat',
]

export async function TeklifFormu({
  baslik = 'Ücretsiz Taşınma Teklifi Alın',
  aciklama = 'Formu doldurun, bölgenizdeki nakliyat firmalarından fiyat teklifi alın. Hiçbir ücret ödemezsiniz.',
  firma = '',
}: { baslik?: string; aciklama?: string; firma?: string }) {
  const katlar = await kategoriler()

  return (
    <div className="form-kart" id="teklif">
      <h2>{baslik}</h2>
      <p className="aciklama">{aciklama}</p>

      <form action={basvuruGonder}>
        <input type="hidden" name="tur" value="teklif" />
        <input type="hidden" name="firma" value={firma} />
        <input type="text" name="_bot" className="botfield" tabIndex={-1} autoComplete="off" />

        <div className="grid2">
          <div className="alan">
            <label htmlFor="ad">Ad Soyad</label>
            <input id="ad" type="text" name="ad" required />
          </div>
          <div className="alan">
            <label htmlFor="tel">Telefon</label>
            <input id="tel" type="tel" name="tel" required placeholder="05__ ___ __ __" />
          </div>
        </div>

        <div className="grid2">
          <div className="alan">
            <label htmlFor="nereden">Nereden</label>
            <input id="nereden" type="text" name="nereden" required placeholder="Mahalle / ilçe" />
          </div>
          <div className="alan">
            <label htmlFor="nereye">Nereye</label>
            <input id="nereye" type="text" name="nereye" required placeholder="Mahalle / ilçe" />
          </div>
        </div>

        <div className="grid2">
          <div className="alan">
            <label htmlFor="ck">Çıkış Katı</label>
            <select id="ck" name="cikis_kat" required>
              <option value="">Seçiniz</option>
              {KATLAR.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="alan">
            <label htmlFor="vk">Varış Katı</label>
            <select id="vk" name="varis_kat" required>
              <option value="">Seçiniz</option>
              {KATLAR.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <div className="grid2">
          <div className="alan">
            <label htmlFor="evtip">Ev Tipi</label>
            <select id="evtip" name="ev_tipi">
              <option value="">Seçiniz</option>
              <option>1+1</option><option>2+1</option><option>3+1</option>
              <option>4+1</option><option>5+1 ve üzeri</option>
              <option>Ofis / İşyeri</option><option>Parça Eşya</option>
            </select>
          </div>
          <div className="alan">
            <label htmlFor="tarih">Taşınma Tarihi</label>
            <input id="tarih" type="date" name="tarih" />
          </div>
        </div>

        <div className="grid2">
          <div className="alan">
            <label htmlFor="asansor">Asansör Durumu</label>
            <select id="asansor" name="asansor">
              <option value="">Seçiniz</option>
              <option>Her iki adreste bina asansörü var</option>
              <option>Sadece çıkışta asansör var</option>
              <option>Sadece varışta asansör var</option>
              <option>Asansör yok, dış cephe asansörü gerekli</option>
            </select>
          </div>
          <div className="alan">
            <label htmlFor="hizmet">İstenen Hizmet</label>
            <select id="hizmet" name="hizmet">
              <option value="">Seçiniz</option>
              {katlar.map((k) => <option key={k.id}>{k.ad}</option>)}
            </select>
          </div>
        </div>

        <div className="alan">
          <label htmlFor="notu">Eklemek İstedikleriniz</label>
          <textarea id="notu" name="notu"
            placeholder="Piyano, kasa, beyaz eşya sayısı, özel isteğiniz..." />
        </div>

        <Captcha />

        <button type="submit" className="gonder">Teklif İste</button>
        <p className="kvkk">Bilgileriniz yalnızca teklif için kullanılır, üçüncü kişilerle paylaşılmaz.</p>
      </form>
    </div>
  )
}
