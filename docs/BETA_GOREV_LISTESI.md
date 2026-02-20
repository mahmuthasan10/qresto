# QResto - Beta Surumu Gorev Listesi

> Bu liste beta surumu icin yapilacak tum gorevleri oncelik sirasina gore icerir.
> Odeme sistemi (iyzico) bu asamada YAPILMAYACAK - once urun dogrulanacak.

---

## Yapilacaklar (Oncelik Sirasina Gore)

### 1. LANDING PAGE
- [ ] Hero section: "Restoraninizi dijitallestirin" + demo butonu
- [ ] Ozellikler bolumu (6 ozellik, ikonlu)
- [ ] Nasil calisiyor? (3 adim: QR okut -> siparis ver -> mutfakta gorun)
- [ ] Beta programi basvuru formu / iletisim bilgileri
- [ ] SSS bolumu
- [ ] Footer (yasal linkler, iletisim)

**Dosya:** `frontend/src/app/page.tsx`

---

### 2. TEMA DUZENLEYICI UI
- [ ] Ayarlar sayfasina "Tema" tab'i ekleme
- [ ] Renk secici: Ana renk (primaryColor), ikincil renk (secondaryColor)
- [ ] Font secimi (3-5 secenek)
- [ ] Koseli/yuvarlak secimi (borderRadius)
- [ ] Canli onizleme
- [ ] Kaydetme -> musteri menusune aninda yansima

**Dosyalar:**
- `frontend/src/app/admin/(protected)/settings/page.tsx`
- `frontend/src/components/providers/ThemeProvider.tsx`

---

### 3. TR/EN DIL TOGGLE
- [ ] Menu sayfasina dil degistirme butonu (TR|EN)
- [ ] Ingilizce alan bossa Turkce goster (fallback)
- [ ] Dil tercihi localStorage'da sakla

**Dosya:** `frontend/src/app/menu/[qrCode]/page.tsx`

---

### 4. BUG FIX ve GUVENLIK
- [ ] `auth.controller.js:147` - `fs.appendFileSync` kaldir
- [ ] `npm audit` calistir ve kritik zafiyetleri duzelt
- [ ] Rate limiting: Login endpoint icin daha siki (5 deneme/15 dk)
- [ ] Input sanitization kontrolu
- [ ] CORS ayarlari gozden gecirme

---

### 5. TOPLU QR KOD INDIRME
- [ ] "Tum QR Kodlari Indir" butonu (masa yonetimi sayfasinda)
- [ ] ZIP dosyasi icinde her masa icin ayri QR PNG
- [ ] Her QR'in altinda masa numarasi/adi
- [ ] Yazdirmaya uygun boyut

**Dosya:** `frontend/src/app/admin/(protected)/tables/page.tsx`

---

### 6. ANALITIK DASHBOARD (TEMEL)
- [x] Bugunun ozeti: siparis sayisi, gelir, aktif masa
- [x] Son 7 gun grafigi (bar chart)
- [x] En cok satan 5 urun
- [x] Siparis durum dagilimi (pie chart)

**Dosya:** `frontend/src/app/admin/(protected)/analytics/page.tsx`

---

### 7. KUCUK IYILESTIRMELER
- [x] Sidebar'a Analytics linki ekle
- [x] Mobile responsive son kontrol
- [x] Toast mesajlari Turkcelelestirme
- [x] Menu sayfasi: Arama/filtreleme
- [x] Siparis takip: Tahmini sure gosterimi
- [x] Mutfak ekrani: Yazdirma modu

---

### 8. YASAL DOKUMANLAR (TEMEL)
- [ ] KVKK Aydinlatma Metni
- [ ] Gizlilik Politikasi
- [ ] Kullanim Kosullari
- [ ] Footer'a linkleri ekleme

---

### 9. DEMO MODU
- [ ] Ornek verilerle dolu demo restoran
- [ ] Landing page'den erisilebilir
- [ ] Read-only mod
- [ ] "Kendi restoraninizi olusturun" CTA

---

### 10. ONBOARDING WIZARD (EN SON)
> Tum ozellikler bittikten sonra yapilacak - rehber her seyi kapsamali.

- [ ] Adim 1: Hosgeldin + Restoran bilgileri
- [ ] Adim 2: Konum ayarlari
- [ ] Adim 3: Tema secimi
- [ ] Adim 4: Ilk kategori olusturma
- [ ] Adim 5: Ilk menu urunu ekleme
- [ ] Adim 6: Masa olusturma + QR kod (KRITIK)
- [ ] Adim 7: Test siparisi
- [ ] Adim 8: Tamamlandi!

---

## YAPILMAYACAKLAR (Beta Sonrasina)
- ~~iyzico odeme entegrasyonu~~
- ~~Abonelik/billing sistemi~~
- ~~Super admin paneli~~
- ~~Staff rolleri (garson, kasiyer)~~
- ~~Coklu sube~~
- ~~Sadakat programi~~

---

*Son guncelleme: 2026-02-19*
