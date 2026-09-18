import { captchaUret } from '@/lib/captcha'
import { ayar } from '@/lib/veri'

/** Guvenlik sorusu. Dogru cevap imzali gizli alanda tasiniyor. */
export async function Captcha() {
  if (!(await ayar('captcha_aktif', '1'))) return null
  const { soru, imza } = captchaUret()

  return (
    <div className="captcha">
      <label htmlFor="cap">Güvenlik sorusu — gönderebilmek için cevaplayın</label>
      <span className="captcha-soru">{soru}</span>
      <input id="cap" type="number" name="cap" required inputMode="numeric" placeholder="?" />
      <input type="hidden" name="cap_imza" value={imza} />
    </div>
  )
}
