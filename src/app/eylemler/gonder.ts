'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { yonetimIstemcisi } from '@/lib/supabase'
import { ayarlar } from '@/lib/veri'
import { captchaDogrula } from '@/lib/captcha'
import { mailGonder } from '@/lib/mail'

/** Form alanlari -> panelde okunabilir etiketler (PHP'deki gonder.php). */
const ETIKET: Record<string, string> = {
  nereden: 'Nereden', nereye: 'Nereye', cikis_kat: 'Çıkış katı', varis_kat: 'Varış katı',
  ev_tipi: 'Ev tipi', tarih: 'Taşınma tarihi', asansor: 'Asansör', hizmet: 'İstenen hizmet',
  notu: 'Not', firma_adi: 'Firma adı', yetkili: 'Yetkili', eposta: 'E-posta',
  adres: 'Adres', ilce: 'İlçe', web: 'Web sitesi', konu: 'Konu', mesaj: 'Mesaj',
}

function ip() {
  const h = headers()
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || null
}

export async function basvuruGonder(form: FormData) {
  // Bal kabi — bot doldurursa sessizce tesekkur sayfasina gonder.
  if (String(form.get('_bot') ?? '')) redirect('/tesekkurler')

  const a = await ayarlar()
  if (a.captcha_aktif && !captchaDogrula(form.get('cap'), form.get('cap_imza'))) {
    redirect('/tesekkurler?hata=captcha')
  }

  const tur = String(form.get('tur') ?? 'teklif')
  const ad  = String(form.get('ad') ?? '').trim().slice(0, 160)
  const tel = String(form.get('tel') ?? '').trim().slice(0, 40)

  if (!ad || !tel) redirect('/tesekkurler?hata=eksik')

  // Kalan alanlari etiketleriyle sakla
  const veri: Record<string, string> = {}
  for (const [k, v] of form.entries()) {
    if (['tur', 'ad', 'tel', 'cap', 'cap_imza', '_bot', 'firma'].includes(k)) continue
    const d = String(v).trim()
    if (d) veri[ETIKET[k] ?? k] = d.slice(0, 2000)
  }

  const db = yonetimIstemcisi()
  const { error } = await db.from('basvurular').insert({
    tur,
    ad,
    tel,
    firma: String(form.get('firma') ?? '').trim().slice(0, 190) || null,
    veri: JSON.stringify(veri),
    ip: ip(),
  })

  // Kayit basarisizsa kullaniciyi yaniltma
  if (error) {
    console.error('basvuruGonder:', error)
    redirect('/tesekkurler?hata=kayit')
  }

  // Mail ikinci planda: gitmese de talep panelde duruyor.
  const satirlar = [`Ad Soyad: ${ad}`, `Telefon: ${tel}`,
    ...Object.entries(veri).map(([k, v]) => `${k}: ${v}`)]
  await mailGonder(`Yeni ${tur} talebi — ${ad}`, satirlar.join('\n'))

  redirect('/tesekkurler')
}

/** Firma sayfasindaki ziyaretci yorumu — panele onay bekliyor olarak duser. */
export async function yorumGonder(form: FormData) {
  if (String(form.get('_bot') ?? '')) redirect('/tesekkurler')

  const a = await ayarlar()
  if (a.captcha_aktif && !captchaDogrula(form.get('cap'), form.get('cap_imza'))) {
    redirect('/tesekkurler?hata=captcha')
  }

  const firmaId = Number(form.get('firma_id'))
  const isim = String(form.get('isim') ?? '').trim().slice(0, 120)
  const yorum = String(form.get('yorum') ?? '').trim().slice(0, 4000)
  const puan = Math.min(5, Math.max(1, Number(form.get('puan') ?? 5)))
  const geri = String(form.get('geri') ?? '/')

  if (!firmaId || !isim || !yorum) redirect(geri + '?hata=eksik')

  const db = yonetimIstemcisi()
  const { error } = await db.from('yorumlar').insert({
    firma_id: firmaId,
    isim,
    ilce: String(form.get('ilce') ?? '').trim().slice(0, 80) || null,
    puan,
    yorum,
    onayli: false,
    ip: ip(),
  })

  if (error) {
    console.error('yorumGonder:', error)
    redirect(geri + '?hata=kayit')
  }

  redirect(geri + '?yorum=alindi')
}
