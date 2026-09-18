-- Adana Nakliyat Rehberi — PostgreSQL şeması (Supabase)
-- PHP + MySQL sürümünden birebir çevrildi.
-- Supabase SQL Editor'de bir kez çalıştır.

-- ---------- İLLER ----------
create table if not exists iller (
  id          serial primary key,
  ad          varchar(80)  not null,
  slug        varchar(80)  not null unique,
  baslik      varchar(200),
  aciklama    varchar(320),
  ozet        text,
  metin       text,
  gorsel      varchar(200),
  canonical   varchar(400),
  sira        int          not null default 0,
  aktif       boolean      not null default true
);

-- ---------- İLÇELER ----------
create table if not exists ilceler (
  id          serial primary key,
  il_id       int          not null references iller(id) on delete cascade,
  ad          varchar(80)  not null,
  slug        varchar(100) not null,
  baslik      varchar(200),
  aciklama    varchar(320),
  ozet        text,
  metin       text,
  gorsel      varchar(200),
  canonical   varchar(400),
  sira        int          not null default 0,
  aktif       boolean      not null default true,
  unique (il_id, slug)
);
create index if not exists ilceler_il_idx on ilceler(il_id);

-- ---------- KATEGORİLER ----------
create table if not exists kategoriler (
  id          serial primary key,
  ad          varchar(100) not null,
  slug        varchar(120) not null unique,
  baslik      varchar(200),
  aciklama    varchar(320),
  ozet        text,
  metin       text,
  gorsel      varchar(200),
  canonical   varchar(400),
  sira        int          not null default 0,
  aktif       boolean      not null default true
);

-- ---------- FİRMALAR ----------
create table if not exists firmalar (
  id           serial primary key,
  il_id        int          not null references iller(id) on delete cascade,
  ilce_id      int          references ilceler(id) on delete set null,
  ad           varchar(190) not null,
  slug         varchar(190) not null unique,
  mahalle      varchar(120),
  adres        varchar(255),
  tel          varchar(40),
  tel2         varchar(40),
  eposta       varchar(160),
  web          varchar(200),
  place_id     varchar(120),
  harita_link  varchar(400),
  enlem        numeric(10,7),
  boylam       numeric(10,7),
  aciklama     text,
  g_puan       numeric(2,1),
  g_puan_n     int,
  canonical    varchar(400),
  paket        varchar(20)  not null default 'standart',  -- standart | plus | gold
  merkez       boolean      not null default false,
  one_cikan    boolean      not null default false,
  sira         int          not null default 0,
  aktif        boolean      not null default true,
  olusma       timestamptz  not null default now(),
  -- MySQL'deki FIELD(paket,'gold','plus','standart') siralamasinin karsiligi
  paket_sira   smallint generated always as
                 (case paket when 'gold' then 0 when 'plus' then 1 else 2 end) stored
);
create index if not exists firmalar_il_idx    on firmalar(il_id);
create index if not exists firmalar_ilce_idx  on firmalar(ilce_id);
create index if not exists firmalar_aktif_idx on firmalar(aktif);
create index if not exists firmalar_paket_idx on firmalar(paket);
create index if not exists firmalar_sira_idx  on firmalar(paket_sira, one_cikan desc, sira, id);

-- ---------- FİRMA ↔ KATEGORİ ----------
create table if not exists firma_kategori (
  firma_id    int not null references firmalar(id)    on delete cascade,
  kategori_id int not null references kategoriler(id) on delete cascade,
  primary key (firma_id, kategori_id)
);
create index if not exists firma_kategori_kat_idx on firma_kategori(kategori_id);

-- ---------- GALERİ ----------
create table if not exists galeri (
  id        serial primary key,
  firma_id  int          not null references firmalar(id) on delete cascade,
  dosya     varchar(400) not null,   -- Supabase Storage public URL
  alt_yazi  varchar(200),
  kapak     boolean      not null default false,
  sira      int          not null default 0
);
create index if not exists galeri_firma_idx on galeri(firma_id);

-- ---------- YORUMLAR ----------
create table if not exists yorumlar (
  id        serial primary key,
  firma_id  int references firmalar(id) on delete cascade,
  isim      varchar(120) not null,
  ilce      varchar(80),
  puan      smallint     not null default 5 check (puan between 1 and 5),
  yorum     text         not null,
  tarih     date         not null default current_date,
  onayli    boolean      not null default false,
  ip        varchar(45)
);
create index if not exists yorumlar_firma_idx on yorumlar(firma_id);
create index if not exists yorumlar_onay_idx  on yorumlar(onayli);

