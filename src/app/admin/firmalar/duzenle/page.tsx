import { notFound } from 'next/navigation'
import { yonetimIstemcisi, gorselUrl } from '@/lib/supabase'
import { SlugAlani } from '@/components/admin/SlugAlani'
import { ZenginEditor } from '@/components/admin/ZenginEditor'
import { GorselYukle } from '@/components/admin/GorselYukle'
import { firmaKaydet, galeriEkle, galeriKapakYap, galeriSil } from '../eylemler'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Firma düzenle' }

type Props = { searchParams: { id?: string; hata?: string } }

export default async function FirmaDuzenle({ searchParams }: Props) {
  const db = yonetimIstemcisi()
  const id = Number(searchParams.id ?? 0)

  const [{ data: iller }, { data: ilceler }, { data: kategoriler }] = await Promise.all([
    db.from('iller').select('id, ad').order('ad'),
    db.from('ilceler').select('id, ad, il_id').order('ad'),
    db.from('kategoriler').select('id, ad').order('sira').order('ad'),
  ])

  let f: Record<string, any> = { paket: 'standart', aktif: true, sira: 0 }
  let secili: number[] = []
  let galeri: any[] = []

  if (id) {
    const { data } = await db.from('firmalar').select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    f = data

    const [{ data: fk }, { data: g }] = await Promise.all([
      db.from('firma_kategori').select('kategori_id').eq('firma_id', id),
      db.from('galeri').select('*').eq('firma_id', id)
        .order('kapak', { ascending: false }).order('sira').order('id'),
    ])
    secili = (fk ?? []).map((r: any) => r.kategori_id)
    galeri = g ?? []
  }

  return (
    <>
      <div className="baslik-satir">
        <h1>{id ? 'Firma düzenle' : 'Yeni firma'}</h1>
        <a className="btn ikincil" href="/admin/firmalar">← Firmalar</a>
      </div>

      {searchParams.hata && <p className="mesaj hata">{searchParams.hata}</p>}

      <form action={firmaKaydet} className="kart form">
        {id > 0 && <input type="hidden" name="_id" value={id} />}

        <h2>Temel bilgiler</h2>
        <div className="alan-izgara">
          <div className="alan alan-yarim">
            <label htmlFor="ad">Firma adı</label>
            <input id="ad" name="ad" required defaultValue={f.ad ?? ''} />
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="slug">Adres (slug)</label>
            <SlugAlani ad="slug" deger={f.slug} kaynakAd="ad" />
            <span className="ipucu">Adres: /firma/{f.slug || 'firma-adi'}.html</span>
          </div>

          <div className="alan alan-yarim">
            <label htmlFor="il_id">İl</label>
            <select id="il_id" name="il_id" required defaultValue={f.il_id ?? ''}>
              <option value="" disabled>— seçiniz —</option>
              {(iller ?? []).map((x: any) => <option value={x.id} key={x.id}>{x.ad}</option>)}
            </select>
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="ilce_id">İlçe</label>
            <select id="ilce_id" name="ilce_id" defaultValue={f.ilce_id ?? ''}>
              <option value="">— yok —</option>
              {(ilceler ?? []).map((x: any) => <option value={x.id} key={x.id}>{x.ad}</option>)}
            </select>
          </div>

          <div className="alan alan-yarim">
            <label htmlFor="mahalle">Mahalle</label>
            <input id="mahalle" name="mahalle" defaultValue={f.mahalle ?? ''} />
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="adres">Açık adres</label>
            <input id="adres" name="adres" defaultValue={f.adres ?? ''} />
          </div>

          <div className="alan alan-yarim">
            <label htmlFor="tel">Telefon</label>
            <input id="tel" name="tel" defaultValue={f.tel ?? ''} placeholder="0532 123 45 67" />
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="tel2">İkinci telefon</label>
            <input id="tel2" name="tel2" defaultValue={f.tel2 ?? ''} />
          </div>

          <div className="alan alan-yarim">
            <label htmlFor="eposta">E-posta</label>
            <input id="eposta" name="eposta" type="email" defaultValue={f.eposta ?? ''} />
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="web">Web sitesi</label>
            <input id="web" name="web" type="url" defaultValue={f.web ?? ''} placeholder="https://" />
          </div>
        </div>

        <h2>Hizmetler</h2>
        <div className="onay-izgara">
          {(kategoriler ?? []).map((k: any) => (
            <label className="onay" key={k.id}>
              <input type="checkbox" name="kategoriler" value={k.id}
                defaultChecked={secili.includes(k.id)} />
              <span>{k.ad}</span>
            </label>
          ))}
        </div>

        <h2>Harita</h2>
        <div className="alan-izgara">
          <div className="alan">
            <label htmlFor="harita_link">Harita linki</label>
            <input id="harita_link" name="harita_link" defaultValue={f.harita_link ?? ''}
              placeholder="https://maps.app.goo.gl/..." />
            <span className="ipucu">&quot;Yol Tarifi Al&quot; butonu buraya gider.</span>
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="enlem">Enlem</label>
            <input id="enlem" name="enlem" defaultValue={f.enlem ?? ''} placeholder="37.0000000" />
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="boylam">Boylam</label>
            <input id="boylam" name="boylam" defaultValue={f.boylam ?? ''} placeholder="35.3213000" />
          </div>
          <div className="alan">
            <label htmlFor="place_id">Google Place ID</label>
            <input id="place_id" name="place_id" defaultValue={f.place_id ?? ''} />
            <span className="ipucu">
              Enlem/boylam girersen gömülü harita tam noktayı gösterir; boş bırakırsan adrese göre arar.
            </span>
          </div>
        </div>

        <h2>Tanıtım ve puan</h2>
        <div className="alan-izgara">
          <div className="alan">
            <label htmlFor="aciklama">Firma açıklaması</label>
            <ZenginEditor ad="aciklama" deger={f.aciklama} />
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="g_puan">Google puanı</label>
            <input id="g_puan" name="g_puan" defaultValue={f.g_puan ?? ''} placeholder="4.8" />
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="g_puan_n">Google değerlendirme sayısı</label>
            <input id="g_puan_n" name="g_puan_n" type="number" defaultValue={f.g_puan_n ?? ''} />
          </div>
          <div className="alan">
            <label htmlFor="canonical">Canonical adres</label>
            <input id="canonical" name="canonical" type="url" defaultValue={f.canonical ?? ''} />
            <span className="ipucu">Boş bırakırsan kendi adresi kullanılır.</span>
          </div>
        </div>

        <h2>Listeleme</h2>
        <div className="alan-izgara">
          <div className="alan alan-yarim">
            <label htmlFor="paket">Paket</label>
            <select id="paket" name="paket" defaultValue={f.paket ?? 'standart'}>
              <option value="standart">Standart</option>
              <option value="plus">Plus</option>
              <option value="gold">Gold — sarı çerçeve, listede en üstte</option>
            </select>
          </div>
          <div className="alan alan-yarim">
            <label htmlFor="sira">Sıra</label>
            <input id="sira" name="sira" type="number" defaultValue={f.sira ?? 0} />
          </div>
          <div className="alan alan-yarim">
            <label className="onay">
              <input type="checkbox" name="merkez" defaultChecked={Boolean(f.merkez)} />
              <span>Merkez firması (ana sayfadaki merkez bölümünde çıkar)</span>
            </label>
          </div>
          <div className="alan alan-yarim">
            <label className="onay">
              <input type="checkbox" name="one_cikan" defaultChecked={Boolean(f.one_cikan)} />
              <span>Öne çıkan</span>
            </label>
          </div>
          <div className="alan alan-yarim">
            <label className="onay">
              <input type="checkbox" name="aktif" defaultChecked={id ? Boolean(f.aktif) : true} />
              <span>Yayında</span>
            </label>
          </div>
        </div>

        <div className="form-alt">
          <button type="submit" className="btn">Kaydet</button>
          <a className="btn ikincil" href="/admin/firmalar">Vazgeç</a>
        </div>
      </form>

      {id > 0 && (
        <div className="kart" id="galeri" style={{ marginTop: 24 }}>
          <h2>Fotoğraf galerisi</h2>
          <p className="ipucu">
            &quot;Kapak&quot; seçtiğin görsel firma kartlarında ve sosyal paylaşımda kullanılır.
          </p>

          <div className="galeri-izgara">
            {galeri.map((g) => (
              <div className={'galeri-oge' + (g.kapak ? ' kapak' : '')} key={g.id}>
                <img src={gorselUrl(g.dosya)!} alt={g.alt_yazi || ''} />
                {g.kapak && <span className="rozet evet">Kapak</span>}
                <div className="galeri-islem">
                  {!g.kapak && (
                    <form action={galeriKapakYap}>
                      <input type="hidden" name="_id" value={g.id} />
                      <input type="hidden" name="firma_id" value={id} />
                      <button type="submit" className="btn kucuk">Kapak yap</button>
                    </form>
                  )}
                  <form action={galeriSil}>
                    <input type="hidden" name="_id" value={g.id} />
                    <input type="hidden" name="firma_id" value={id} />
                    <button type="submit" className="btn kucuk tehlike">Sil</button>
                  </form>
                </div>
              </div>
            ))}
            {!galeri.length && <p className="bos">Henüz görsel eklenmemiş.</p>}
          </div>

          <form action={galeriEkle} className="form" style={{ marginTop: 16 }}>
            <input type="hidden" name="firma_id" value={id} />
            <div className="alan-izgara">
              <div className="alan alan-yarim">
                <label>Yeni görsel</label>
                <GorselYukle ad="dosya" />
              </div>
              <div className="alan alan-yarim">
                <label htmlFor="alt_yazi">Alt yazı</label>
                <input id="alt_yazi" name="alt_yazi" />
                <label className="onay" style={{ marginTop: 10 }}>
                  <input type="checkbox" name="kapak" />
                  <span>Kapak olarak işaretle</span>
                </label>
              </div>
            </div>
            <div className="form-alt">
              <button type="submit" className="btn">Galeriye ekle</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
