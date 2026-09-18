# Adana Nakliyat Rehberi

Evden eve nakliyat, asansörlü taşımacılık ve şehirler arası taşıma yapan
firmaların il / ilçe / kategori kırılımıyla listelendiği firma rehberi.

**Next.js 14 (App Router) · TypeScript · Supabase (PostgreSQL + Auth + Storage)**

Kurulum, ortam değişkenleri ve panel kullanımı için **[KURULUM.md](KURULUM.md)**.

## Kısaca

- Ziyaretçi tarafı: il, ilçe, kategori ve firma sayfaları; ücretsiz teklif formu;
  firma yorumları; açık taşınma talepleri; panelden yönetilen statik sayfalar.
- SEO: her sayfa için ayrı başlık/açıklama/canonical, JSON-LD
  (`ItemList`, `MovingCompany`, `FAQPage`, `AggregateRating`), otomatik `sitemap.xml`.
- Yönetim paneli `/admin` altında; firmalar, galeri, yorum onayı, başvurular,
  bannerlar, S.S.S., blog ve site ayarları.

## Geliştirme

```bash
npm install
cp .env.example .env.local
npm run dev
```

`npm run build` · `npm run typecheck`
