import nodemailer from 'nodemailer'
import { ayarlar } from './veri'

/**
 * Panel > Ayarlar > Mail/SMTP altindaki ayarlarla mail gonderir.
 * SMTP kapaliysa veya hata alirsa sessizce false doner: basvuru zaten
 * veritabanina yazildigi icin talep kaybolmaz (PHP surumundeki davranis).
 */
export async function mailGonder(konu: string, govde: string): Promise<boolean> {
  try {
    const a = await ayarlar()
    if (!a.smtp_aktif || !a.smtp_host) return false

    const alici = a.mail
    if (!alici) return false

    const gonderen = a.smtp_gonderen || a.smtp_kul || alici
    const port = Number(a.smtp_port || 587)

    const tasiyici = nodemailer.createTransport({
      host: a.smtp_host,
      port,
      secure: a.smtp_guvenlik === 'ssl' || port === 465,
      auth: a.smtp_kul ? { user: a.smtp_kul, pass: a.smtp_sif } : undefined,
    })

    await tasiyici.sendMail({
      from: `"${a.site_adi || 'Rehber'}" <${gonderen}>`,
      to: alici,
      subject: konu,
      text: govde,
    })
    return true
  } catch (e) {
    console.error('mailGonder:', e)
    return false
  }
}
