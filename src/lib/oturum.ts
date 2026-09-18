import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Admin paneli icin oturum istemcisi. Supabase Auth kullaniyor;
 * PHP surumundeki kullanicilar tablosunun yerine geciyor.
 */
export function oturumIstemcisi() {
  const kutu = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (ad: string) => kutu.get(ad)?.value,
        set: (ad: string, deger: string, secenek: CookieOptions) => {
          try { kutu.set({ name: ad, value: deger, ...secenek }) } catch { /* server component */ }
        },
        remove: (ad: string, secenek: CookieOptions) => {
          try { kutu.set({ name: ad, value: '', ...secenek }) } catch { /* server component */ }
        },
      },
    },
  )
}

/** Giris yapmis kullaniciyi dondurur, yoksa null. */
export async function aktifKullanici() {
  const { data } = await oturumIstemcisi().auth.getUser()
  return data.user ?? null
}
