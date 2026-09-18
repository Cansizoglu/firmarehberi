import { ayarlar } from '@/lib/veri'

export const dynamic = 'force-dynamic'

export async function GET() {
  const a = await ayarlar()
  const D = (a.domain || '').replace(/\/+$/, '')
  const govde = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${D}/sitemap.xml`,
    '',
  ].join('\n')
  return new Response(govde, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
