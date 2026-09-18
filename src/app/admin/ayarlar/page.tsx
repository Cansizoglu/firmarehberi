import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { yonetimIstemcisi } from '@/lib/supabase'
import { aktifKullanici } from '@/lib/oturum'
import { ayarlar } from '@/lib/veri'
import { GorselYukle } from '@/components/admin/GorselYukle'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ayarlar' }

/** Sekme -> o sekmede kaydedilecek anahtarlar. */
const SEKMELER = {
  site:  ['site_adi', 'domain', 'mail', 'varsayilan_il', 'logo', 'favicon',
          'sidebar_metin', 'sabit_yazi', 'sabit_link', 'talepler_aktif', 'captcha_aktif'],
  seo:   ['meta_baslik', 'meta_aciklama', 'og_gorsel', 'facebook', 'instagram', 'twitter'],
  mail:  ['smtp_aktif', 'smtp_host', 'smtp_port', 'smtp_guvenlik', 'smtp_kul', 'smtp_sif', 'smtp_gonderen'],
  kod:   ['yapisal_veri', 'ozel_head', 'ozel_body', 'popup_aktif', 'popup_baslik', 'popup_metin'],
} as const

type Sekme = keyof typeof SEKMELER

const ONAY_ANAHTARLAR = ['talepler_aktif', 'captcha_aktif', 'smtp_aktif', 'popup_aktif']

async function kaydet(form: FormData) {
  'use server'
  if (!(await aktifKullanici())) redirect('/admin/giris')

  const sekme = String(form.get('_sekme') ?? 'site') as Sekme
  const anahtarlar = SEKMELER[sekme] ?? SEKMELER.site

  const satirlar = anahtarlar.map((anahtar) => ({
    anahtar,
    deger: ONAY_ANAHTARLAR.includes(anahtar)
      ? (form.get(anahtar) != null ? '1' : '')
      : String(form.get(anahtar) ?? ''),
  }))

  const { error } = await yonetimIstemcisi().from('ayarlar')
    .upsert(satirlar, { onConflict: 'anahtar' })

  if (error) redirect(`/admin/ayarlar?sekme=${sekme}&hata=${encodeURIComponent(error.message)}`)

  revalidatePath('/', 'layout')
  redirect(`/admin/ayarlar?sekme=${sekme}&kaydedildi=1`)
}

