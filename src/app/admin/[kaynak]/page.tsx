import { notFound } from 'next/navigation'
import { yonetimIstemcisi } from '@/lib/supabase'
import { kaynakBul } from '@/lib/admin/kaynaklar'
import { kayitSil } from '@/app/admin/eylemler'

export const dynamic = 'force-dynamic'

type Props = {
  params: { kaynak: string }
  searchParams: { kaydedildi?: string; silindi?: string; hata?: string }
}

export async function generateMetadata({ params }: Props) {
  const k = kaynakBul(params.kaynak)
  return { title: k?.cogul ?? 'Panel' }
}

function hucre(deger: any, tip?: string) {
  if (tip === 'onay') {
    return <span className={'rozet ' + (deger ? 'evet' : 'hayir')}>{deger ? 'Evet' : 'Hayır'}</span>
  }
  if (tip === 'tarih') return deger ? new Date(deger).toLocaleDateString('tr-TR') : '—'
  if (deger == null || deger === '') return '—'
  const s = String(deger)
  return s.length > 70 ? s.slice(0, 70) + '…' : s
}

export default async function Liste({ params, searchParams }: Props) {
  const kaynak = kaynakBul(params.kaynak)
  if (!kaynak) notFound()

  const db = yonetimIstemcisi()
  let q = db.from(kaynak.tablo).select('*')
  for (const s of kaynak.sirala) q = q.order(s.ad, { ascending: s.artan, nullsFirst: false })
  const { data, error } = await q.limit(500)

  return (
    <>
      <div className="baslik-satir">
        <h1>{kaynak.cogul}</h1>
        <a className="btn" href={`/admin/${kaynak.anahtar}/duzenle`}>+ Yeni {kaynak.tekil.toLocaleLowerCase('tr')}</a>
      </div>

      {searchParams.kaydedildi && <p className="mesaj ok">Kaydedildi.</p>}
      {searchParams.silindi && <p className="mesaj ok">Silindi.</p>}
      {searchParams.hata && <p className="mesaj hata">{searchParams.hata}</p>}
      {error && <p className="mesaj hata">{error.message}</p>}
      {kaynak.not && <p className="ipucu">{kaynak.not}</p>}

      <div className="kart">
        <table className="tablo">
          <thead>
            <tr>
              {kaynak.sutunlar.map((s) => <th key={s.ad}>{s.etiket}</th>)}
              <th style={{ width: 150 }}></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id}>
                {kaynak.sutunlar.map((s) => <td key={s.ad}>{hucre(r[s.ad], s.tip)}</td>)}
                <td className="sag">
                  <a className="btn kucuk" href={`/admin/${kaynak.anahtar}/duzenle?id=${r.id}`}>Düzenle</a>
                  <form action={kayitSil} style={{ display: 'inline' }}>
                    <input type="hidden" name="_kaynak" value={kaynak.anahtar} />
                    <input type="hidden" name="_id" value={r.id} />
                    <button type="submit" className="btn kucuk tehlike"
                      formNoValidate>Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {!(data ?? []).length && (
              <tr><td colSpan={kaynak.sutunlar.length + 1} className="bos">Henüz kayıt yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
