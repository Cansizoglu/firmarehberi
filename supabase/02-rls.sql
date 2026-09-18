-- RLS — herkese açık okuma, yazma yalnızca service role (admin panel sunucu tarafı).
-- Ziyaretçi formları (yorum, teklif) da sunucu tarafından service role ile yazılır,
-- bu yüzden anon rolüne insert izni verilmiyor.

alter table iller            enable row level security;
alter table ilceler          enable row level security;
alter table kategoriler      enable row level security;
alter table firmalar         enable row level security;
alter table firma_kategori   enable row level security;
alter table galeri           enable row level security;
alter table yorumlar         enable row level security;
alter table basvurular       enable row level security;
alter table ayarlar          enable row level security;
alter table sss              enable row level security;
alter table bannerlar        enable row level security;
alter table sayfalar         enable row level security;
alter table blog_kategori    enable row level security;
alter table blog_yazi        enable row level security;
alter table blog_etiket      enable row level security;
alter table blog_yazi_etiket enable row level security;

-- Herkese açık okuma (site tarafı)
do $$
declare t text;
begin
  foreach t in array array[
    'iller','ilceler','kategoriler','firmalar','firma_kategori','galeri',
    'ayarlar','sss','bannerlar','sayfalar',
    'blog_kategori','blog_yazi','blog_etiket','blog_yazi_etiket'
  ] loop
    execute format('drop policy if exists %I on %I', t || '_okuma', t);
    execute format('create policy %I on %I for select to anon, authenticated using (true)', t || '_okuma', t);
  end loop;
end $$;

-- Yorumlar: yalnızca onaylananlar herkese açık
drop policy if exists yorumlar_okuma on yorumlar;
create policy yorumlar_okuma on yorumlar
  for select to anon, authenticated using (onayli = true);

-- Başvurular: yalnızca "nakliyecilere açılmış" olanlar, kişisel alanlar sitede gösterilmez
drop policy if exists basvurular_okuma on basvurular;
create policy basvurular_okuma on basvurular
  for select to anon, authenticated using (yayinda = true);

-- Yazma izni yok: service role RLS'i zaten atlar, admin panel onu kullanır.
