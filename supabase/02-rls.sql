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

-- Tablo düzeyi izinler. Supabase yeni tablolara bunları normalde kendisi verir
-- (public şemasındaki default privileges), ama dosya tek başına da doğru
-- çalışsın diye açıkça yazıyoruz. RLS satır filtresi üstte duruyor: okuma izni
-- olan rol yine sadece politikanın izin verdiği satırları görür.
do $$
declare r text;
begin
  foreach r in array array['anon','authenticated','service_role'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('grant usage on schema public to %I', r);
      execute format('grant select on all tables in schema public to %I', r);
      execute format('alter default privileges in schema public grant select on tables to %I', r);
    end if;
  end loop;

  -- service_role RLS'i atlar ve panel yazma işlerini onunla yapar
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on all tables in schema public to service_role;
    grant usage, select on all sequences in schema public to service_role;
    alter default privileges in schema public grant all on tables to service_role;
    alter default privileges in schema public grant usage, select on sequences to service_role;
  end if;
end $$;
