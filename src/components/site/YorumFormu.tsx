import { yorumGonder } from '@/app/eylemler/gonder'
import { Captcha } from './Captcha'

/** Ziyaretci yorumu — panele onay bekliyor olarak duser. */
export async function YorumFormu({ firmaId, geri }: { firmaId: number; geri: string }) {
  return (
    <div className="form-kart" style={{ marginTop: 20, maxWidth: 640 }}>
      <h2>Deneyiminizi paylaşın</h2>
      <p className="aciklama">Yorumlar kontrol edildikten sonra yayınlanır.</p>

      <form action={yorumGonder}>
        <input type="hidden" name="firma_id" value={firmaId} />
        <input type="hidden" name="geri" value={geri} />
        <input type="text" name="_bot" className="botfield" tabIndex={-1} autoComplete="off" />

        <div className="grid2">
          <div className="alan">
            <label htmlFor="yi">Adınız</label>
            <input id="yi" type="text" name="isim" required />
          </div>
          <div className="alan">
            <label htmlFor="yp">Puanınız</label>
            <select id="yp" name="puan" required defaultValue="5">
              <option value="5">5 — Çok memnun kaldım</option>
              <option value="4">4 — Memnun kaldım</option>
              <option value="3">3 — İdare eder</option>
              <option value="2">2 — Memnun kalmadım</option>
              <option value="1">1 — Hiç memnun kalmadım</option>
            </select>
          </div>
        </div>

        <div className="alan">
          <label htmlFor="yy2">Yorumunuz</label>
          <textarea id="yy2" name="yorum" required
            placeholder="Hangi ilçeden hangi ilçeye taşındınız, ekip nasıldı, eşyalarınıza zarar geldi mi?" />
        </div>

        <Captcha />

        <button type="submit" className="gonder">Yorumu Gönder</button>
      </form>
    </div>
  )
}
