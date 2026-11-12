# Status Semasa & Perancangan (Roadmap)

Dokumen ini merekodkan status sebenar ciri-ciri aplikasi e-Hadir, hasil ujian yang telah disahkan, isu-isu yang diketahui, serta perancangan untuk fasa-fasa berikutnya.

---

## 1. Status Ciri Aplikasi

### A. Telah Dibina & Telah Diuji (Built & Tested in Development)
- **Modul Pendaftaran Kehadiran Ahli**:
  - Input dan penyeragaman No. Gaji (*case-insensitive*).
  - Pengesanan kehadiran berulang (*duplicate attendance detection*).
  - Tangkapan kamera hadapan masa nyata (*WebRTC getUserMedia*).
  - Algoritma mampatan JPEG sisi klien (mengurangkan saiz imej ke purata 40KB - 90KB, sentiasa di bawah had 150KB).
  - Penjanaan Pas Kehadiran Digital dengan kod verifikasi unik.
  - Mod cetak dan simpan PDF pas digital.
- **Modul Pengesahan Lokasi Masa Nyata (*Geofencing*)**:
  - Pengesanan koordinat GPS pelayar (`navigator.geolocation`).
  - Pengiraan jarak formula *Haversine* berbanding dewan acara.
  - Peta interaktif Google Maps Platform (`@vis.gl/react-google-maps`) dengan penanda dewan dan ahli.
  - Penandaan status automatik (Dalam Zon Dewan vs Luar Zon).
- **Papan Pemuka Urus Setia & Kuorum**:
  - Perlindungan pintu masuk menggunakan PIN pentadbir 6-digit.
  - Pengiraan kuorum automatik dan visualisasi bar kemajuan.
  - Penapisan mengikut status (Semua / Sudah Hadir / Belum Hadir) dan bahagian jabatan.
  - Carian dinamik nama dan No. Gaji.
  - Butang buka dan tutup sesi pendaftaran.
- **Mod Paparan Skrin Projektor Dewan**:
  - Paparan resolusi tinggi skrin penuh (*fullscreen*).
  - Penyelarasan masa nyata pertambahan kehadiran antara tab pelayar (*BroadcastChannel API*).
  - Paparan jam rasmi dewan berdetik setiap saat.
- **Pengurusan Fail CSV**:
  - Muat turun templat CSV contoh.
  - Muat naik fail CSV senarai induk dengan pilihan *Merge* atau *Replace*.
  - Eksport senarai kehadiran ke fail CSV dengan pengepala UTF-8 BOM bagi mengelakkan herotan tulisan dalam Microsoft Excel.

### B. Belum Disahkan di Lapangan Sebenar (Unverified in Live Environment)
- **Prestasi Bebanan Serentak di Dewan Fizikal**: Aplikasi telah diuji dengan lancar dalam simulasi pelayar, tetapi belum diuji di dewan mesyuarat sebenar dengan capaian serentak beratus-ratus pengguna melalui rangkaian Wi-Fi dewan yang sesak.
- **Ketepatan Isyarat GPS di Dalam Bangunan Tertutup (*Indoor GPS*)**: Isyarat GPS satelit lazimnya mengalami penurunan ketepatan di dalam dewan konvensyen tertutup tanpa tingkap (*indoor attenuation*). Dalam keadaan ini, sistem bergantung pada isyarat Wi-Fi/menara selular peranti.

---

## 2. Isu yang Diketahui (Known Limitations)

1. **Storan Tempatan Asas (Local Storage)**:
   - Secara lalai tanpa konfigurasi Firebase, rekod kehadiran disimpan dalam *Local Storage* pelayar peranti yang menjalankan aplikasi.
   - Sekiranya menggunakan beberapa komputer urus setia yang berasingan tanpa menyambungkan konfigurasi Firebase, data antara komputer tidak diselaraskan secara awan.
2. **Kebenaran Kamera pada Pelayar Mudah Alih Tertentu**:
   - Sesetengah pelayar dalam aplikasi media sosial (seperti pelayar dalaman Facebook atau Telegram) mungkin menyekat capaian kamera WebRTC secara lalai. Ahli disyorkan membuka pautan menggunakan pelayar Chrome atau Safari.
3. **Ketiadaan Perkakasan GPS pada Komputer Meja (Desktop)**:
   - Komputer meja yang tidak mempunyai cip GPS akan melaporkan ralat peranti lokasi. Sistem menangani situasi ini dengan mengkategorikan pendaftaran sebagai pendaftaran kiosk manual tanpa menyekat ahli.

---

## 3. Perancangan Masa Depan (Roadmap)

> *Nota: Urutan dan pelaksanaan bergantung kepada keutamaan pihak berkepentingan.*

- **Fasa 2: Pemadanan Wajah Automatik (Facial Verification)**:
  - Memadankan foto selfie semasa mendaftar dengan gambar profil ahli sedia ada dalam pangkalan data menggunakan model AI visi komputer.
- **Fasa 3: Pendaftaran Kod QR / Imbasan Kad Pintar (NFC)**:
  - Menyediakan pilihan mengimbas kod QR pendaftaran pada surat jemputan atau mengimbas kad staf fizikal untuk pendaftaran yang lebih pantas.
- **Fasa 4: Sistem Pengundian Mesyuarat (e-Voting)**:
  - Membolehkan ahli yang telah sah hadir di dewan untuk mengundi usul mesyuarat atau memilih ahli jawatankuasa secara digital dari tempat duduk masing-masing.
- **Fasa 5: Notifikasi WhatsApp / SMS Rasmi**:
  - Menghantar salinan Pas Kehadiran Digital terus ke nombor WhatsApp atau emel ahli sebaik sahaja selesai mendaftar.
