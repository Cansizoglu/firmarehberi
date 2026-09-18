export type Il = {
  id: number; ad: string; slug: string
  baslik: string | null; aciklama: string | null
  ozet: string | null; metin: string | null
  gorsel: string | null; canonical: string | null
  sira: number; aktif: boolean
}

export type Ilce = Il & { il_id: number }

export type Kategori = {
  id: number; ad: string; slug: string
  baslik: string | null; aciklama: string | null
  ozet: string | null; metin: string | null
  gorsel: string | null; canonical: string | null
  sira: number; aktif: boolean
}

export type Paket = 'standart' | 'plus' | 'gold'

export type Firma = {
  id: number; il_id: number; ilce_id: number | null
  ad: string; slug: string
  mahalle: string | null; adres: string | null
  tel: string | null; tel2: string | null
  eposta: string | null; web: string | null
  place_id: string | null; harita_link: string | null
  enlem: number | null; boylam: number | null
  aciklama: string | null
  g_puan: number | null; g_puan_n: number | null
  canonical: string | null; paket: Paket
  merkez: boolean; one_cikan: boolean
  sira: number; aktif: boolean; olusma: string
}

/** Firma + join'lenen il/ilce adlari (PHP'deki firma_sorgu ile ayni sekil). */
export type FirmaGenis = Firma & {
  ilce_ad: string | null; ilce_slug: string | null
  il_ad: string | null; il_slug: string | null
}

export type Galeri = {
  id: number; firma_id: number; dosya: string
  alt_yazi: string | null; kapak: boolean; sira: number
}

export type Yorum = {
  id: number; firma_id: number | null; isim: string
  ilce: string | null; puan: number; yorum: string
  tarih: string; onayli: boolean; ip: string | null
}

export type Basvuru = {
  id: number; tur: string; veri: string | null
  ad: string | null; tel: string | null; firma: string | null
  okundu: boolean; yayinda: boolean; durum: string
  tarih: string; ip: string | null
}

export type Sss = {
  id: number; kapsam: string; kapsam_id: number | null
  soru: string; cevap: string; sira: number; aktif: boolean
}

export type BannerKonum = 'ust' | 'kutu' | 'yan' | 'alt' | 'firma'

export type Banner = {
  id: number; baslik: string; alt_yazi: string | null
  rozet: string | null; link: string | null; harita: string | null
  gorsel: string | null; konum: BannerKonum; sira: number
  baslangic: string | null; bitis: string | null
  tiklama: number; aktif: boolean
}

export type Sayfa = {
  id: number; baslik: string; slug: string; icerik: string | null
  meta_baslik: string | null; meta_aciklama: string | null
  canonical: string | null; gorsel: string | null
  menude: boolean; footerda: boolean
  sira: number; aktif: boolean; guncelleme: string
}

export type BlogKategori = {
  id: number; ad: string; slug: string
  aciklama: string | null; sira: number; aktif: boolean
}

export type BlogYazi = {
  id: number; kategori_id: number | null
  baslik: string; slug: string; ozet: string | null; icerik: string | null
  gorsel: string | null; meta_baslik: string | null; meta_aciklama: string | null
  canonical: string | null; yazar: string | null
  okunma: number; one_cikan: boolean; aktif: boolean
  tarih: string | null; guncelleme: string
}

export type Ayarlar = Record<string, string>
