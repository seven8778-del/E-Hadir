# Keperluan Produk (PRD) — e-Hadir

Dokumen ini merumuskan objektif produk, skop MVP (*Minimum Viable Product*), peraturan perniagaan (*business rules*), dan aliran pengguna bagi aplikasi **e-Hadir** berdasarkan dokumen keperluan produk asal (*e-Hadir Product Requirements Document PRD v1.0*).

---

## 1. Tujuan Produk & Pengguna Sasaran

### Tujuan Utama:
Menyediakan sistem pendaftaran kehadiran mesyuarat agung tahunan yang sahih, telus, pantas, dan kalis penipuan, di samping menyediakan pemantauan kuorum mesyuarat secara masa nyata tanpa kelewatan manual.

### Pengguna Sasaran:
1. **Ahli Mesyuarat**: Ahli koperasi, kakitangan organisasi, atau delegasi yang menghadiri mesyuarat secara fizikal.
2. **Urus Setia Pendaftaran**: Petugas yang menguruskan kaunter pendaftaran, menyemak kehadiran luar jangka, dan menyelaraskan senarai ahli.
3. **Pengerusi & Kepimpinan Mesyuarat**: Individu yang memerlukan pengesahan rasmi bahawa kuorum undang-undang telah tercapai sebelum mesyuarat dimulakan.

---

## 2. Skop MVP (Fasa Semasa)

| Modul / Ciri | Status Skop | Penerangan |
| :--- | :--- | :--- |
| **Carian & Semakan No. Gaji** | MVP (Telah Dibina) | Pengesahan nombor kakitangan/ahli terhadap senarai induk. |
| **Pencegahan Kehadiran Pendua** | MVP (Telah Dibina) | Menghalang pendaftaran berulang kali bagi No. Gaji yang sama. |
| **Kamera Swafoto Langsung (Live Selfie)** | MVP (Telah Dibina) | Tangkapan kamera hadapan masa nyata tanpa pilihan muat naik gambar. |
| **Mampatan Imej Tempatan (<150KB)** | MVP (Telah Dibina) | Mampatan JPEG automatik pada pelayar tanpa beban pelayan. |
| **Pengesahan Geofens GPS** | MVP (Telah Dibina) | Semakan jarak kedudukan fizikal ahli berbanding koordinat dewan rasmi. |
| **Pas Kehadiran Digital Rasmi** | MVP (Telah Dibina) | Pas akreditasi bercop keselamatan dengan kod pengesahan dan fungsi cetak. |
| **Papan Pemuka Urus Setia & Peta** | MVP (Telah Dibina) | Pemantauan kuorum, penunjuk peta Google Maps, dan kawalan sesi. |
| **Mod Projektor Skrin Dewan** | MVP (Telah Dibina) | Paparan resolusi tinggi skrin penuh untuk projektor atau layar LED. |
| **Import & Eksport Senarai CSV** | MVP (Telah Dibina) | Sokongan UTF-8 BOM untuk Microsoft Excel dan Google Sheets. |
| *Pengecaman Wajah Berpusat (Facial AI Matching)* | Fasa Seterusnya (Rancangan) | Pemadanan wajah automatik menggunakan model AI biometrik. |
| *Sistem Pengundian Digital (e-Voting)* | Fasa Seterusnya (Rancangan) | Pengundian usul dan perlantikan jawatankuasa secara dalam talian. |

---

## 3. Peraturan Perniagaan (Business Rules)

- **BR-01: Padanan No. Gaji Sah**: Hanya nombor gaji yang wujud dalam senarai induk layak mendaftar. Sistem menyelaraskan huruf kecil/besar (*case-insensitive*) dan membuang ruang kosong (*whitespace*).
- **BR-02: Pencegahan Kehadiran Berganda**: Sekiranya nombor gaji telah pun mencatatkan kehadiran, cubaan kali kedua akan dihalang serta-merta. Sistem akan memaparkan semula salinan Pas Digital yang asal tanpa mengubah cap masa asal.
- **BR-03: Tangkapan Swafoto Dewan Sahaja**: Pendaftaran wajib disertakan dengan foto kamera langsung. Muat naik fail gambar galeri dilarang sama sekali bagi mengelakkan penipuan kehadiran proksi.
- **BR-04: Mampatan Imej Ringan**: Foto yang dirakam mestilah bersaiz di bawah 150KB menggunakan pemformatan JPEG untuk memastikan kelancaran pangkalan data dan masa pemuatan yang pantas.
- **BR-05: Penyelarasan Senarai Induk (Merge vs Replace)**: Apabila memuat naik fail CSV baharu ketika sesi kehadiran sedang berlangsung, urus setia mesti diberi pilihan sama ada mahu menggabungkan ahli baharu (*merge*) atau memadam rekod untuk memulakan sesi baharu (*replace*).
- **BR-06: Kawalan Pembukaan Sesi**: Apabila pendaftaran ditutup oleh urus setia, tiada pendaftaran baharu boleh dilakukan oleh mana-mana ahli di kiosk atau BYOD.
- **BR-07: Integriti Geofens**: Data kedudukan GPS ahli direkodkan bersama pendaftaran untuk tujuan audit lokasi dewan. Sekiranya peranti tidak membekalkan GPS, pendaftaran ditandakan sebagai manual tanpa menyekat hak ahli.

---

## 4. Aliran Kerja Pengguna (User Flows)

### Aliran A: Ahli di Kiosk / Peranti Sendiri (BYOD)
```
[Masukkan No. Gaji]
         ↓
[Sistem Sahkan No. Gaji & Papar Profil Ahli]
         ↓
[Sistem Semak Kedudukan GPS Peranti lwn Dewan]
         ↓
[Ahli Ambil Foto Swafoto (Live Selfie)]
         ↓
[Mampatan Imej <150KB & Simpan Data]
         ↓
[Paparan Pas Kehadiran Digital Rasmi]
```

### Aliran B: Urus Setia & Papan Pemuka
```
[Tekan Pautan Urus Setia & Masukkan PIN 6-Digit]
         ↓
[Papan Pemuka Urus Setia]
    ├── Pemantauan Peratusan Kuorum Semasa
    ├── Peta Interaktif Kedudukan Geofens Ahli
    ├── Semakan & Carian Senarai Ahli & Foto Selfie
    ├── Muat Naik / Muat Turun Senarai CSV
    └── Buka / Tutup Pendaftaran Sesi
```

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

1. **Semakan No. Gaji**: Masa respons pengesahan No. Gaji di bawah 1 saat.
2. **Integriti Foto**: Foto swafoto tidak boleh dimuat naik melalui fail setempat; hanya dari strim kamera langsung.
3. **Saiz Data Foto**: Rentetan base64 foto selfie tidak melebihi 150KB.
4. **Ketepatan Kuorum**: Pengiraan peratusan kuorum tepat sehingga satu tempat perpuluhan dan dikemas kini secara langsung.
5. **Keserasian Fail CSV**: Fail CSV yang dieksport boleh dibuka dalam Microsoft Excel tanpa ralat karakter bahasa (*UTF-8 BOM support*).
6. **Keselamatan Pentadbir**: Bahagian urus setia dilindungi dengan kod laluan PIN 6-digit.
