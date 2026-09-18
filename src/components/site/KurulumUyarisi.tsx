import type { OrtamDegiskeni } from '@/lib/ortam'

/**
 * Ortam degiskenleri eksikken gosterilen sayfa. Uretimde Next.js hata
 * metnini gizledigi icin ziyaretci sadece "Application error" goruyordu;
 * burada neyin eksik oldugu ve nereden alinacagi acikca yaziyor.
 */
export default function KurulumUyarisi({ eksik }: { eksik: OrtamDegiskeni[] }) {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      maxWidth: 720, margin: '0 auto', padding: '48px 20px', lineHeight: 1.6, color: '#2B2B28',
    }}>
      <div style={{ height: 6, width: 64, background: '#F2C230', borderRadius: 3, marginBottom: 20 }} />
      <h1 style={{ fontSize: '1.6rem', margin: '0 0 12px' }}>Kurulum tamamlanmadı</h1>
      <p style={{ margin: '0 0 24px', color: '#5B5B54' }}>
        Site çalışıyor ama Supabase bağlantısı için gereken
        {eksik.length > 1 ? ' değişkenler' : ' değişken'} tanımlı değil.
        Vercel&apos;de <b>Settings → Environment Variables</b> bölümüne ekleyip
        <b> yeniden deploy</b> edin.
      </p>

      {eksik.map((d) => (
        <div key={d.ad} style={{
          border: '1px solid #E4E1D8', borderLeft: '4px solid #9C5A2C',
          borderRadius: 6, padding: '14px 16px', margin: '0 0 12px', background: '#FBFAF6',
        }}>
          <code style={{ fontSize: '1rem', fontWeight: 700, color: '#9C5A2C' }}>{d.ad}</code>
          <div style={{ fontSize: '.92rem', color: '#5B5B54', marginTop: 4 }}>{d.aciklama}</div>
          <div style={{ fontSize: '.92rem', color: '#8A8A80', marginTop: 2 }}>
            örnek: <code>{d.ornek}</code>
          </div>
        </div>
      ))}

      <p style={{ fontSize: '.92rem', color: '#5B5B54', marginTop: 24 }}>
        Değişkenleri eklerken <b>Production</b> ortamının işaretli olduğundan emin olun.
        Ekledikten sonra Vercel&apos;de <b>Deployments → ⋯ → Redeploy</b> demek gerekir;
        mevcut deploy eski değerlerle derlenmiştir.
      </p>
      <p style={{ fontSize: '.92rem', color: '#5B5B54' }}>
        Bağlantının gerçekten kurulup kurulmadığını <a href="/durum" style={{ color: '#9C5A2C' }}>/durum</a>{' '}
        adresinden görebilirsiniz.
      </p>
    </div>
  )
}
