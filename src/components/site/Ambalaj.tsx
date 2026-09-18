/** Tasinmada kullanilan ambalaj malzemeleri — PHP'deki ambalaj_blok(). */
const KARTLAR: { ad: string; aciklama: string; svg: React.ReactNode }[] = [
  {
    ad: 'Çift Katlı Koli',
    aciklama: 'Kitap, mutfak ve kırılabilir eşya için oluklu mukavva koli.',
    svg: (
      <svg viewBox="0 0 90 76" width="90" height="76">
        <path d="M6 22L45 6l39 16-39 15z" fill="#C57B45" />
        <path d="M6 22v34l39 16V37z" fill="#9C5A2C" />
        <path d="M84 22v34L45 72V37z" fill="#83491F" />
        <rect x="40" y="14" width="10" height="56" fill="#F2C230" />
      </svg>
    ),
  },
  {
    ad: 'Balonlu Naylon',
    aciklama: 'Cam, ayna, tablo ve elektronik eşyanın darbe koruması.',
    svg: (
      <svg viewBox="0 0 90 76" width="90" height="76">
        <rect x="10" y="12" width="70" height="52" rx="6" fill="#DCE6E1" />
        {[24, 40, 56].map((cy) =>
          [20, 35, 50, 65].map((cx) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5.5" fill="#B6C7BE" />
          )))}
        <rect x="10" y="12" width="70" height="52" rx="6" fill="none" stroke="#9C5A2C" strokeWidth="3" />
      </svg>
    ),
  },
  {
    ad: 'Streç Film ve Bant',
    aciklama: 'Mobilya ve çekmecelerin taşıma boyunca sabitlenmesi.',
    svg: (
      <svg viewBox="0 0 90 76" width="90" height="76">
        <ellipse cx="45" cy="22" rx="30" ry="11" fill="#F2C230" />
        <path d="M15 22v32a30 11 0 0060 0V22z" fill="#D9A912" />
        <ellipse cx="45" cy="22" rx="13" ry="5" fill="#9C5A2C" />
      </svg>
    ),
  },
  {
    ad: 'Elbise Kolisi',
    aciklama: 'Askılı kıyafetlerin buruşmadan taşınması için askı barlı koli.',
    svg: (
      <svg viewBox="0 0 90 76" width="90" height="76">
        <rect x="18" y="16" width="54" height="52" rx="4" fill="#C57B45" />
        <rect x="18" y="16" width="54" height="10" fill="#9C5A2C" />
        <rect x="24" y="24" width="42" height="4" rx="2" fill="#F2C230" />
        <path d="M38 28v10m14-10v10" stroke="#7A4420" strokeWidth="3" />
        <path d="M31 38h14v22H31zm14 0h14v22H45z" fill="#E2C7AC" opacity=".8" />
      </svg>
    ),
  },
  {
    ad: 'Asansörlü Taşıma',
    aciklama: '3. kat ve üzerinde merdiven yerine dış cephe asansörü.',
    svg: (
      <svg viewBox="0 0 90 76" width="90" height="76">
        <rect x="8" y="8" width="34" height="60" fill="#DCE6E1" stroke="#9C5A2C" strokeWidth="2" />
        {[15, 30, 45].map((y) =>
          [14, 28].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" fill="#B6C7BE" />
          )))}
        <path d="M50 70L78 14" stroke="#9C5A2C" strokeWidth="5" />
        <path d="M56 70L84 14" stroke="#9C5A2C" strokeWidth="5" />
        <rect x="58" y="30" width="20" height="14" rx="2" fill="#F2C230" stroke="#8A6A0C" strokeWidth="2" />
      </svg>
    ),
  },
  {
    ad: 'Montaj ve Demontaj',
    aciklama: 'Mobilyanın sökülüp yeni evde ustasınca kurulması.',
    svg: (
      <svg viewBox="0 0 90 76" width="90" height="76">
        <path d="M20 60l26-26" stroke="#9C5A2C" strokeWidth="8" strokeLinecap="round" />
        <path d="M44 30a12 12 0 1114 14l-4-4 4-8-8 4z" fill="#7A4420" />
        <circle cx="24" cy="56" r="6" fill="#F2C230" stroke="#8A6A0C" strokeWidth="2" />
        <rect x="58" y="52" width="22" height="16" rx="3" fill="#C57B45" />
      </svg>
    ),
  },
]

export function AmbalajBlok({ adet = 6 }: { adet?: number }) {
  return (
    <div className="ambalaj">
      {KARTLAR.slice(0, adet).map((k) => (
        <div className="amb-kart" key={k.ad}>
          {k.svg}
          <h3>{k.ad}</h3>
          <p>{k.aciklama}</p>
        </div>
      ))}
    </div>
  )
}
