# Panduan Pengguna e-Hadir

Dokumen ini menyediakan panduan langkah demi langkah cara menggunakan sistem e-Hadir untuk ahli mesyuarat, urus setia pendaftaran, dan juruteknik skrin dewan.

---

## 1. Panduan untuk Ahli Mesyuarat (Kiosk / Telefon Pintar)

### Langkah 1: Semakan Nombor Gaji / No. Ahli
1. Di skrin utama, masukkan nombor gaji atau nombor ahli anda pada kotak input (contoh: `LGM1001`).
   - *Nota*: Anda boleh menaip huruf kecil atau huruf besar; sistem akan menyelaraskannya secara automatik.
2. Tekan butang **"Semak Kelayakan"**.

### Langkah 2: Pengesahan Identiti & Lokasi
1. Semak maklumat yang dipaparkan pada kad:
   - Nama penuh ahli.
   - No. Gaji.
   - Bahagian / Cawangan.
2. Periksa status **Pengesahan Lokasi Masa Nyata**:
   - Jika peranti anda mengaktifkan GPS, sistem akan memaparkan jarak anggaran anda dari dewan utama (contoh: `Lokasi Dewan Fizikal Sah (~42m)`).
   - Jika kebenaran lokasi disekat, sistem memaparkan `Mod Lokasi Tanpa GPS`. Anda masih boleh meneruskan pendaftaran.
3. Jika maklumat adalah betul, tekan **"Teruskan ke Kamera Hadapan"**.
   - *Jika maklumat bukan milik anda*, tekan **"Bukan Saya (Tukar No. Gaji)"**.

### Langkah 3: Tangkapan Swafoto (Live Selfie)
1. Benarkan akses kamera apabila pelayar meminta kebenaran (*Allow camera access*).
2. Posisikan wajah anda di tengah bulatan panduan kamera.
3. Tekan butang bulat **"Rakam Foto Hadir"**.
4. Pratonton foto akan dipaparkan selama 3 saat sebelum sistem menyimpannya ke pangkalan data dewan secara automatik.
   - *Jika foto kabur*, anda boleh menekan **"Ambil Semula"** sebelum masa tamat.

### Langkah 4: Penerimaan Pas Kehadiran Digital
1. Skrin akan memaparkan **Pas Kehadiran Rasmi Dewan** yang mengandungi:
   - Status: **SAH** bercop hijau.
   - Kod pengesahan unik (contoh: `EH-LGM1001-A482`).
   - Foto wajah anda yang telah dirakam.
   - Tarikh dan cap masa tepat pendaftaran.
   - Status lokasi geofens fizikal dewan.
2. Anda boleh menekan butang **"Cetak / Simpan PDF Pas"** untuk simpanan peribadi jika perlu.
3. Tunjukkan pas ini kepada urus setia di pintu masuk dewan.
4. Di kiosk awam, tekan **"Daftar Ahli Seterusnya"** supaya ahli lain boleh mendaftar.

---

## 2. Panduan untuk Urus Setia (Papan Pemuka Pentadbir)

### Cara Mengakses Papan Pemuka:
1. Tekan pautan **"Urus Setia"** pada sudut kanan atas skrin utama.
2. Masukkan **Kod PIN 6-digit** pentadbir (lalai: `123456`).
3. Tekan **"Sahkan & Masuk"**.

### Membuka & Menutup Sesi Pendaftaran:
- Tekan butang **"Buka Pendaftaran Sesi"** atau **"Tutup Pendaftaran Sesi"** di bahagian atas.
- Apabila ditutup, tiada ahli baharu boleh mendaftar dan skrin kiosk akan memaparkan notis rasmi bahawa pendaftaran telah ditutup.

### Memantau Status Kuorum:
- **Jumlah Kehadiran Fizikal**: Jumlah ahli yang telah selesai mendaftar dengan foto.
- **Jumlah Ahli Layak**: Jumlah keseluruhan ahli dalam senarai induk.
- **Peratusan Kehadiran Semasa**: Peratusan ahli yang telah hadir.
- **Status Kuorum**:
  - *Belum Mencapai*: Memaparkan baki bilangan ahli yang diperlukan untuk mencapai had korum.
  - *Kuorum Tercapai (Hijau Gelap)*: Menandakan mesyuarat agung sah untuk dimulakan mengikut peraturan pertubuhan.

### Melihat Peta Geofens Masa Nyata:
1. Tekan tab **"Peta Geofens Dewan"**.
2. Peta interaktif Google Maps akan memaparkan:
   - Ikon Bangunan Dewan di pusat acara.
   - Pin Hijau bagi ahli yang mendaftar dalam lingkungan zon dewan.
   - Pin Kuning bagi ahli yang mendaftar di luar lingkungan zon dewan.
3. Tekan mana-mana pin untuk melihat perincian ahli dan foto swafoto mereka.