-- ---------- BAŞVURULAR (teklif / iletişim formları) ----------
create table if not exists basvurular (
  id       serial primary key,
  tur      varchar(20)  not null default 'teklif',
  veri     text,                                  -- JSON: form alanları
  ad       varchar(160),
  tel      varchar(40),
  firma    varchar(190),
  okundu   boolean      not null default false,
  yayinda  boolean      not null default false,   -- /talepler sayfasında görünsün mü
  durum    varchar(20)  not null default 'yeni',
  tarih    timestamptz  not null default now(),
  ip       varchar(45)
);
create index if not exists basvurular_okundu_idx  on basvurular(okundu);
create index if not exists basvurular_yayinda_idx on basvurular(yayinda);

-- ---------- AYARLAR (anahtar/değer) ----------
create table if not exists ayarlar (
  anahtar varchar(60) primary key,
  deger   text
);

-- ---------- S.S.S. ----------
create table if not exists sss (
  id        serial primary key,
  kapsam    varchar(20)  not null default 'genel',  -- genel | ilce | kategori
  kapsam_id int,
  soru      varchar(255) not null,
  cevap     text         not null,
  sira      int          not null default 0,
  aktif     boolean      not null default true
);
create index if not exists sss_kapsam_idx on sss(kapsam, kapsam_id);

-- ---------- BANNERLAR ----------
create table if not exists bannerlar (
  id         serial primary key,
  baslik     varchar(190) not null,
  alt_yazi   varchar(255),
  rozet      varchar(60)  default 'Sponsor Firma',
  link       varchar(400),
  harita     varchar(400),
  gorsel     varchar(400),
  konum      varchar(20)  not null default 'ust',  -- ust | kutu | yan | alt | firma
  sira       int          not null default 0,
  baslangic  date,
  bitis      date,
  tiklama    int          not null default 0,
  aktif      boolean      not null default true
);
create index if not exists bannerlar_konum_idx on bannerlar(konum, aktif);

-- ---------- STATİK SAYFALAR ----------
create table if not exists sayfalar (
  id            serial primary key,
  baslik        varchar(190) not null,
  slug          varchar(190) not null unique,
  icerik        text,
  meta_baslik   varchar(200),
  meta_aciklama varchar(320),
  canonical     varchar(400),
  gorsel        varchar(400),
  menude        boolean      not null default false,
  footerda      boolean      not null default true,
  sira          int          not null default 0,
  aktif         boolean      not null default true,
  guncelleme    timestamptz  not null default now()
);

-- ---------- BLOG ----------
create table if not exists blog_kategori (
  id       serial primary key,
  ad       varchar(120) not null,
  slug     varchar(140) not null unique,
  aciklama varchar(320),
  sira     int          not null default 0,
  aktif    boolean      not null default true
);

create table if not exists blog_yazi (
  id            serial primary key,
  kategori_id   int references blog_kategori(id) on delete set null,
  baslik        varchar(200) not null,
  slug          varchar(200) not null unique,
  ozet          varchar(400),
  icerik        text,
  gorsel        varchar(400),
  meta_baslik   varchar(200),
  meta_aciklama varchar(320),
  canonical     varchar(400),
  yazar         varchar(120),
  okunma        int          not null default 0,
  one_cikan     boolean      not null default false,
  aktif         boolean      not null default true,
  tarih         date         default current_date,
  guncelleme    timestamptz  not null default now()
);
create index if not exists blog_yazi_kat_idx   on blog_yazi(kategori_id);
create index if not exists blog_yazi_aktif_idx on blog_yazi(aktif);

create table if not exists blog_etiket (
  id   serial primary key,
  ad   varchar(80)  not null,
  slug varchar(100) not null unique
);

create table if not exists blog_yazi_etiket (
  yazi_id   int not null references blog_yazi(id)   on delete cascade,
  etiket_id int not null references blog_etiket(id) on delete cascade,
  primary key (yazi_id, etiket_id)
);
create index if not exists blog_yazi_etiket_et_idx on blog_yazi_etiket(etiket_id);
