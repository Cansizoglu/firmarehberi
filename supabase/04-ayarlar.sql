-- Tüm ayar anahtarlarının varsayılanları (PHP sürümündeki ayar() çağrılarının tamamı).
-- Mevcut değerler KORUNUR, yalnızca eksik anahtarlar eklenir.
insert into ayarlar (anahtar, deger) values
  ('site_adi','Adana Nakliyat Rehberi'),
  ('domain','https://adanatasimasirketleri.com.tr'),
  ('mail','agenli86@gmail.com'),
  ('varsayilan_il','adana'),
  ('logo',''),
  ('favicon',''),
  ('og_gorsel',''),
  ('meta_baslik','Adana Nakliyat Rehberi | Evden Eve Nakliyat Firmaları'),
  ('meta_aciklama','Adana evden eve nakliyat firmaları rehberi. İlçe ilçe firma listesi, telefon, adres ve puanlar. Ücretsiz teklif alın.'),
  ('twitter',''), ('facebook',''), ('instagram',''),
  ('smtp_aktif',''), ('smtp_host',''), ('smtp_port','587'), ('smtp_guvenlik','tls'),
  ('smtp_kul',''), ('smtp_sif',''), ('smtp_gonderen',''),
  ('ozel_head',''), ('ozel_body',''), ('yapisal_veri',''),
  ('sabit_link','/talepler'), ('sabit_yazi','Gelen Talepler'),
  ('sidebar_metin',''),
  ('talepler_aktif','1'),
  ('captcha_aktif','1'),
  ('popup_aktif',''), ('popup_baslik',''), ('popup_metin',''),
  ('baraj_aktif','1'),
  ('baraj_ad','Baraj Asansörlü Taşımacılık'),
  ('baraj_alt','Adana geneli asansörlü evden eve nakliyat ve şehir içi taşıma — 7/24 hizmet'),
  ('baraj_site','https://barajasansorlutasimacilik.com.tr/'),
  ('baraj_harita','https://maps.app.goo.gl/GGAYX2uYGeLqDxz46')
on conflict (anahtar) do nothing;

-- PHP v2'de olduğu gibi mevcut sponsor banner'ı taşı (üst şerit boşsa)
insert into bannerlar (baslik, alt_yazi, rozet, link, harita, konum, sira, aktif)
select 'Baraj Asansörlü Taşımacılık',
       'Adana geneli asansörlü evden eve nakliyat ve şehir içi taşıma — 7/24 hizmet',
       'Sponsor Firma',
       'https://barajasansorlutasimacilik.com.tr/',
       'https://maps.app.goo.gl/GGAYX2uYGeLqDxz46',
       'ust', 1, true
where not exists (select 1 from bannerlar where konum = 'ust');
