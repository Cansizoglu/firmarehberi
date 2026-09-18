'use client'

import { useEffect, useRef, useState } from 'react'

const DUGMELER: { komut: string; deger?: string; etiket: string; baslik: string }[] = [
  { komut: 'bold', etiket: 'B', baslik: 'Kalın' },
  { komut: 'italic', etiket: 'I', baslik: 'İtalik' },
  { komut: 'formatBlock', deger: 'h2', etiket: 'H2', baslik: 'Başlık 2' },
  { komut: 'formatBlock', deger: 'h3', etiket: 'H3', baslik: 'Başlık 3' },
  { komut: 'formatBlock', deger: 'p', etiket: '¶', baslik: 'Paragraf' },
  { komut: 'insertUnorderedList', etiket: '• Liste', baslik: 'Madde listesi' },
  { komut: 'insertOrderedList', etiket: '1. Liste', baslik: 'Numaralı liste' },
]

/** Basit WYSIWYG — HTML moduna gecerek kaynak da duzenlenebiliyor. */
export function ZenginEditor({ ad, deger }: { ad: string; deger?: string | null }) {
  const [html, setHtml] = useState(deger || '')
  const [kaynak, setKaynak] = useState(false)
  const kutu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!kaynak && kutu.current && kutu.current.innerHTML !== html) {
      kutu.current.innerHTML = html
    }
  }, [kaynak])   // eslint-disable-line react-hooks/exhaustive-deps

  function uygula(komut: string, deger?: string) {
    document.execCommand(komut, false, deger)
    if (kutu.current) setHtml(kutu.current.innerHTML)
  }

  function baglantiEkle() {
    const adres = window.prompt('Bağlantı adresi:', 'https://')
    if (adres) uygula('createLink', adres)
  }

  return (
    <div className="editor">
      <input type="hidden" name={ad} value={html} />

      <div className="editor-arac">
        {!kaynak && (
          <>
            {DUGMELER.map((d) => (
              <button type="button" key={d.etiket} title={d.baslik}
                onMouseDown={(e) => { e.preventDefault(); uygula(d.komut, d.deger) }}>
                {d.etiket}
              </button>
            ))}
            <button type="button" title="Bağlantı"
              onMouseDown={(e) => { e.preventDefault(); baglantiEkle() }}>🔗</button>
          </>
        )}
        <button type="button" className={kaynak ? 'etkin' : ''}
          onClick={() => setKaynak((x) => !x)}>
          {kaynak ? 'Yazıya dön' : 'HTML'}
        </button>
      </div>

      {kaynak ? (
        <textarea className="editor-kaynak" value={html} rows={16}
          onChange={(e) => setHtml(e.target.value)} />
      ) : (
        <div ref={kutu} className="editor-govde" contentEditable suppressContentEditableWarning
          onInput={(e) => setHtml((e.target as HTMLDivElement).innerHTML)} />
      )}
    </div>
  )
}
