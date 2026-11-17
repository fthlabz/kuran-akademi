# Kur’an Akademi

Kaynak bilinciyle Kur’an ayetlerini incelemek için geliştirilen mobil uyumlu araştırma laboratuvarı.

## Özellikler
- Kullanıcının belirlediği 14 başlıklı ayet çözümleme çerçevesi
- Açık/koyu/sistem teması
- Renk kodlu başlıklar ve akademik vurgu alanları
- Telefon/tarayıcı yerleşik metin seslendirmesi
- OpenAI API anahtarı yalnızca sunucuda tutulur

## Yerel çalıştırma
Node.js 20+ kurun, npm install çalıştırın, .env.example dosyasını .env olarak kopyalayıp OPENAI_API_KEY ekleyin ve npm start komutunu çalıştırın.

## Render
Web Service oluşturun, bu GitHub deposunu bağlayın. Build Command: npm install. Start Command: npm start. Environment Variables alanına OPENAI_API_KEY ve isteğe bağlı OPENAI_MODEL ekleyin.

## Akademik sınır
İlk sürümde otomatik akademik kaynak/veritabanı entegrasyonu henüz yoktur. Modelin kaynak erişimi olmadan bibliyografik kayıt uydurmaması ve doğrulanması gereken noktaları belirtmesi için yönergeler eklenmiştir. Güvenilir açık erişim kaynak kütüphanesi ve ayet/kök veri tabanı sonraki geliştirme aşamasıdır.
