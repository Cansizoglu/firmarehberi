import { NextResponse } from 'next/server'
import { yonetimIstemcisi } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/** PHP'deki banner-git.php: tiklamayi sayar, sonra hedefe yonlendirir. */
export async function GET(istek: Request) {
  const url = new URL(istek.url)
  const id = Number(url.searchParams.get('b'))
  const harita = url.searchParams.get('h') === 'harita'

  if (!id) return NextResponse.redirect(new URL('/', url.origin))

  const db = yonetimIstemcisi()
  const { data } = await db.from('bannerlar')
    .select('link, harita, tiklama').eq('id', id).maybeSingle()

  if (!data) return NextResponse.redirect(new URL('/', url.origin))

  await db.from('bannerlar').update({ tiklama: (data.tiklama ?? 0) + 1 }).eq('id', id)

  const hedef = (harita ? data.harita : data.link) || data.link || data.harita
  if (!hedef || !/^https?:\/\//i.test(hedef)) {
    return NextResponse.redirect(new URL('/', url.origin))
  }
  return NextResponse.redirect(hedef, { status: 302 })
}
