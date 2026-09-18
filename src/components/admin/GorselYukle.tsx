'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'images'

/** Supabase Storage'a yukler, tam public URL'i gizli alana yazar. */
export function GorselYukle({ ad, deger }: { ad: string; deger?: string | null }) {
  const [url, setUrl] = useState(deger || '')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')

  async function sec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0]
    if (!dosya) return

    if (dosya.size > 6 * 1024 * 1024) {
      setHata('Dosya 6 MB’tan büyük olamaz.')
      return
    }

    setHata('')
    setYukleniyor(true)
    try {
      const db = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      const uzanti = dosya.name.split('.').pop()?.toLowerCase() || 'jpg'
      const yol = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${uzanti}`

      const { error } = await db.storage.from(BUCKET).upload(yol, dosya, {
        cacheControl: '3600', upsert: false,
      })
      if (error) throw error

      const { data } = db.storage.from(BUCKET).getPublicUrl(yol)
      setUrl(data.publicUrl)
    } catch (err: any) {
      setHata(err?.message || 'Yüklenemedi.')
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div className="gorsel-yukle">
      <input type="hidden" name={ad} value={url} />

      {url && (
        <div className="gorsel-onizleme">
          <img src={url} alt="" />
          <button type="button" className="sil-kucuk" onClick={() => setUrl('')}>Kaldır</button>
        </div>
      )}

      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={sec} disabled={yukleniyor} />
      {yukleniyor && <span className="ipucu">Yükleniyor…</span>}
      {hata && <span className="mesaj hata">{hata}</span>}
      <span className="ipucu">JPG, PNG veya WEBP — en fazla 6 MB.</span>
    </div>
  )
}
