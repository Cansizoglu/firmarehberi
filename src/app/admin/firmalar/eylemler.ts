'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { yonetimIstemcisi } from '@/lib/supabase'
import { aktifKullanici } from '@/lib/oturum'

async function yetkiKontrol() {
  if (!(await aktifKullanici())) redirect('/admin/giris')
}

const metin = (f: FormData, k: string) => {
  const s = String(f.get(k) ?? '').trim()
  return s === '' ? null : s
}
const sayi = (f: FormData, k: string) => {
  const s = String(f.get(k) ?? '').trim()
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export async function firmaKaydet(form: FormData) {
  await yetkiKontrol()
  const db = yonetimIstemcisi()
  const id = Number(form.get('_id') ?? 0)

  const satir = {
    il_id: sayi(form, 'il_id'),
    ilce_id: sayi(form, 'ilce_id'),
    ad: metin(form, 'ad'),
    slug: metin(form, 'slug'),
    mahalle: metin(form, 'mahalle'),
    adres: metin(form, 'adres'),
    tel: metin(form, 'tel'),
    tel2: metin(form, 'tel2'),
    eposta: metin(form, 'eposta'),
    web: metin(form, 'web'),
    place_id: metin(form, 'place_id'),
    harita_link: metin(form, 'harita_link'),
    enlem: sayi(form, 'enlem'),
    boylam: sayi(form, 'boylam'),
    aciklama: metin(form, 'aciklama'),
    g_puan: sayi(form, 'g_puan'),
    g_puan_n: sayi(form, 'g_puan_n'),
    canonical: metin(form, 'canonical'),
    paket: String(form.get('paket') ?? 'standart'),
    merkez: form.get('merkez') != null,
    one_cikan: form.get('one_cikan') != null,
    sira: sayi(form, 'sira') ?? 0,
    aktif: form.get('aktif') != null,
  }

  if (!satir.ad || !satir.slug || !satir.il_id) {
    redirect(`/admin/firmalar/duzenle?${id ? `id=${id}&` : ''}hata=${encodeURIComponent('Ad, adres (slug) ve il zorunlu.')}`)
  }

  let firmaId = id
  if (id) {
    const { error } = await db.from('firmalar').update(satir).eq('id', id)
    if (error) redirect(`/admin/firmalar/duzenle?id=${id}&hata=${encodeURIComponent(error.message)}`)
  } else {
    const { data, error } = await db.from('firmalar').insert(satir).select('id').single()
    if (error) redirect(`/admin/firmalar/duzenle?hata=${encodeURIComponent(error.message)}`)
    firmaId = data!.id
  }

  // Kategori baglarini tazele
  const secilen = form.getAll('kategoriler').map(Number).filter(Boolean)
  await db.from('firma_kategori').delete().eq('firma_id', firmaId)
  if (secilen.length) {
    await db.from('firma_kategori')
      .insert(secilen.map((kategori_id) => ({ firma_id: firmaId, kategori_id })))
  }

  revalidatePath('/', 'layout')
  redirect('/admin/firmalar?kaydedildi=1')
}

export async function firmaSil(form: FormData) {
  await yetkiKontrol()
  const id = Number(form.get('_id') ?? 0)
  if (!id) redirect('/admin/firmalar')

  const { error } = await yonetimIstemcisi().from('firmalar').delete().eq('id', id)
  if (error) redirect(`/admin/firmalar?hata=${encodeURIComponent(error.message)}`)

  revalidatePath('/', 'layout')
  redirect('/admin/firmalar?silindi=1')
}

/** Listeden toplu paket ve sira degisikligi (PHP'deki toplu kaydet). */
export async function firmaTopluKaydet(form: FormData) {
  await yetkiKontrol()
  const db = yonetimIstemcisi()

  const idler = form.getAll('id').map(Number).filter(Boolean)
  for (const id of idler) {
    const paket = String(form.get(`paket_${id}`) ?? 'standart')
    const s = Number(form.get(`sira_${id}`) ?? 0)
    await db.from('firmalar').update({ paket, sira: Number.isFinite(s) ? s : 0 }).eq('id', id)
  }

  revalidatePath('/', 'layout')
  redirect('/admin/firmalar?kaydedildi=1')
}

/** Firma galerisi */
export async function galeriEkle(form: FormData) {
  await yetkiKontrol()
  const firmaId = Number(form.get('firma_id') ?? 0)
  const dosya = String(form.get('dosya') ?? '').trim()
  if (!firmaId || !dosya) redirect(`/admin/firmalar/duzenle?id=${firmaId}`)

  await yonetimIstemcisi().from('galeri').insert({
    firma_id: firmaId,
    dosya,
    alt_yazi: String(form.get('alt_yazi') ?? '').trim() || null,
    kapak: form.get('kapak') != null,
  })

  revalidatePath('/', 'layout')
  redirect(`/admin/firmalar/duzenle?id=${firmaId}#galeri`)
}

export async function galeriSil(form: FormData) {
  await yetkiKontrol()
  const id = Number(form.get('_id') ?? 0)
  const firmaId = Number(form.get('firma_id') ?? 0)
  if (id) await yonetimIstemcisi().from('galeri').delete().eq('id', id)

  revalidatePath('/', 'layout')
  redirect(`/admin/firmalar/duzenle?id=${firmaId}#galeri`)
}

export async function galeriKapakYap(form: FormData) {
  await yetkiKontrol()
  const id = Number(form.get('_id') ?? 0)
  const firmaId = Number(form.get('firma_id') ?? 0)
  if (id && firmaId) {
    const db = yonetimIstemcisi()
    await db.from('galeri').update({ kapak: false }).eq('firma_id', firmaId)
    await db.from('galeri').update({ kapak: true }).eq('id', id)
  }

  revalidatePath('/', 'layout')
  redirect(`/admin/firmalar/duzenle?id=${firmaId}#galeri`)
}
