import { ayar, footerSayfalari, ilceler, iller, kategoriler } from '@/lib/veri'
import { uIl, uIlce, uKat } from '@/lib/url'
import type { Il } from '@/lib/tipler'

export async function Footer({ il }: { il: Il | null }) {
  const [siteAdi, ilListe, katlar, sayfalar] = await Promise.all([
    ayar('site_adi'), iller(), kategoriler(), footerSayfalari(),
  ])
  const ilceListe = il ? await ilceler(il.id) : []

  return (
    <footer className="footer">
      <div className="kap">
        <div className="footer-grid">
          <div>
            <h4>{siteAdi}</h4>
            <p style={{ fontSize: '.94rem' }}>
              Evden eve nakliyat, asansörlü taşımacılık ve şehirler arası taşıma yapan
              firmaları tek çatı altında topluyoruz. Teklif ücretsizdir.
            </p>
            <ul style={{ marginTop: 12 }}>
              {ilListe.map((x) => <li key={x.id}><a href={uIl(x)}>{x.ad}</a></li>)}
            </ul>
          </div>

          <div>
            <h4>İlçeler</h4>
            <ul>
              {il && ilceListe.map((i) => <li key={i.id}><a href={uIlce(il, i)}>{i.ad}</a></li>)}
            </ul>
          </div>

          <div>
            <h4>Hizmetler</h4>
            <ul>
              {il && katlar.slice(0, 5).map((k) => (
                <li key={k.id}><a href={uKat(il, k)}>{k.ad}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Rehber</h4>
            <ul>
              <li><a href="/firma-ekle">Firmanızı ekleyin</a></li>
              <li><a href="/#teklif">Ücretsiz teklif al</a></li>
              <li><a href="/talepler">Açık talepler</a></li>
              <li><a href="/bilgi-al">Bilgi al / şikayet</a></li>
              {sayfalar.map((s) => <li key={s.slug}><a href={`/${s.slug}`}>{s.baslik}</a></li>)}
            </ul>
          </div>
        </div>

        <div className="footer-alt">
          <span>© {new Date().getFullYear()} {siteAdi}</span>
          <span>Firma bilgileri herkese açık kaynaklardan derlenmiştir.</span>
        </div>
      </div>
    </footer>
  )
}