export default async function Ayarlar({
  searchParams,
}: { searchParams: { sekme?: string; kaydedildi?: string; hata?: string } }) {
  const a = await ayarlar()
  const sekme = (['site', 'seo', 'mail', 'kod'].includes(searchParams.sekme ?? '')
    ? searchParams.sekme : 'site') as Sekme

  const d = (k: string) => a[k] ?? ''
  const isaretli = (k: string) => Boolean(a[k])

  const sekmeler: [Sekme, string][] = [
    ['site', 'Site ve Logo'], ['seo', 'SEO ve Sosyal Medya'],
    ['mail', 'Mail / SMTP'], ['kod', 'Kod ve Yapısal Veri'],
  ]

  return (
    <>
      <div className="baslik-satir"><h1>Ayarlar</h1></div>

      {searchParams.kaydedildi && <p className="mesaj ok">Ayarlar kaydedildi.</p>}
      {searchParams.hata && <p className="mesaj hata">{searchParams.hata}</p>}

      <div className="sekmeler">
        {sekmeler.map(([k, etiket]) => (
          <a key={k} className={sekme === k ? 'etkin' : ''} href={`/admin/ayarlar?sekme=${k}`}>{etiket}</a>
        ))}
      </div>

      <form action={kaydet} className="kart form">
        <input type="hidden" name="_sekme" value={sekme} />

        {sekme === 'site' && (
          <div className="alan-izgara">
            <div className="alan alan-yarim">
              <label htmlFor="site_adi">Site adı</label>
              <input id="site_adi" name="site_adi" defaultValue={d('site_adi')} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="domain">Site adresi</label>
              <input id="domain" name="domain" defaultValue={d('domain')} placeholder="https://..." />
              <span className="ipucu">Canonical ve sitemap bu adrese göre üretilir.</span>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="mail">Bildirim e-postası</label>
              <input id="mail" name="mail" type="email" defaultValue={d('mail')} />
              <span className="ipucu">Formdan gelen talepler buraya gönderilir.</span>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="varsayilan_il">Varsayılan il (slug)</label>
              <input id="varsayilan_il" name="varsayilan_il" defaultValue={d('varsayilan_il')} />
              <span className="ipucu">Ana sayfada gösterilecek il.</span>
            </div>
            <div className="alan alan-yarim">
              <label>Logo</label>
              <GorselYukle ad="logo" deger={d('logo')} />
            </div>
            <div className="alan alan-yarim">
              <label>Favicon</label>
              <GorselYukle ad="favicon" deger={d('favicon')} />
            </div>
            <div className="alan">
              <label htmlFor="sidebar_metin">Sidebar tanıtım metni</label>
              <textarea id="sidebar_metin" name="sidebar_metin" rows={3} defaultValue={d('sidebar_metin')} />
              <span className="ipucu">Boş bırakırsan hazır metin kullanılır.</span>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="sabit_yazi">Mobil alt bar yazısı</label>
              <input id="sabit_yazi" name="sabit_yazi" defaultValue={d('sabit_yazi')} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="sabit_link">Mobil alt bar linki</label>
              <input id="sabit_link" name="sabit_link" defaultValue={d('sabit_link')} />
            </div>
            <div className="alan alan-yarim">
              <label className="onay">
                <input type="checkbox" name="talepler_aktif" defaultChecked={isaretli('talepler_aktif')} />
                <span>/talepler sayfası açık</span>
              </label>
            </div>
            <div className="alan alan-yarim">
              <label className="onay">
                <input type="checkbox" name="captcha_aktif" defaultChecked={isaretli('captcha_aktif')} />
                <span>Formlarda güvenlik sorusu</span>
              </label>
            </div>
          </div>
        )}

        {sekme === 'seo' && (
          <div className="alan-izgara">
            <div className="alan">
              <label htmlFor="meta_baslik">Ana sayfa SEO başlığı</label>
              <input id="meta_baslik" name="meta_baslik" defaultValue={d('meta_baslik')} />
            </div>
            <div className="alan">
              <label htmlFor="meta_aciklama">Ana sayfa SEO açıklaması</label>
              <textarea id="meta_aciklama" name="meta_aciklama" rows={3} defaultValue={d('meta_aciklama')} />
            </div>
            <div className="alan">
              <label>Sosyal paylaşım görseli (og:image)</label>
              <GorselYukle ad="og_gorsel" deger={d('og_gorsel')} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="facebook">Facebook</label>
              <input id="facebook" name="facebook" defaultValue={d('facebook')} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="instagram">Instagram</label>
              <input id="instagram" name="instagram" defaultValue={d('instagram')} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="twitter">X / Twitter</label>
              <input id="twitter" name="twitter" defaultValue={d('twitter')} />
            </div>
          </div>
        )}

        {sekme === 'mail' && (
          <div className="alan-izgara">
            <div className="alan">
              <label className="onay">
                <input type="checkbox" name="smtp_aktif" defaultChecked={isaretli('smtp_aktif')} />
                <span>SMTP kullan</span>
              </label>
              <span className="ipucu">
                Kapalıysa talepler yine veritabanına yazılır, sadece mail gönderilmez.
              </span>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="smtp_host">Sunucu</label>
              <input id="smtp_host" name="smtp_host" defaultValue={d('smtp_host')}
                placeholder="mail.siteadin.com.tr" />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="smtp_port">Port</label>
              <input id="smtp_port" name="smtp_port" defaultValue={d('smtp_port') || '587'} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="smtp_guvenlik">Güvenlik</label>
              <select id="smtp_guvenlik" name="smtp_guvenlik" defaultValue={d('smtp_guvenlik') || 'tls'}>
                <option value="tls">TLS (587)</option>
                <option value="ssl">SSL (465)</option>
                <option value="">Yok</option>
              </select>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="smtp_kul">Kullanıcı</label>
              <input id="smtp_kul" name="smtp_kul" defaultValue={d('smtp_kul')} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="smtp_sif">Şifre</label>
              <input id="smtp_sif" name="smtp_sif" type="password" defaultValue={d('smtp_sif')} />
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="smtp_gonderen">Gönderen adresi</label>
              <input id="smtp_gonderen" name="smtp_gonderen" type="email" defaultValue={d('smtp_gonderen')} />
              <span className="ipucu">
                Kendi domainindeki bir adres olmalı; @gmail.com yazarsan Gmail reddeder.
              </span>
            </div>
          </div>
        )}

        {sekme === 'kod' && (
          <div className="alan-izgara">
            <div className="alan">
              <label htmlFor="yapisal_veri">JSON-LD yapısal veri</label>
              <textarea id="yapisal_veri" name="yapisal_veri" rows={6} defaultValue={d('yapisal_veri')}
                placeholder='<script type="application/ld+json">{ ... }</script>' />
            </div>
            <div className="alan">
              <label htmlFor="ozel_head">&lt;head&gt; özel kod</label>
              <textarea id="ozel_head" name="ozel_head" rows={5} defaultValue={d('ozel_head')}
                placeholder="Analytics, Search Console doğrulama, Tag Manager…" />
            </div>
            <div className="alan">
              <label htmlFor="ozel_body">&lt;body&gt; özel kod</label>
              <textarea id="ozel_body" name="ozel_body" rows={4} defaultValue={d('ozel_body')} />
            </div>
            <div className="alan">
              <label className="onay">
                <input type="checkbox" name="popup_aktif" defaultChecked={isaretli('popup_aktif')} />
                <span>Uyarı popup&apos;ı açık</span>
              </label>
            </div>
            <div className="alan alan-yarim">
              <label htmlFor="popup_baslik">Popup başlığı</label>
              <input id="popup_baslik" name="popup_baslik" defaultValue={d('popup_baslik')} />
            </div>
            <div className="alan">
              <label htmlFor="popup_metin">Popup metni</label>
              <textarea id="popup_metin" name="popup_metin" rows={5} defaultValue={d('popup_metin')} />
              <span className="ipucu">İlk satır giriş cümlesi, sonraki satırlar madde madde listelenir.</span>
            </div>
          </div>
        )}

        <div className="form-alt">
          <button type="submit" className="btn">Kaydet</button>
        </div>
      </form>
    </>
  )
}
