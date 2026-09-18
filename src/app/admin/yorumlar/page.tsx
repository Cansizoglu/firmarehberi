import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { yonetimIstemcisi } from '@/lib/supabase'
import { aktifKullanici } from '@/lib/oturum'
import { Yildiz } from '@/components/site/Yildiz'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Yorumlar' }

async function yetki() { if (!(await aktifKullanici())) redirect('/admin/giris') }

async function onayla(form: FormData) {
  'use server'
  await yetki()
  const id = Number(form.get('_id'))
  const durum = form.get('durum') === '1'
  if (id) await yonetimIstemcisi().from('yorumlar').update({ onayli: durum }).eq('id', id)
  revalidatePath('/', 'layout')
  redirect('/admin/yorumlar')
}

async function sil(form: FormData) {
  'use server'
  await yetki()
  const id = Number(form.get('_id'))
  if (id) await yonetimIstemcisi().from('yorumlar').delete().eq('id', id)
  revalidatePath('/', 'layout')
  redirect('/admin/yorumlar?silindi=1')
}

async function elleEkle(form: FormData) {
  'use server'
  await yetki()
  const isim = String(form.get('isim') ?? '').trim()
  const yorum = String(form.get('yorum') ?? '').trim()
  const firmaId = Number(form.get('firma_id') ?? 0)
  if (!isim || !yorum || !firmaId) redirect('/admin/yorumlar?hata=Eksik+alan')

  await yonetimIstemcisi().from('yorumlar').insert({
    firma_id: firmaId, isim,
    ilce: String(form.get('ilce') ?? '').trim() || null,
    puan: Math.min(5, Math.max(1, Number(form.get('puan') ?? 5))),
    yorum,
    tarih: String(form.get('tarih') ?? '').trim() || new Date().toISOString().slice(0, 10),
    onayli: true,
  })
  revalidatePath('/', 'layout')
  redirect('/admin/yorumlar?kaydedildi=1')
}

export default async function Yorumlar({
  searchParams,
}: { searchParams: { kaydedildi?: string; silindi?: string; hata?: string } }) {
  const db = yonetimIstemcisi()
  const [{ data: liste }, { data: firmalar }] = await Promise.all([
    db.from('yorumlar').select('*, firmalar(ad, slug)')
      .order('onayli').order('id', { ascending: false }).limit(300),
    db.from('firmalar').select('id, ad').eq('aktif', true).order('ad'),
  ])

  const hepsi = (liste ?? []) as any[]
  const bekleyen = hepsi.filter((y) => !y.onayli)
  const onayli = hepsi.filter((y) => y.onayli)

  const satir = (y: any) => (
    <tr key={y.id}>
      <td>
        <b>{y.isim}</b>{y.ilce ? ` — ${y.ilce}` : ''}
        <br /><Yildiz puan={y.puan} />
        <p style={{ margin: '6px 0 0' }}>{y.yorum}</p>
      </td>
      <td>{y.firmalar?.ad ?? '—'}</td>
      <td>{y.tarih}</td>
      <td className="sag">
        <form action={onayla} style={{ display: 'inline' }}>
          <input type="hidden" name="_id" value={y.id} />
          <input type="hidden" name="durum" value={y.onayli ? '0' : '1'} />
          <button type="submit" className="btn kucuk">
            {y.onayli ? 'Yayından kaldır' : 'Onayla'}
          </button>
        </form>
        <form action={sil} style={{ display: 'inline' }}>
          <input type="hidden" name="_id" value={y.id} />
          <button type="submit" className="btn kucuk tehlike">Sil</button>
        </form>
      </td>
    </tr>
  )

  return (
    <>
      <div className="baslik-satir"><h1>Yorumlar</h1></div>

      {searchParams.kaydedildi && <p className="mesaj ok">Kaydedildi.</p>}
      {searchParams.silindi && <p className="mesaj ok">Silindi.</p>}
      {searchParams.hata && <p className="mesaj hata">{searchParams.hata}</p>}

      <p className="ipucu">
        Onaylanan yorum firma puanını hesaplar ve sayfaya AggregateRating şeması olarak basılır.
        Google yıldızları buradan beslenir — bu yüzden <b>sadece gerçek yorum girin</b>.
      </p>

      <div className="kart">
        <h2>Onay bekleyenler ({bekleyen.length})</h2>
        <table className="tablo">
          <thead><tr><th>Yorum</th><th>Firma</th><th>Tarih</th><th style={{ width: 210 }}></th></tr></thead>
          <tbody>
            {bekleyen.map(satir)}
            {!bekleyen.length && <tr><td colSpan={4} className="bos">Onay bekleyen yorum yok.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="kart" style={{ marginTop: 20 }}>
        <h2>Elle yorum ekle</h2>
        <p className="ipucu">Müşteriden telefonla aldığın yorumu buradan girebilirsin.</p>
        <form action={elleEkle} className="form">
          <div className="alan-izgara">
            <div className="alan alan-yarim">
              <label htmlFor="firma_id">Firma</label>
              <select id="firma_id" name="firma_id" required defaultValue="">
                <option value="" disabled>— seçiniz —</option>
                {(firmalar ?? []).map((f: any) => <option value={f.id} key={f.id}>{f.ad}</option>)}
              </select>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="isim">Yorumu yazan</label>
              <input id="isim" name="isim" required />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="ilce">İlçe</label>
              <input id="ilce" name="ilce" />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="puan">Puan</label>
              <select id="puan" name="puan" defaultValue="5">
                {[5, 4, 3, 2, 1].map((p) => <option value={p} key={p}>{p}</option>)}
              </select>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="tarih">Tarih</label>
              <input id="tarih" name="tarih" type="date" />
            </div>
            <div className="alan">
              <label htmlFor="yorum">Yorum</label>
              <textarea id="yorum" name="yorum" rows={3} required />
            </div>
          </div>
          <div className="form-alt"><button type="submit" className="btn">Yorumu ekle</button></div>
        </form>
      </div>

      <div className="kart" style={{ marginTop: 20 }}>
        <h2>Yayındaki yorumlar ({onayli.length})</h2>
        <table className="tablo">
          <thead><tr><th>Yorum</th><th>Firma</th><th>Tarih</th><th style={{ width: 210 }}></th></tr></thead>
          <tbody>
            {onayli.map(satir)}
            {!onayli.length && <tr><td colSpan={4} className="bos">Yayında yorum yok.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
