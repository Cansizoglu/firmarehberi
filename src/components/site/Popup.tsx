import { ayarlar } from '@/lib/veri'

const VARSAYILAN = [
  'Rehberdeki firmalarla çalışırken kendinizi koruyun:',
  'Emin olmadan kimseye kapora veya ön ödeme yapmayın.',
  'Firmanın vergi levhasını ve K3 yetki belgesini görmeden anlaşmayın.',
  'Firmanın yerini, yurdunu ve ofisini önceden araştırın.',
  'Sözleşme ve eşya listesi olmadan taşıma yaptırmayın.',
].join('\n')

export async function UyariPopup() {
  const a = await ayarlar()
  if (!a.popup_aktif) return null

  const baslik = a.popup_baslik || 'Ödeme yapmadan önce dikkat'
  const satirlar = (a.popup_metin || VARSAYILAN).split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  const [giris, ...maddeler] = satirlar

  return (
    <div className="pop-ort" id="uyariPop" hidden>
      <div className="pop" role="dialog" aria-modal="true" aria-labelledby="popBas">
        <button className="pop-x" type="button" data-pop-kapat aria-label="Kapat">&times;</button>
        <div className="pop-ikon">!</div>
        <h2 id="popBas">{baslik}</h2>
        {giris && <p>{giris}</p>}
        <ul>{maddeler.map((m, i) => <li key={i}>{m}</li>)}</ul>
        <p style={{ fontSize: '.9rem', color: '#4A544E' }}>
          Vergi levhası ve K3 yetki belgesi olmayan firmaları rehbere kaydetmiyoruz.
          Bir firma hakkında emin olamadıysanız <a href="/bilgi-al">bilgi isteyin</a>, size dönelim.
        </p>
        <button className="pop-kapat" type="button" data-pop-kapat>Anladım</button>
      </div>
    </div>
  )
}