### Mengurus Senarai Induk Ahli (Format CSV):
1. Pergi ke tab **"Tetapan Sesi & Pangkalan Data Induk"**.
2. Di bahagian kanan, tekan **"Pilih & Muat Naik CSV"** untuk memuat naik fail senarai ahli.
   - Format lajur yang diperlukan: `No_Gaji, Nama_Penuh, Bahagian_Cawangan`.
3. Jika sesi semasa sudah mempunyai kehadiran, sistem akan bertanya sama ada anda mahu:
   - **Merge (Selaras Ahli Baharu)**: Mengekalkan rekod kehadiran sedia ada dan hanya menambah ahli baharu (disyorkan).
   - **Replace (Gantikan Keseluruhan)**: Memadam rekod kehadiran lama dan memulakan senarai baharu dari awal.
4. Untuk memuat turun laporan terkini, tekan butang **"Eksport CSV"** di bahagian atas papan pemuka.

### Mengubah Lokasi Dewan & Radius Geofens:
1. Pergi ke tab **"Tetapan Sesi & Pangkalan Data Induk"**.
2. Di bahagian *Lokasi Dewan & Geofens Fizikal*, anda boleh memilih pratetap lokasi popular (KLCC, WTCKL, PICC, MITEC, Setia SPICE) atau memasukkan latitud dan longitud tersuai.
3. Tetapkan had radius geofens (100m, 250m, 500m, atau 1000m).
4. Tekan **"Simpan Perubahan Tetapan"**.

---

## 3. Panduan Pengendali Skrin Dewan (Projektor / LED Wall)

1. Dalam Papan Pemuka Urus Setia, tekan butang **"Paparan Dewan"** pada bar navigasi atas.
2. Tetingkap mod projektor dewan akan dibuka dengan tema korporat berimpak tinggi.
3. Tekan butang **"Skrin Penuh (F11)"** untuk menghilangkan bar pelayar.
4. Skrin ini memaparkan:
   - Tajuk rasmi mesyuarat agung dan tarikh sesi.
   - Jumlah kehadiran semasa dan sasaran korum dengan saiz teks besar yang jelas dibaca dari jarak jauh.
   - Bar kemajuan (*progress bar*) yang bertukar hijau apabila korum sah dicapai.
   - Jam digital rasmi dewan yang berdetik setiap saat.
   - Jalur ahli berdaftar terkini yang bergerak secara langsung.

---

## 4. Maksud Status & Label Penting

| Label / Status | Maksud |
| :--- | :--- |
| **Kuorum Tercapai** | Kehadiran fizikal telah mencapai atau melebihi peratusan sasaran rasmi (lalai: 50%). Mesyuarat sah diteruskan. |
| **Belum Mencapai** | Kehadiran belum mencukupi had korum. Mesyuarat belum sah membuat undian atau keputusan dasar. |
| **Hadir Fizikal Sah** | Ahli telah disahkan melalui No. Gaji dan telah mengambil swafoto langsung. |
| **Dalam Zon Dewan** | Koordinat GPS ahli semasa mendaftar dikesan berada di dalam lingkungan radius dewan yang ditetapkan. |
| **Luar Zon Dewan** | Ahli mendaftar menggunakan koordinat yang melebihi jarak radius dewan. Rekod tetap disimpan dengan amaran audit. |
| **Kiosk / Manual** | Pendaftaran direkodkan tanpa data GPS (disebabkan sekatan pelayar atau perkakasan komputer meja). |

---

## 5. Penyelesaian Masalah Biasa (Troubleshooting)

### A. "Kebenaran kamera tidak dibenarkan"
- **Punca**: Pelayar menyekat akses perkakasan kamera.
- **Penyelesaian**: Tekan ikon mangga kunci (*lock icon*) pada palang alamat URL pelayar anda, pilih **Site settings**, dan tukar tetapan **Camera** kepada **Allow**. Muat semula halaman.

### B. "No. Gaji tidak ditemui dalam senarai ahli layak"
- **Punca**: Nombor yang ditaip tiada dalam pangkalan data senarai induk.
- **Penyelesaian**: Pastikan tiada salah ejaan. Jika nombor betul tetapi tidak ditemui, sila rujuk meja urus setia untuk dimasukkan ke dalam senarai induk melalui fail CSV.

### C. "Kehadiran anda telah pun direkodkan sebelum ini"
- **Punca**: No. Gaji tersebut telah selesai mendaftar.
- **Penyelesaian**: Sistem mencegah pendaftaran berganda. Sistem akan memaparkan semula salinan Pas Digital asal ahli tersebut untuk pengesahan tanpa mengira kehadiran kali kedua.

### D. "Kebenaran GPS tidak dibenarkan oleh pengguna / pelayar"
- **Punca**: Lokasi dimatikan pada telefon atau pelayar.
- **Penyelesaian**: Hidupkan fungsi GPS peranti anda dan benarkan akses lokasi apabila ditanya oleh pelayar. Walau bagaimanapun, jika peranti anda tidak mempunyai GPS, pendaftaran tetap boleh diselesaikan.
