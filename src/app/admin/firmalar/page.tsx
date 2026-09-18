import { yonetimIstemcisi } from '@/lib/supabase'
import { firmaSil, firmaTopluKaydet } from './eylemler'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Firmalar' }

const PAKETLER = [
  { deger: 'standart', etiket: 'Standart' },
  { deger: 'plus', etiket: 'Plus' },
  { deger: 'gold', etiket: 'Gold' },
]

export default async function Firmalar({
  searchParams,
}: { searchParams: { kaydedildi?: string; silindi?: string; hata?: string; ara?: string } }) {
  const db = yonetimIstemcisi()
  const ara = (searchParams.ara ?? '').trim()

  let q = db.from('firmalar')
    .select('id, ad, slug, tel, paket, sira, aktif, ilceler(ad)')
    .order('paket_sira').order('sira').order('id')
  if (ara) q = q.ilike('ad', `%${ara}%`)

  const { data, error } = await q.limit(500)
  const liste = (data ?? []) as any[]

  return (
    <>
      <div className="baslik-satir">
        <h1>Firmalar</h1>
        <a className="btn" href="/admin/firmalar/duzenle">+ Yeni firma</a>
      </div>

      {searchParams.kaydedildi && <p className="mesaj ok">Kaydedildi.</p>}
      {searchParams.silindi && <p className="mesaj ok">Silindi.</p>}
      {searchParams.hata && <p className="mesaj hata">{searchParams.hata}</p>}
      {error && <p className="mesaj hata">{error.message}</p>}

      <form method="get" className="ara-satir">
        <input name="ara" defaultValue={ara} placeholder="Firma adında ara…" />
        <button type="submit" className="btn ikincil">Ara</button>
        {ara && <a className="btn ikincil" href="/admin/firmalar">Temizle</a>}
      </form>

      <p className="ipucu">
        Paket ve sırayı buradan toplu değiştirebilirsin. Gold firmalar listelerde en üstte çıkar.
      </p>

      <form action={firmaTopluKaydet}>
        <div className="kart">
          <table className="tablo">
            <thead>
              <tr>
                <th>Firma</th><th>İlçe</th><th>Telefon</th>
                <th style={{ width: 120 }}>Paket</th>
                <th style={{ width: 80 }}>Sıra</th>
                <th>Yayında</th>
                <th style={{ width: 150 }}></th>
              </tr>
            </thead>
            <tbody>
              {liste.map((f) => (
                <tr key={f.id}>
                  <td>
                    <input type="hidden" name="id" value={f.id} />
                    <a href={`/firma/${f.slug}.html`} target="_blank" rel="noopener">{f.ad}</a>
                  </td>
                  <td>{f.ilceler?.ad ?? '—'}</td>
                  <td>{f.tel ?? '—'}</td>
                  <td>
                    <select name={`paket_${f.id}`} defaultValue={f.paket}>
                      {PAKETLER.map((p) => <option value={p.deger} key={p.deger}>{p.etiket}</option>)}
                    </select>
                  </td>
                  <td><input type="number" name={`sira_${f.id}`} defaultValue={f.sira} style={{ width: 70 }} /></td>
                  <td>
                    <span className={'rozet ' + (f.aktif ? 'evet' : 'hayir')}>
                      {f.aktif ? 'Evet' : 'Hayır'}
                    </span>
                  </td>
                  <td className="sag">
                    <a className="btn kucuk" href={`/admin/firmalar/duzenle?id=${f.id}`}>Düzenle</a>
                  </td>
                </tr>
              ))}
              {!liste.length && <tr><td colSpan={7} className="bos">Kayıt bulunamadı.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="form-alt">
          <button type="submit" className="btn">Paket ve sıraları kaydet</button>
          <span className="ipucu">{liste.length} firma listeleniyor</span>
        </div>
      </form>

      {/* Silme ayri form: toplu kaydet formunun icinde olmasin */}
      <div className="kart" style={{ marginTop: 20 }}>
        <h2>Firma sil</h2>
        <p className="ipucu">Silinen firma geri gelmez; yayından kaldırmak için düzenle ekranından &quot;Yayında&quot; kutusunu kaldırman yeterli.</p>
        <form action={firmaSil} className="ara-satir">
          <select name="_id" required defaultValue="">
            <option value="" disabled>— firma seç —</option>
            {liste.map((f) => <option value={f.id} key={f.id}>{f.ad}</option>)}
          </select>
          <button type="submit" className="btn tehlike">Sil</button>
        </form>
      </div>
    </>
  )
}
