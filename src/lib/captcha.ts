import crypto from 'crypto'

/**
 * PHP surumu captcha cevabini $_SESSION'da tutuyordu. Sunucusuz ortamda oturum
 * yok, o yuzden dogru cevap imzalanip forma gizli alan olarak konuyor ve
 * gonderimde imza kontrol ediliyor. Imza 30 dakika sonra gecersiz oluyor.
 */
const SIR = process.env.CAPTCHA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'rehber'
const OMUR = 30 * 60 * 1000

function imzala(cevap: number, zaman: number) {
  return crypto.createHmac('sha256', SIR).update(`${cevap}.${zaman}`).digest('hex').slice(0, 32)
}

export function captchaUret() {
  const a = crypto.randomInt(2, 10)
  const b = crypto.randomInt(2, 10)
  const zaman = Date.now()
  return { a, b, soru: `${a} + ${b} = ?`, imza: `${zaman}.${imzala(a + b, zaman)}` }
}

export function captchaDogrula(cevap: unknown, imza: unknown): boolean {
  if (typeof imza !== 'string') return false
  const [zamanStr, hash] = imza.split('.')
  const zaman = Number(zamanStr)
  if (!zaman || !hash) return false
  if (Date.now() - zaman > OMUR) return false

  const sayi = Number(cevap)
  if (!Number.isInteger(sayi)) return false

  const beklenen = imzala(sayi, zaman)
  const a = Buffer.from(hash)
  const b = Buffer.from(beklenen)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
