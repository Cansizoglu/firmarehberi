/** Panelde tekrar eden CRUD ekranlarinin tanimi. */

export type AlanTipi =
  | 'metin' | 'uzunmetin' | 'html' | 'sayi' | 'onay'
  | 'secim' | 'gorsel' | 'tarih' | 'eposta' | 'url' | 'slug'

export type Alan = {
  ad: string
  etiket: string
  tip: AlanTipi
  zorunlu?: boolean
  yardim?: string
  ipucu?: string
  /** 'secim' icin sabit secenekler */
  secenekler?: { deger: string; etiket: string }[]
  /** 'secim' icin baska tablodan secenek: tablo adi */
  kaynakTablo?: string
  /** slug otomatik uretilecekse kaynak alan */
  slugKaynak?: string
  /** formda yan yana gostermek icin */
  yarim?: boolean
}

export type Sutun = { ad: string; etiket: string; tip?: 'onay' | 'gorsel' | 'tarih' }

export type Kaynak = {
  anahtar: string
  tablo: string
  tekil: string
  cogul: string
  sutunlar: Sutun[]
  alanlar: Alan[]
  sirala: { ad: string; artan: boolean }[]
  /** Listede ust satirda gosterilecek aciklama */
  not?: string
}

const SEO: Alan[] = [
  { ad: 'baslik', etiket: 'SEO başlığı (title)', tip: 'metin',
    yardim: 'Boş bırakırsan otomatik üretilir.' },
  { ad: 'aciklama', etiket: 'SEO açıklaması (meta description)', tip: 'uzunmetin' },
  { ad: 'canonical', etiket: 'Canonical adres', tip: 'url',
    yardim: 'Boş bırakırsan sayfanın kendi adresi kullanılır.' },
]

const SIRA_AKTIF: Alan[] = [
  { ad: 'sira', etiket: 'Sıra', tip: 'sayi', yarim: true },
  { ad: 'aktif', etiket: 'Yayında', tip: 'onay', yarim: true },
]

