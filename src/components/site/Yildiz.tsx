/** PHP'deki yildiz() — yarim yildiz icin gradient kullaniliyor. */
export function Yildiz({ puan, buyuk = false }: { puan: number | null; buyuk?: boolean }) {
  if (!puan) return null
  const tam = Math.floor(puan)
  return (
    <span className={'yildiz' + (buyuk ? ' yildiz-buyuk' : '')}>
      {Array.from({ length: 5 }, (_, i) => {
        const renk = i < tam ? '#F2C230' : (i === tam && puan - tam >= 0.4 ? 'url(#yy)' : '#D3D3CB')
        return (
          <svg key={i} viewBox="0 0 20 20" fill={renk}>
            <path d="M10 1.6l2.5 5.3 5.6.8-4 4 .9 5.7-5-2.7-5 2.7.9-5.7-4-4 5.6-.8z" />
          </svg>
        )
      })}
    </span>
  )
}

/** Yarim yildiz gradient tanimi — sayfada bir kez basilir. */
export function YildizDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="yy">
          <stop offset="50%" stopColor="#F2C230" />
          <stop offset="50%" stopColor="#D3D3CB" />
        </linearGradient>
      </defs>
    </svg>
  )
}
