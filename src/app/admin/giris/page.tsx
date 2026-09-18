import { redirect } from 'next/navigation'
import { oturumIstemcisi } from '@/lib/oturum'
import { ayarlar } from '@/lib/veri'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Panel Girişi', robots: { index: false, follow: false } }

async function girisYap(form: FormData) {
  'use server'
  const eposta = String(form.get('eposta') ?? '').trim()
  const sifre = String(form.get('sifre') ?? '')
  const geri = String(form.get('geri') ?? '/admin')

  const { error } = await oturumIstemcisi().auth.signInWithPassword({ email: eposta, password: sifre })
  if (error) redirect(`/admin/giris?hata=1&geri=${encodeURIComponent(geri)}`)
  redirect(geri.startsWith('/admin') ? geri : '/admin')
}

export default async function Giris({
  searchParams,
}: { searchParams: { hata?: string; geri?: string } }) {
  const a = await ayarlar()

  return (
    <html lang="tr">
      <head><link rel="stylesheet" href="/assets/admin.css" /></head>
      <body className="giris-govde">
        <div className="giris-kutu">
          <h1>{a.site_adi || 'Rehber'} — Panel</h1>

          {searchParams.hata && (
            <p className="mesaj hata">E-posta veya şifre hatalı.</p>
          )}

          <form action={girisYap}>
            <input type="hidden" name="geri" value={searchParams.geri || '/admin'} />
            <div className="alan">
              <label htmlFor="eposta">E-posta</label>
              <input id="eposta" name="eposta" type="email" required autoFocus />
            </div>
            <div className="alan">
              <label htmlFor="sifre">Şifre</label>
              <input id="sifre" name="sifre" type="password" required />
            </div>
            <button type="submit" className="btn">Giriş yap</button>
          </form>

          <p className="ipucu"><a href="/">← Siteye dön</a></p>
        </div>
      </body>
    </html>
  )
}
