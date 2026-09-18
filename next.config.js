/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PHP surumunde /adana/seyhan/ gibi adresler sondaki egik cizgiyle yayinlaniyordu ve
  // /adana/seyhan de calisiyordu. Next.js varsayilan olarak birini digerine 308 ile
  // yonlendiriyor; bu ayar o yonlendirmeyi kapatir, iki bicim de ayni sayfayi verir.
  // Canonical etiketi yine egik cizgili adresi gosterir, boylece SEO'da tek adres kalir.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
  async redirects() {
    // PHP surumundeki eski statik .html adresleri -> yeni adresler (301)
    const eski = {
      'seyhan-evden-eve-nakliyat': '/adana/seyhan/',
      'cukurova-evden-eve-nakliyat': '/adana/cukurova/',
      'yuregir-evden-eve-nakliyat': '/adana/yuregir/',
      'saricam-evden-eve-nakliyat': '/adana/saricam/',
      'ceyhan-evden-eve-nakliyat': '/adana/ceyhan/',
      'kozan-evden-eve-nakliyat': '/adana/kozan/',
      'karaisali-nakliyat': '/adana/karaisali/',
      'asansorlu-tasimacilik': '/adana/asansorlu-tasimacilik/',
      'firma-ekle': '/firma-ekle',
      'tesekkurler': '/tesekkurler',
    }
    return [
      ...Object.entries(eski).map(([k, v]) => ({
        source: `/${k}.html`,
        destination: v,
        permanent: true,
      })),
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
    ]
  },
}
module.exports = nextConfig