export const KAYNAKLAR: Kaynak[] = [
  {
    anahtar: 'iller', tablo: 'iller', tekil: 'İl', cogul: 'İller',
    sirala: [{ ad: 'sira', artan: true }, { ad: 'ad', artan: true }],
    sutunlar: [
      { ad: 'ad', etiket: 'Ad' }, { ad: 'slug', etiket: 'Adres' },
      { ad: 'sira', etiket: 'Sıra' }, { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'ad', etiket: 'İl adı', tip: 'metin', zorunlu: true, yarim: true },
      { ad: 'slug', etiket: 'Adres (slug)', tip: 'slug', slugKaynak: 'ad', zorunlu: true, yarim: true },
      { ad: 'ozet', etiket: 'Kısa özet', tip: 'uzunmetin',
        yardim: 'Sayfanın üstünde, başlığın altında çıkar.' },
      { ad: 'metin', etiket: 'Uzun metin', tip: 'html',
        yardim: 'Ana sayfadaki uzun yazı burası.' },
      { ad: 'gorsel', etiket: 'Öne çıkan görsel', tip: 'gorsel' },
      ...SEO, ...SIRA_AKTIF,
    ],
  },
  {
    anahtar: 'ilceler', tablo: 'ilceler', tekil: 'İlçe', cogul: 'İlçeler',
    sirala: [{ ad: 'sira', artan: true }, { ad: 'ad', artan: true }],
    sutunlar: [
      { ad: 'ad', etiket: 'Ad' }, { ad: 'slug', etiket: 'Adres' },
      { ad: 'sira', etiket: 'Sıra' }, { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'il_id', etiket: 'Bağlı olduğu il', tip: 'secim', kaynakTablo: 'iller', zorunlu: true },
      { ad: 'ad', etiket: 'İlçe adı', tip: 'metin', zorunlu: true, yarim: true },
      { ad: 'slug', etiket: 'Adres (slug)', tip: 'slug', slugKaynak: 'ad', zorunlu: true, yarim: true },
      { ad: 'ozet', etiket: 'Kısa özet', tip: 'uzunmetin' },
      { ad: 'metin', etiket: 'Uzun metin', tip: 'html' },
      { ad: 'gorsel', etiket: 'Öne çıkan görsel', tip: 'gorsel' },
      ...SEO, ...SIRA_AKTIF,
    ],
  },
  {
    anahtar: 'kategoriler', tablo: 'kategoriler', tekil: 'Kategori', cogul: 'Kategoriler',
    sirala: [{ ad: 'sira', artan: true }, { ad: 'ad', artan: true }],
    not: 'Kategoriler tüm iller için ortaktır, her il için ayrıca tanımlamana gerek yok.',
    sutunlar: [
      { ad: 'ad', etiket: 'Ad' }, { ad: 'slug', etiket: 'Adres' },
      { ad: 'sira', etiket: 'Sıra' }, { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'ad', etiket: 'Kategori adı', tip: 'metin', zorunlu: true, yarim: true },
      { ad: 'slug', etiket: 'Adres (slug)', tip: 'slug', slugKaynak: 'ad', zorunlu: true, yarim: true },
      { ad: 'ozet', etiket: 'Kısa özet', tip: 'uzunmetin' },
      { ad: 'metin', etiket: 'Uzun metin', tip: 'html' },
      { ad: 'gorsel', etiket: 'Öne çıkan görsel', tip: 'gorsel' },
      ...SEO, ...SIRA_AKTIF,
    ],
  },
  {
    anahtar: 'bannerlar', tablo: 'bannerlar', tekil: 'Banner', cogul: 'Bannerlar',
    sirala: [{ ad: 'konum', artan: true }, { ad: 'sira', artan: true }],
    not: 'Aynı konumda birden fazla banner varsa her sayfa açılışında dönüşümlü gösterilir.',
    sutunlar: [
      { ad: 'baslik', etiket: 'Başlık' }, { ad: 'konum', etiket: 'Konum' },
      { ad: 'tiklama', etiket: 'Tıklama' }, { ad: 'bitis', etiket: 'Bitiş', tip: 'tarih' },
      { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'baslik', etiket: 'Başlık', tip: 'metin', zorunlu: true },
      { ad: 'alt_yazi', etiket: 'Alt yazı', tip: 'metin' },
      { ad: 'rozet', etiket: 'Rozet', tip: 'metin', yarim: true, ipucu: 'Sponsor Firma' },
      { ad: 'konum', etiket: 'Konum', tip: 'secim', yarim: true, secenekler: [
        { deger: 'ust', etiket: 'Header altı (sarı şerit)' },
        { deger: 'kutu', etiket: 'Hero altındaki 4 kutu alanı' },
        { deger: 'yan', etiket: 'Sidebar (yan sütun)' },
        { deger: 'alt', etiket: 'Sayfa altı' },
        { deger: 'firma', etiket: 'Sadece firma sayfaları' },
      ] },
      { ad: 'link', etiket: 'Gideceği adres', tip: 'url' },
      { ad: 'harita', etiket: 'Harita linki', tip: 'url' },
      { ad: 'gorsel', etiket: 'Banner görseli', tip: 'gorsel',
        yardim: 'Görsel koyarsan yazı yerine görsel gösterilir.' },
      { ad: 'baslangic', etiket: 'Yayın başlangıcı', tip: 'tarih', yarim: true },
      { ad: 'bitis', etiket: 'Yayın bitişi', tip: 'tarih', yarim: true,
        yardim: 'Sponsorluk süresi dolunca kendiliğinden düşer.' },
      ...SIRA_AKTIF,
    ],
  },
  {
    anahtar: 'sayfalar', tablo: 'sayfalar', tekil: 'Sayfa', cogul: 'Sayfalar',
    sirala: [{ ad: 'sira', artan: true }, { ad: 'id', artan: true }],
    not: 'Hakkımızda, KVKK, gizlilik gibi statik sayfalar. Adresi site.com/slug şeklinde olur.',
    sutunlar: [
      { ad: 'baslik', etiket: 'Başlık' }, { ad: 'slug', etiket: 'Adres' },
      { ad: 'menude', etiket: 'Menüde', tip: 'onay' },
      { ad: 'footerda', etiket: 'Alt barda', tip: 'onay' },
      { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'baslik', etiket: 'Sayfa başlığı', tip: 'metin', zorunlu: true, yarim: true },
      { ad: 'slug', etiket: 'Adres (slug)', tip: 'slug', slugKaynak: 'baslik', zorunlu: true, yarim: true },
      { ad: 'icerik', etiket: 'İçerik', tip: 'html' },
      { ad: 'gorsel', etiket: 'Görsel', tip: 'gorsel' },
      { ad: 'meta_baslik', etiket: 'SEO başlığı', tip: 'metin' },
      { ad: 'meta_aciklama', etiket: 'SEO açıklaması', tip: 'uzunmetin' },
      { ad: 'canonical', etiket: 'Canonical adres', tip: 'url' },
      { ad: 'menude', etiket: 'Üst menüde göster', tip: 'onay', yarim: true },
      { ad: 'footerda', etiket: 'Alt barda göster', tip: 'onay', yarim: true },
      ...SIRA_AKTIF,
    ],
  },
  {
    anahtar: 'sss', tablo: 'sss', tekil: 'Soru', cogul: 'S.S.S.',
    sirala: [{ ad: 'sira', artan: true }, { ad: 'id', artan: true }],
    not: 'Kapsam "genel" ise her sayfada çıkar. İlçe veya kategori seçersen sadece o sayfada çıkar.',
    sutunlar: [
      { ad: 'soru', etiket: 'Soru' }, { ad: 'kapsam', etiket: 'Kapsam' },
      { ad: 'sira', etiket: 'Sıra' }, { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'kapsam', etiket: 'Kapsam', tip: 'secim', yarim: true, secenekler: [
        { deger: 'genel', etiket: 'Genel (her sayfada)' },
        { deger: 'ilce', etiket: 'Belirli bir ilçe' },
        { deger: 'kategori', etiket: 'Belirli bir kategori' },
      ] },
      { ad: 'kapsam_id', etiket: 'Kapsam kaydı (ilçe/kategori no)', tip: 'sayi', yarim: true,
        yardim: 'Kapsam genel ise boş bırak.' },
      { ad: 'soru', etiket: 'Soru', tip: 'metin', zorunlu: true },
      { ad: 'cevap', etiket: 'Cevap', tip: 'uzunmetin', zorunlu: true },
      ...SIRA_AKTIF,
    ],
  },
  {
    anahtar: 'blog-kategori', tablo: 'blog_kategori', tekil: 'Blog kategorisi', cogul: 'Blog kategorileri',
    sirala: [{ ad: 'sira', artan: true }, { ad: 'ad', artan: true }],
    sutunlar: [
      { ad: 'ad', etiket: 'Ad' }, { ad: 'slug', etiket: 'Adres' },
      { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'ad', etiket: 'Kategori adı', tip: 'metin', zorunlu: true, yarim: true },
      { ad: 'slug', etiket: 'Adres (slug)', tip: 'slug', slugKaynak: 'ad', zorunlu: true, yarim: true },
      { ad: 'aciklama', etiket: 'Açıklama', tip: 'uzunmetin' },
      ...SIRA_AKTIF,
    ],
  },
  {
    anahtar: 'blog', tablo: 'blog_yazi', tekil: 'Blog yazısı', cogul: 'Blog',
    sirala: [{ ad: 'tarih', artan: false }, { ad: 'id', artan: false }],
    sutunlar: [
      { ad: 'baslik', etiket: 'Başlık' }, { ad: 'tarih', etiket: 'Tarih', tip: 'tarih' },
      { ad: 'okunma', etiket: 'Okunma' }, { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
    alanlar: [
      { ad: 'baslik', etiket: 'Başlık', tip: 'metin', zorunlu: true, yarim: true },
      { ad: 'slug', etiket: 'Adres (slug)', tip: 'slug', slugKaynak: 'baslik', zorunlu: true, yarim: true },
      { ad: 'kategori_id', etiket: 'Kategori', tip: 'secim', kaynakTablo: 'blog_kategori', yarim: true },
      { ad: 'tarih', etiket: 'Yayın tarihi', tip: 'tarih', yarim: true },
      { ad: 'ozet', etiket: 'Kısa özet', tip: 'uzunmetin' },
      { ad: 'icerik', etiket: 'Yazı', tip: 'html' },
      { ad: 'gorsel', etiket: 'Kapak görseli', tip: 'gorsel' },
      { ad: 'yazar', etiket: 'Yazar', tip: 'metin', yarim: true },
      { ad: 'one_cikan', etiket: 'Öne çıkan', tip: 'onay', yarim: true },
      { ad: 'meta_baslik', etiket: 'SEO başlığı', tip: 'metin' },
      { ad: 'meta_aciklama', etiket: 'SEO açıklaması', tip: 'uzunmetin' },
      { ad: 'canonical', etiket: 'Canonical adres', tip: 'url' },
      { ad: 'aktif', etiket: 'Yayında', tip: 'onay' },
    ],
  },
]

export const kaynakBul = (anahtar: string) =>
  KAYNAKLAR.find((k) => k.anahtar === anahtar) ?? null

/** Sol menu — genel CRUD disindaki ozel ekranlar da burada. */
export const MENU: { yol: string; etiket: string; grup: string }[] = [
  { yol: '/admin', etiket: 'Panel', grup: 'Genel' },
  { yol: '/admin/firmalar', etiket: 'Firmalar', grup: 'Rehber' },
  { yol: '/admin/iller', etiket: 'İller', grup: 'Rehber' },
  { yol: '/admin/ilceler', etiket: 'İlçeler', grup: 'Rehber' },
  { yol: '/admin/kategoriler', etiket: 'Kategoriler', grup: 'Rehber' },
  { yol: '/admin/yorumlar', etiket: 'Yorumlar', grup: 'Gelen' },
  { yol: '/admin/basvurular', etiket: 'Başvurular', grup: 'Gelen' },
  { yol: '/admin/sayfalar', etiket: 'Sayfalar', grup: 'İçerik' },
  { yol: '/admin/sss', etiket: 'S.S.S.', grup: 'İçerik' },
  { yol: '/admin/blog', etiket: 'Blog', grup: 'İçerik' },
  { yol: '/admin/blog-kategori', etiket: 'Blog kategorileri', grup: 'İçerik' },
  { yol: '/admin/bannerlar', etiket: 'Bannerlar', grup: 'İçerik' },
  { yol: '/admin/ayarlar', etiket: 'Ayarlar', grup: 'Sistem' },
]
