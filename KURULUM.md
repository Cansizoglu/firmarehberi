# Adana Nakliyat Rehberi — Next.js + Supabase

PHP + MySQL sürümünün Next.js 14 (App Router) + Supabase'e taşınmış hali.
Adres yapısı, tasarım ve panel özellikleri korunmuştur.

---

## 1. Supabase kurulumu

Supabase panelinde **SQL Editor**'ü aç ve `supabase/` klasöründeki dosyaları
**sırayla** çalıştır:

| Sıra | Dosya | Ne yapar |
|---|---|---|
| 1 | `supabase/01-sema.sql` | 16 tabloyu oluşturur |
| 2 | `supabase/02-rls.sql` | Güvenlik kurallarını kurar (herkese açık okuma, yazma sadece panelden) |
| 3 | `supabase/03-veri.sql` | Mevcut verileri yükler: 51 firma, 7 ilçe, 11 kategori, 110 kategori bağı, 6 S.S.S. |
| 4 | `supabase/04-ayarlar.sql` | Eksik ayar anahtarlarını ve sponsor banner'ını ekler |

Dosyalar tekrar çalıştırılabilir; var olan kayıtları bozmaz.

### Storage

**Storage → New bucket** → adı `images`, **Public** işaretli olsun.
Panelden yüklenen tüm görseller buraya gider (PHP'deki `uploads/` klasörünün yerine).

### Panel kullanıcısı

**Authentication → Users → Add user** ile bir kullanıcı oluştur
(e-posta + şifre, "Auto Confirm User" işaretli). Panele bu bilgilerle girilir.
PHP'deki `kullanicilar` tablosu artık kullanılmıyor, yerini Supabase Auth aldı.

---

## 2. Ortam değişkenleri

Vercel → proje → **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL        = https://<proje-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY       = sb_secret_...
NEXT_PUBLIC_SUPABASE_BUCKET     = images
```

`SUPABASE_SERVICE_ROLE_KEY` **gizlidir** — koda, git'e veya sohbete yazılmaz.
Veritabanındaki her şeyi okuyup silebilir; sadece Vercel'de dursun.
Sızdığını düşünüyorsan Supabase → Settings → API Keys'ten yenisini üretip eskisini iptal et.

İsteğe bağlı: `CAPTCHA_SECRET` — form güvenlik sorusunun imzalanması için.
Boş bırakılırsa service role anahtarı kullanılır.

---

## 3. Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local     # değerleri doldur
npm run dev                    # http://localhost:3000
```

---

## 4. Adres yapısı

PHP sürümüyle birebir aynı:

```
/                                   ana sayfa (varsayılan il)
/adana/                             il sayfası
/adana/seyhan/                      ilçe sayfası
/adana/asansorlu-tasimacilik/       il + kategori
/adana/seyhan/evden-eve-nakliyat/   ilçe + kategori
/firma/firma-adi.html               firma sayfası
/talepler                           açık taşınma talepleri
/firma-ekle  /bilgi-al  /tesekkurler
/sitemap.xml  /robots.txt
/<slug>                             panelden eklenen statik sayfalar
```

Eski statik adresler (`/seyhan-evden-eve-nakliyat.html` gibi) kalıcı yönlendirme
ile yeni adreslerine gider — `next.config.js` içinde tanımlı.

Sondaki eğik çizgi: hem `/adana/seyhan/` hem `/adana/seyhan` çalışır, arada
yönlendirme yoktur. Canonical etiketi her zaman eğik çizgili adresi gösterir,
böylece arama motorunda tek adres kalır.

---

## 5. Panel

`/admin` adresinden girilir.

| Bölüm | Ne yapar |
|---|---|
| Panel | Özet sayılar, onay bekleyen yorum ve okunmamış başvuru uyarısı |
| Firmalar | Firma ekle/düzenle, kategori seçimi, fotoğraf galerisi, harita, paket (Standart/Plus/**Gold**), listeden toplu paket ve sıra değiştirme |
| İller / İlçeler / Kategoriler | İçerik, SEO ve öne çıkan görsel |
| Yorumlar | Onay bekleyenleri onayla, elle yorum ekle |
| Başvurular | Gelen teklif/firma/bilgi formları; bir talebi "Nakliyecilere aç" ile `/talepler` sayfasında yayınla |
| Sayfalar | Hakkımızda, KVKK gibi statik sayfalar |
| S.S.S. | Genel ya da ilçe/kategori bazlı |
| Blog | Kategori, yazı, SEO, kapak görseli |
| Bannerlar | 5 konum, yayın tarihi aralığı, tıklama sayacı |
| Ayarlar | Site/logo, SEO ve sosyal medya, Mail/SMTP, kod ve yapısal veri |

---

## 6. PHP sürümünden farklar

- **Veritabanı** MySQL yerine PostgreSQL. `TINYINT(1)` alanlar `boolean` oldu;
  `FIELD(paket,...)` sıralaması `paket_sira` adlı üretilmiş sütuna dönüştü.
- **Görseller** sunucudaki `uploads/` klasörü yerine Supabase Storage'da.
- **Panel girişi** Supabase Auth ile. Kullanıcıyı Supabase panelinden yönetirsin.
- **Güvenlik sorusu** artık PHP oturumu yerine imzalı bir alanla doğrulanıyor
  (sunucusuz ortamda oturum yok).
- **Mail** `mail()` yerine SMTP ile gönderiliyor; ayarlar yine panelde.
  SMTP kapalıysa veya hata verirse talep yine veritabanına yazılır, kaybolmaz.
- **`kurulum.php` ve `guncelle.php` yok** — kurulum yukarıdaki SQL dosyalarıyla yapılır.

## 7. Henüz taşınmayan

- Blog için **site tarafı sayfaları** (`/blog`, `/blog/<slug>`) yazılmadı.
  Tablolar, panel ekranları ve veri hazır; PHP sürümünde de bu sayfalar yoktu.
