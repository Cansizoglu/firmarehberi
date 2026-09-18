/**
 * Ortam degiskeni kontrolu.
 *
 * Vercel'de degiskenler eksikse Next.js uretim modunda hatanin metnini
 * gizliyor ve ziyaretciye sadece "Application error ... Digest: 123456"
 * yaziyor. Bu da neyin eksik oldugunu anlamayi imkansiz kiliyor.
 * Bu yuzden eksik degiskenleri once kontrol edip anlasilir bir sayfa
 * gosteriyoruz.
 */

export type OrtamDegiskeni = {
  ad: string
  aciklama: string
  ornek: string
}

export const GEREKLI_DEGISKENLER: OrtamDegiskeni[] = [
  {
    ad: 'NEXT_PUBLIC_SUPABASE_URL',
    aciklama: 'Supabase proje adresi. Settings → Data API → Project URL',
    ornek: 'https://xxxxxxxx.supabase.co',
  },
  {
    ad: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    aciklama: 'Herkese acik anahtar. Settings → API Keys → Publishable key',
    ornek: 'sb_publishable_...',
  },
  {
    ad: 'SUPABASE_SERVICE_ROLE_KEY',
    aciklama: 'Gizli anahtar. Settings → API Keys → Secret keys → Reveal',
    ornek: 'sb_secret_...',
  },
]

/** Tanimli olmayan (veya bos birakilmis) gerekli degiskenler. */
export function eksikDegiskenler(): OrtamDegiskeni[] {
  return GEREKLI_DEGISKENLER.filter((d) => !(process.env[d.ad] || '').trim())
}
