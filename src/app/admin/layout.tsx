import { redirect } from 'next/navigation'
import { aktifKullanici, oturumIstemcisi } from '@/lib/oturum'
import { ayarlar } from '@/lib/veri'
import { MENU } from '@/lib/admin/kaynaklar'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

async function cikisYap() {
  'use server'
  await oturumIstemcisi().auth.signOut()
  redirect('/admin/giris')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const kullanici = await aktifKullanici()
  // Giris sayfasi kendi <html>'ini basar; middleware zaten korumayi yapiyor.
  if (!kullanici) return <>{children}</>

  const a = await ayarlar()
  const gruplar = [...new Set(MENU.map((m) => m.grup))]

  return (
    <html lang="tr">
      <head><link rel="stylesheet" href="/assets/admin.css" /></head>
      <body className="panel">
        <aside className="yan">
          <div className="yan-bas">
            <b>{a.site_adi || 'Rehber'}</b>
            <small>yönetim paneli</small>
          </div>

          <nav>
            {gruplar.map((g) => (
              <div className="menu-grup" key={g}>
                <span className="menu-baslik">{g}</span>
                {MENU.filter((m) => m.grup === g).map((m) => (
                  <a href={m.yol} key={m.yol}>{m.etiket}</a>
                ))}
              </div>
            ))}
          </nav>

          <div className="yan-alt">
            <a href="/" target="_blank" rel="noopener">Siteyi aç ↗</a>
            <form action={cikisYap}>
              <button type="submit" className="cikis">Çıkış</button>
            </form>
          </div>
        </aside>

        <main className="icerik">{children}</main>
      </body>
    </html>
  )
}
