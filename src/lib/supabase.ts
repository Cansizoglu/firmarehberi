import { createClient } from '@supabase/supabase-js'

/**
 * Sunucu tarafi Supabase istemcisi.
 *
 * `cache: 'no-store'` enjekte ediliyor: supabase-js alttaki fetch'i kullaniyor ve
 * Next.js bu fetch'i varsayilan olarak cache'leyebiliyor. O zaman admin panelden
 * yapilan degisiklikler siteye yansimiyor. Tek noktadan kapatiyoruz.
 */
export function yonetimIstemcisi() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL tanimli degil.')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY tanimli degil (Vercel ortam degiskeni).')

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (input: any, init?: any) => fetch(input, { ...init, cache: 'no-store' }) },
  })
}

export const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'images'

/** Storage'daki dosya adini tam public URL'e cevirir. Zaten URL ise dokunmaz. */
export function gorselUrl(dosya: string | null | undefined): string | null {
  if (!dosya) return null
  if (/^https?:\/\//i.test(dosya)) return dosya
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  return `${url}/storage/v1/object/public/${BUCKET}/${dosya.replace(/^\/+/, '')}`
}
