import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { yonetimIstemcisi } from '@/lib/supabase'
import { aktifKullanici } from '@/lib/oturum'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Başvurular' }

async function yetki() { if (!(await aktifKullanici())) redirect('/admin/giris') }

async function isaretle(form: FormData) {
  'use server'
  await yetki()
  const id = Number(form.get('_id'))
  const alan = String(form.get('alan'))       // okundu | yayinda
  const durum = form.get('durum') === '1'
  if (id && ['okundu', 'yayinda'].includes(alan)) {
    await yonetimIstemcisi().from('basvurular').update({ [alan]: durum }).eq('id', id)
  }
  revalidatePath('/', 'layout')
  redirect('/admin/basvurular')
}

async function sil(form: FormData) {
  'use server'
  await yetki()
  const id = Number(form.get('_id'))
  if (id) await yonetimIstemcisi().from('basvurular').delete().eq('id', id)
  revalidatePath('/', 'layout')
  redirect('/admin/basvurular?silindi=1')
}

const TUR: Record<string, string> = {
  teklif: 'Teklif talebi', firma: 'Firma başvurusu', bilgi: 'Bilgi / şikayet',
}

export default async function Basvurular({
  searchParams,
}: { searchParams: { silindi?: string; tur?: string } }) {
  const db = yonetimIstemcisi()
  const tur = searchParams.tur ?? ''

  let q = db.from('basvurular').select('*').order('id', { ascending: false }).limit(300)
  if (tur) q = q.eq('tur', tur)
  const { data } = await q
  const liste = (data ?? []) as any[]

  return (
    <>
      <div className="baslik-satir"><h1>Başvurular</h1></div>

      {searchParams.silindi && <p className="mesaj ok">Silindi.</p>}

      <div className="sekmeler">
        <a className={!tur ? 'etkin' : ''} href="/admin/basvurular">Hepsi</a>
        {Object.entries(TUR).map(([k, v]) => (
          <a key={k} className={tur === k ? 'etkin' : ''} href={`/admin/basvurular?tur=${k}`}>{v}</a>
        ))}
      </div>

      <p className="ipucu">
        Bir teklif talebini <b>Yayına al</b> dersen /talepler sayfasında görünür.
        Ad ve telefon sitede asla gösterilmez.
      </p>

      <div className="kart">
        <table className="tablo">
          <thead>
            <tr>
              <th style={{ width: 70 }}>No</th>
              <th>Gönderen</th>
              <th>Detay</th>
              <th style={{ width: 110 }}>Tarih</th>
              <th style={{ width: 230 }}></th>
            </tr>
          </thead>
          <tbody>
            {liste.map((b) => {
              let v: Record<string, string> = {}
              try { v = JSON.parse(b.veri || '{}') } catch { v = {} }
              return (
                <tr key={b.id} className={b.okundu ? '' : 'okunmamis'}>
                  <td>#{b.id}</td>
                  <td>
                    <b>{b.ad ?? '—'}</b><br />
                    {b.tel && <a href={`tel:${b.tel.replace(/\s+/g, '')}`}>{b.tel}</a>}
                    <br /><small>{TUR[b.tur] ?? b.tur}</small>
                    {b.firma && <><br /><small>Firma: {b.firma}</small></>}
                  </td>
                  <td>
                    <dl className="veri-liste">
                      {Object.entries(v).map(([k, d]) => (
                        <div key={k}><dt>{k}</dt><dd>{d}</dd></div>
                      ))}
                      {!Object.keys(v).length && <span className="bos">—</span>}
                    </dl>
                  </td>
                  <td>{new Date(b.tarih).toLocaleDateString('tr-TR')}</td>
                  <td className="sag">
                    <form action={isaretle} style={{ display: 'inline' }}>
                      <input type="hidden" name="_id" value={b.id} />
                      <input type="hidden" name="alan" value="okundu" />
                      <input type="hidden" name="durum" value={b.okundu ? '0' : '1'} />
                      <button type="submit" className="btn kucuk">
                        {b.okundu ? 'Okunmadı yap' : 'Okundu'}
                      </button>
                    </form>

                    {b.tur === 'teklif' && (
                      <form action={isaretle} style={{ display: 'inline' }}>
                        <input type="hidden" name="_id" value={b.id} />
                        <input type="hidden" name="alan" value="yayinda" />
                        <input type="hidden" name="durum" value={b.yayinda ? '0' : '1'} />
                        <button type="submit" className="btn kucuk">
                          {b.yayinda ? 'Yayından kaldır' : 'Nakliyecilere aç'}
                        </button>
                      </form>
                    )}

                    <form action={sil} style={{ display: 'inline' }}>
                      <input type="hidden" name="_id" value={b.id} />
                      <button type="submit" className="btn kucuk tehlike">Sil</button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {!liste.length && <tr><td colSpan={5} className="bos">Başvuru yok.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
