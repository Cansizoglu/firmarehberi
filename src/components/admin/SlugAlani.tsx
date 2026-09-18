'use client'

import { useEffect, useRef, useState } from 'react'

const TR: Record<string, string> = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
}

const slugla = (s: string) =>
  s.replace(/[çğıöşüÇĞİIÖŞÜ]/g, (c) => TR[c] ?? c)
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 180)

/** Kaynak alan yazilirken slug'i otomatik doldurur; kullanici elle degistirebilir. */
export function SlugAlani({ ad, deger, kaynakAd }: {
  ad: string; deger?: string | null; kaynakAd: string
}) {
  const [slug, setSlug] = useState(deger || '')
  const elle = useRef(Boolean(deger))

  useEffect(() => {
    const kaynak = document.querySelector<HTMLInputElement>(`[name="${kaynakAd}"]`)
    if (!kaynak) return

    const dinle = () => { if (!elle.current) setSlug(slugla(kaynak.value)) }
    kaynak.addEventListener('input', dinle)
    return () => kaynak.removeEventListener('input', dinle)
  }, [kaynakAd])

  return (
    <input
      name={ad}
      value={slug}
      required
      onChange={(e) => { elle.current = true; setSlug(e.target.value) }}
      onBlur={(e) => setSlug(slugla(e.target.value))}
    />
  )
}
