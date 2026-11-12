# Polisi Data & Privasi Pengguna — e-Hadir

Dokumen ini menerangkan dengan telus jenis data yang diproses oleh aplikasi e-Hadir, cara data disimpan, perkhidmatan luar yang terlibat, kawalan akses, dan prosedur penghapusan data.

---

## 1. Data yang Dikumpulkan oleh Aplikasi

Apabila ahli menggunakan e-Hadir, data berikut diproses untuk tujuan pendaftaran mesyuarat:

1. **Maklumat Pengenalan Ahli**:
   - Nombor Gaji / No. Ahli (contoh: `LGM1001`).
   - Nama Penuh Ahli.
   - Bahagian, Unit, atau Cawangan bertugas.
2. **Data Bukti Kehadiran**:
   - Tarikh dan cap masa pendaftaran dibuat.
   - Foto swafoto (*live selfie*) wajah ahli yang diambil secara langsung di dewan.
3. **Data Lokasi Fizikal (Pilihan)**:
   - Koordinat latitud dan longitud kedudukan peranti.
   - Anggaran jarak ke dewan mesyuarat (meter).
   - Ketepatan isyarat GPS (*accuracy in meters*).

---

## 2. Di Mana Data Disimpan?

1. **Simpanan Lalai (Tempatan / Local Storage)**:
   - Semua rekod ahli, foto kehadiran yang dimampatkan, dan status kuorum disimpan di dalam memori pelayar (*Local Storage*) peranti yang menjalankan aplikasi.
   - Data ini tidak dihantar ke mana-mana pelayan luaran tanpa pengetahuan pentadbir.
2. **Simpanan Awan Pilihan (Firebase Firestore & Cloud Storage)**:
   - Sekiranya urus setia memasukkan konfigurasi Firebase dalam tetapan aplikasi, data disegerakkan ke pangkalan data awan Firebase Firestore milik organisasi anda sendiri.

---

## 3. Adakah Data Dihantar ke Perkhidmatan Luar atau AI?

- **Foto Swafoto Wajah**: Foto **TIDAK** dimuat naik ke mana-mana model AI luaran atau perkhidmatan pengecaman wajah awam pihak ketiga. Pemprosesan dan mampatan imej dilakukan sepenuhnya di dalam pelayar peranti (*client-side canvas processing*).
- **Google Maps Platform**:
  - Digunakan untuk memaparkan visualisasi peta dan penanda pin lokasi dewan.
  - Hanya koordinat geografi (latitud dan longitud) yang diproses untuk memaparkan peta. Data peribadi ahli seperti No. Gaji atau foto **TIDAK** disimpan oleh Google Maps Platform.
- **Tiada Penjejak Iklan**: Aplikasi ini tidak mengandungi penjejak analitik komersial, kuki pengiklanan, atau skrip pihak ketiga yang tidak berkaitan.

---

## 4. Kawalan Akses & Siapa yang Boleh Melihat Data

- **Ahli**: Hanya dapat melihat maklumat profil mereka sendiri dan Pas Kehadiran Digital yang dijana untuk diri mereka.
- **Urus Setia**: Hanya individu yang mempunyai **Kod PIN 6-digit Pentadbir** yang sah boleh melihat keseluruhan senarai kehadiran, foto selfie ahli, peta lokasi, serta mengeksport laporan CSV.

---

## 5. Prosedur Penghapusan & Reset Data

Urus setia mempunyai kawalan penuh ke atas data mesyuarat:
- **Reset Kehadiran**: Pilihan untuk mengosongkan rekod kehadiran dan foto selfie bagi memulakan sesi mesyuarat baharu, sambil mengekalkan senarai induk ahli.
- **Padam Keseluruhan (Full Reset)**: Urus setia boleh memadam keseluruhan rekod dan tetapan sesi dengan menaip kata kunci pengesahan `PADAM` pada tetingkap amaran di Papan Pemuka Pentadbir.

---

## 6. Kenyataan Pematuhan & Had Liabiliti

> **Pemberitahuan Penting**: Walaupun sistem ini direka mengikut amalan keselamatan perisian yang baik (seperti pengecaman identiti berpagar PIN, tiada pendedahan kunci rahsia dalam kod frontend, dan pemprosesan setempat), aplikasi ini belum melalui audit pematuhan formal Akta Perlindungan Data Peribadi (PDPA) atau pensijilan keselamatan siber pihak ketiga. Organisasi yang mengendalikan aplikasi ini bertanggungjawab memastikan kebenaran ahli diperoleh mengikut undang-undang dan dasar dalaman masing-masing.
