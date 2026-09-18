import type { Alan } from '@/lib/admin/kaynaklar'
import { GorselYukle } from './GorselYukle'
import { ZenginEditor } from './ZenginEditor'
import { SlugAlani } from './SlugAlani'

type Props = { alan: Alan; deger: any; secenekler?: { deger: string; etiket: string }[] }

/** Tek bir form alanini tipine gore basar. */
export function AlanGiris({ alan, deger, secenekler }: Props) {
  const ortak = { id: alan.ad, name: alan.ad, required: alan.zorunlu, placeholder: alan.ipucu }

  const govde = (() => {
    switch (alan.tip) {
      case 'uzunmetin':
        return <textarea {...ortak} rows={4} defaultValue={deger ?? ''} />
      case 'html':
        return <ZenginEditor ad={alan.ad} deger={deger} />
      case 'gorsel':
        return <GorselYukle ad={alan.ad} deger={deger} />
      case 'slug':
        return <SlugAlani ad={alan.ad} deger={deger} kaynakAd={alan.slugKaynak!} />
      case 'onay':
        return (
          <label className="onay">
            <input type="checkbox" name={alan.ad} value="1" defaultChecked={Boolean(deger)} />
            <span>{alan.etiket}</span>
          </label>
        )
      case 'secim': {
        const liste = alan.secenekler ?? secenekler ?? []
        return (
          <select {...ortak} defaultValue={deger != null ? String(deger) : ''}>
            {!alan.zorunlu && <option value="">— seçiniz —</option>}
            {liste.map((s) => <option value={s.deger} key={s.deger}>{s.etiket}</option>)}
          </select>
        )
      }
      case 'sayi':
        return <input {...ortak} type="number" defaultValue={deger ?? ''} />
      case 'tarih':
        return <input {...ortak} type="date" defaultValue={deger ? String(deger).slice(0, 10) : ''} />
      case 'eposta':
        return <input {...ortak} type="email" defaultValue={deger ?? ''} />
      case 'url':
        return <input {...ortak} type="url" defaultValue={deger ?? ''} />
      default:
        return <input {...ortak} type="text" defaultValue={deger ?? ''} />
    }
  })()

  return (
    <div className={'alan' + (alan.yarim ? ' alan-yarim' : '')}>
      {alan.tip !== 'onay' && <label htmlFor={alan.ad}>{alan.etiket}</label>}
      {govde}
      {alan.yardim && <span className="ipucu">{alan.yardim}</span>}
    </div>
  )
}
