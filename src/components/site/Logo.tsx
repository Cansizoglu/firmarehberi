import { ayar } from '@/lib/veri'
import { gorselUrl } from '@/lib/supabase'

export function LogoSvg() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="42" height="42" aria-hidden="true">
      <rect width="48" height="48" rx="9" fill="#9C5A2C" />
      <path d="M6 17l18-8 18 8-18 8z" fill="#C57B45" />
      <path d="M6 17v16l18 8V25z" fill="#8A4E24" />
      <path d="M42 17v16l-18 8V25z" fill="#7A4420" />
      <rect x="21" y="9" width="6" height="32" fill="#F2C230" opacity=".92" />
    </svg>
  )
}

/** Panelden logo yuklendiyse onu, yoksa hazir koli logosunu goster. */
export async function SiteLogo() {
  const [logo, siteAdi] = await Promise.all([ayar('logo'), ayar('site_adi')])
  if (!logo) return <LogoSvg />
  return <img className="logo-img" src={gorselUrl(logo)!} alt={siteAdi} />
}
