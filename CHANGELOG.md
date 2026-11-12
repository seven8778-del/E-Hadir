# Rekod Perubahan (Changelog) — e-Hadir

Semua perubahan dan penambahbaikan penting pada aplikasi e-Hadir direkodkan dalam dokumen ini mengikut format standard penomboran versi.

---

## [1.1.0] — 2026-11-12

### Ditambah (Added):
- **Pengesahan Lokasi Masa Nyata & Geofens (*Google Maps Platform*)**:
  - Pengesanan koordinat GPS pelayar (`navigator.geolocation`) berketepatan tinggi.
  - Pengiraan jarak antara peranti ahli dan pusat dewan rasmi menggunakan formula sfera *Haversine*.
  - Kad status geofens dinamik pada Langkah 2 pengesahan profil ahli (Zon Dewan Sah vs Luar Zon Geofens vs Mod Manual).
  - Butang imbas semula lokasi GPS secara langsung.
- **Peta Interaktif Papan Pemuka Urus Setia (`LiveAttendanceMap`)**:
  - Integrasi rasmi `@vis.gl/react-google-maps` dengan sokongan `AdvancedMarker` dan `InfoWindow`.
  - Penanda pusat dewan acara rasmi dengan ikon khas.
  - Penanda kehadiran ahli berkod warna: Hijau untuk kehadiran dalam zon dan Jingga untuk kehadiran di luar zon geofens.
  - Paparan maklumat ahli, cap masa, jarak dewan, dan bukti foto swafoto apabila penanda pin ditekan.
- **Kawalan Konfigurasi Dewan & Pratetap Lokasi**:
  - Pilihan pratetap pantas dewan konvensyen Malaysia: KLCC Dewan Perdana, WTCKL Dewan Merdeka, PICC Putrajaya, MITEC, dan Setia SPICE.
  - Pilihan pelarasan radius geofens (100m, 250m, 500m, 1000m).
- **Audit Lokasi pada Pas & Laporan**:
  - Penambahan baris status audit lokasi dan koordinat GPS pada Pas Kehadiran Digital rasmi.
  - Penambahan maklumat audit geofens pada modal pemeriksaan gambar swafoto urus setia.
  - Penambahan kolum `Koordinat_Lat_Lng`, `Jarak_Dewan_Meter`, dan `Status_Geofens` pada fail laporan eksport CSV.

---

## [1.0.0] — 2026-11-11

### Ditambah (Added):
- **Pelancaran Asal MVP e-Hadir**:
  - Semakan kelayakan ahli menggunakan No. Gaji / No. Ahli dengan penyeragaman automatik (*case-insensitive*).
  - Pencegahan pendaftaran kehadiran berulang (*BR-02*).
  - Tangkapan swafoto kamera hadapan secara langsung (*live camera stream*) tanpa pilihan muat naik fail galeri bagi menghalang proksi.
  - Algoritma mampatan JPEG sisi klien berasaskan *HTML5 Canvas* (<150KB per imej).
  - Pas Kehadiran Digital bercop keselamatan rasmi dengan kod verifikasi unik dan mod cetak PDF.
  - Papan Pemuka Pentadbir berpagar kod PIN 6-digit.
  - Pengiraan kuorum automatik berbanding sasaran rasmi (*default 50%*).
  - Mod Paparan Skrin Projektor Dewan resolusi tinggi dengan jam digital langsung.
  - Penyelarasan rekod kehadiran antara tab pelayar masa nyata menggunakan *BroadcastChannel API*.
  - Muat naik dan eksport senarai induk format CSV dengan pengepala *UTF-8 BOM*.
  - Reka bentuk korporat institusi bersih mengikut garis panduan reka bentuk tanpa *candy pills* dan kontras tinggi.
