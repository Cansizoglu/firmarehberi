import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/** /admin altini korur; giris yoksa /admin/giris'e yollar. */
export async function middleware(istek: NextRequest) {
  let yanit = NextResponse.next({ request: { headers: istek.headers } })

  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (ad: string) => istek.cookies.get(ad)?.value,
        set: (ad: string, deger: string, secenek: CookieOptions) => {
          yanit.cookies.set({ name: ad, value: deger, ...secenek })
        },
        remove: (ad: string, secenek: CookieOptions) => {
          yanit.cookies.set({ name: ad, value: '', ...secenek })
        },
      },
    },
  )

  const { data: { user } } = await db.auth.getUser()
  const yol = istek.nextUrl.pathname
  const girisSayfasi = yol === '/admin/giris'

  if (!user && !girisSayfasi) {
    const adres = istek.nextUrl.clone()
    adres.pathname = '/admin/giris'
    adres.searchParams.set('geri', yol)
    return NextResponse.redirect(adres)
  }

  if (user && girisSayfasi) {
    const adres = istek.nextUrl.clone()
    adres.pathname = '/admin'
    adres.search = ''
    return NextResponse.redirect(adres)
  }

  return yanit
}

export const config = { matcher: ['/admin/:path*'] }
