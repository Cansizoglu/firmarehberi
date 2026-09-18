'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { yonetimIstemcisi } from '@/lib/supabase'
import { kaynakBul, type Alan } from '@/lib/admin/kaynaklar'
import { aktifKullanici } from '@/lib/oturum'

/** Her yazma isleminden once oturumu dogrula. */
async function yetkiKontrol() {
  if (!(await aktifKullanici())) redirect('/admin/giris')
}

/** Form degerini sutun tipine gore cevirir. */
function degerCevir(alan: Alan, form: FormData) {
  if (alan.tip === 'onay') return form.get(alan.ad) != null

  const ham = form.get(alan.ad)
  const s = ham == null ? '' : String(ham).trim()

  if (s === '') return alan.zorunlu ? '' : null
  if (alan.tip === 'sayi') {
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  // il_id, kategori_id gibi secim alanlari sayisal
  if (alan.tip === 'secim' && alan.kaynakTablo) {
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  return s
}

export async function kayitKaydet(form: FormData) {
  await yetkiKontrol()

  const anahtar = String(form.get('_kaynak') ?? '')
  const kaynak = kaynakBul(anahtar)
  if (!kaynak) redirect('/admin')

  const id = Number(form.get('_id') ?? 0)
  const satir: Record<string, unknown> = {}
  for (const alan of kaynak.alanlar) satir[alan.ad] = degerCevir(alan, form)

  const db = yonetimIstemcisi()
  const { error } = id
    ? await db.from(kaynak.tablo).update(satir).eq('id', id)
    : await db.from(kaynak.tablo).insert(satir)

  if (error) {
    console.error('kayitKaydet:', error)
    redirect(`/admin/${anahtar}/duzenle?${id ? `id=${id}&` : ''}hata=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect(`/admin/${anahtar}?kaydedildi=1`)
}

export async function kayitSil(form: FormData) {
  await yetkiKontrol()

  const anahtar = String(form.get('_kaynak') ?? '')
  const kaynak = kaynakBul(anahtar)
  const id = Number(form.get('_id') ?? 0)
  if (!kaynak || !id) redirect('/admin')

  const db = yonetimIstemcisi()
  const { error } = await db.from(kaynak.tablo).delete().eq('id', id)

  if (error) {
    console.error('kayitSil:', error)
    redirect(`/admin/${anahtar}?hata=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect(`/admin/${anahtar}?silindi=1`)
}
