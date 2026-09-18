import type { Sss } from '@/lib/tipler'

/** S.S.S. akordiyonu + FAQPage yapisal verisi (PHP: sss_blok). */
export function SssBlok({ liste }: { liste: Sss[] }) {
  if (!liste.length) return null

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: liste.map((s) => ({
      '@type': 'Question',
      name: s.soru,
      acceptedAnswer: { '@type': 'Answer', text: s.cevap },
    })),
  }

  return (
    <>
      <div className="sss">
        {liste.map((s) => (
          <details key={s.id}>
            <summary>{s.soru}</summary>
            <p>{s.cevap}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  )
}
