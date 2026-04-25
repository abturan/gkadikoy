# Gazete Kadıköy App - TODO

## Veritabanı & Backend
- [x] Haber (articles) tablosu şeması
- [x] Kategori (categories) tablosu şeması
- [x] Yazar (authors) tablosu şeması
- [x] Galeri (galleries) tablosu şeması
- [x] Etkinlik (events) tablosu şeması
- [x] tRPC router: haberler (liste, detay, arama, kategori filtresi)
- [x] tRPC router: kategoriler
- [x] tRPC router: yazarlar
- [x] tRPC router: galeriler (foto & video)
- [x] tRPC router: etkinlikler
- [x] Seed data: örnek haberler, yazarlar, galeriler, etkinlikler

## Tasarım Sistemi
- [x] Global CSS değişkenleri (açık/koyu tema renkleri)
- [x] Tipografi sistemi (font seçimi, boyutlar)
- [x] Dark/Light tema toggle (ThemeProvider + switchable)
- [x] Responsive breakpoint sistemi

## Layout & Navigasyon
- [x] Header: logo, navigasyon menüsü, arama, tema toggle
- [x] Footer: kategoriler, sosyal medya, telif hakkı
- [x] Mobil hamburger menü

## Ana Sayfa
- [x] Son dakika akan bandı (ticker)
- [x] Öne çıkan haberler slider
- [x] Kategori bazlı haber bölümleri (Gündem, Yaşam, Kültür Sanat, Çevre, Sağlık, Spor, Eğitim)
- [x] Haftanın yazarları bölümü
- [x] Etkinlik takvimi widget
- [x] Foto/Video galeri widget

## Kategori Sayfaları
- [x] Sayfalandırılmış haber listesi
- [x] Filtreleme seçenekleri (sıralama)

## Haber Detay Sayfası
- [x] Tam haber içeriği
- [x] Kategori etiketi ve tarih bilgisi
- [x] İlgili haberler bölümü
- [x] Yazar bilgisi

## Arama
- [x] Anlık/canlı arama (debounce ile)
- [x] Başlık ve içerik araması
- [x] Arama sonuçları sayfası
- [x] Header'da anlık arama dropdown

## Galeri Sayfaları
- [x] Foto galeri sayfası (lightbox ile)
- [x] Video galeri sayfası (modal player ile)

## Yazarlar Sayfası
- [x] Yazar profilleri listesi
- [x] Yazar detay sayfası (yazıları ile)

## Etkinlik Takvimi
- [x] "Bu Hafta Ne Yapmalı?" başlığı
- [x] Etkinlik kartları (tarih, konum, kategori)
- [x] Kategori filtresi
- [x] Bu hafta / yaklaşan / geçmiş gruplandırması

## Genel
- [x] Vitest testleri (17 test geçiyor)
- [x] Responsive & mobil uyumluluk

## Tasarım Yenileme (v2 - Premium Estetik)
- [x] Global CSS: Yeni premium renk paleti (OKLCH), gelişmiş tipografi, glassmorphism, derinlik sistemi
- [x] Mikro-animasyonlar: hover, geçiş efektleri (CSS transitions & keyframes)
- [x] Header: Premium navigasyon, gelişmiş arama UX, zarif tema toggle
- [x] Footer: Rafine ve zarif footer tasarımı
- [x] ArticleCard: Premium kart tasarımı, derinlik ve hover efektleri
- [x] Ana sayfa: Eşsiz hero slider, gelişmiş son dakika bandı, premium kategori bölümleri
- [x] Kategori sayfası: Premium grid layout, gelişmiş filtreleme UI
- [x] Haber detay sayfası: Editoryal premium layout, tipografik mükemmellik
- [x] Arama sayfası: Gelişmiş arama deneyimi
- [x] Foto galeri: Premium galeri tasarımı
- [x] Video galeri: Premium video galeri tasarımı
- [x] Yazarlar sayfası: Premium yazar profilleri
- [x] Etkinlik takvimi: Premium etkinlik kartları
- [x] Responsive iyileştirmeler: Tüm breakpoint'lerde kusursuz görünüm

## Renk Güncellemeleri (v2.1)
- [x] Header üst bar rengini maviye çevir
- [x] Logo rengini maviye çevir

## iOS 26 Liquid Glass / Crystal Design (v3)
- [x] iOS 26 Liquid Glass tasarım sistemi araştırması
- [x] Global CSS: Liquid Glass efektleri, translucent katmanlar, ışık kırılmaları
- [x] Header: Liquid Glass navigasyon barı
- [x] Footer: Crystal Design stili
- [x] ArticleCard: Glass morphism kart tasarımı
- [x] Ana sayfa: Liquid Glass bileşenler
- [x] Tüm alt sayfalar: Crystal Design uyumu
- [x] Dark/Light tema: Liquid Glass uyumlu tema geçişleri

## Rapor Eksikleri (v4 - Book Love Creative Raporu)
- [x] Ana sayfaya "En Çok Okunanlar" sidebar bölümü
- [x] Ana sayfaya "Newsletter Kayıt" alanı
- [x] Haber detayına yazar kutusu (fotoğraf, bio, son yazıları)
- [x] Haber detayına okuma süresi tahmini
- [x] Haber detayına sticky paylaşım çubuğu (Twitter, Facebook, WhatsApp, kopyala)
- [x] Etiket (tag) sistemi - veritabanı + UI
- [x] Ana sayfaya hava durumu widget (Kadıköy)
- [x] Ana sayfaya nöbetçi eczane widget
- [x] Kategori sayfalarına tarih filtreleme (bugün, bu hafta, bu ay)
- [x] Open Graph meta etiketleri (statik, index.html)
- [x] Breadcrumb navigasyonu
- [x] EventsPage Liquid Glass tasarım güncellemesi
- [x] Haber detayına "Bu haberde hata mı var?" geri bildirim bağlantısı

## Bug Fix (v4.1)
- [x] Son dakika bandındaki haberler üst üste biniyor - boşluk bırak ve düzelt

## UI İyileştirme (v4.2)
- [x] Hava durumu ve nöbetçi eczane widget'larını küçült ve haber akışının arasına konumlandır

## Yeni Özellik (v4.3)
- [x] Sidebar'a "Kadıköylü Sanatçılar" bileşeni ekle (alt başlık: "Haftanın Sanatçısı")
- [x] Şeyma Türk fotoğrafını ve eserlerini göm
- [x] Widget'lar ile En Çok Okunanlar arasına konumlandır
