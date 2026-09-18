import { notFound } from 'next/navigation'
import { yonetimIstemcisi } from '@/lib/supabase'
import { kaynakBul } from '@/lib/admin/kaynaklar'
import { kayitKaydet } from '@/app/admin/eylemler'
import { AlanGiris } from '@/components/admin/Alanlar'

export const dynamic = 'force-dynamic'

type Props = {
  params: { kaynak: string }
  searchParams: { id?: string; hata?: string }
}

export async function generateMetadata({ params }: Props) {
  const k = kaynakBul(params.kaynak)
  return { title: k ? `${k.tekil} düzenle` : 'Panel' }
}

export default async function Duzenle({ params, searchParams }: Props) {
  const kaynak = kaynakBul(params.kaynak)
  if (!kaynak) notFound()

  const db = yonetimIstemcisi()
  const id = Number(searchParams.id ?? 0)

  let kayit: Record<string, any> = {}
  if (id) {
    const { data } = await db.from(kaynak.tablo).select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    kayit = data
  }

  // 'secim' alanlari icin baska tablodan secenekleri topla
  const secenekler: Record<string, { deger: string; etiket: string }[]> = {}
  for (const alan of kaynak.alanlar) {
    if (alan.tip !== 'secim' || !alan.kaynakTablo) continue
    const { data } = await db.from(alan.kaynakTablo).select('id, ad').order('ad')
    secenekler[alan.ad] = (data ?? []).map((r: any) => ({ deger: String(r.id), etiket: r.ad }))
  }

  return (
    <>
      <div className="baslik-satir">
        <h1>{id ? `${kaynak.tekil} düzenle` : `Yeni ${kaynak.tekil.toLocaleLowerCase('tr')}`}</h1>
        <a className="btn ikincil" href={`/admin/${kaynak.anahtar}`}>← {kaynak.cogul}</a>
      </div>

      {searchParams.hata && <p className="mesaj hata">{searchParams.hata}</p>}

      <form action={kayitKaydet} className="kart form">
        <input type="hidden" name="_kaynak" value={kaynak.anahtar} />
        {id > 0 && <input type="hidden" name="_id" value={id} />}

        <div className="alan-izgara">
          {kaynak.alanlar.map((alan) => (
            <AlanGiris key={alan.ad} alan={alan}
              deger={kayit[alan.ad]} secenekler={secenekler[alan.ad]} />
          ))}
        </div>

        <div className="form-alt">
          <button type="submit" className="btn">Kaydet</button>
          <a className="btn ikincil" href={`/admin/${kaynak.anahtar}`}>Vazgeç</a>
        </div>
      </form>
    </>
  )
}
