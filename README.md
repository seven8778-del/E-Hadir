# e-Hadir — Sistem Kehadiran Mesyuarat Agung & Kiosk

Aplikasi web moden yang memudahkan dan mengesahkan kehadiran ahli dalam Mesyuarat Agung Tahunan secara pantas melalui semakan No. Gaji, tangkapan swafoto (*live selfie*) di dewan, dan pengesahan lokasi masa nyata (*geofencing*).

---

## Masalah yang Diselesaikan

Dalam mesyuarat agung tahunan (koperasi, persatuan, atau organisasi):
- **Kehadiran Proksi / Kehadiran Hantu**: Seseorang boleh menandatangani bagi pihak rakan yang sebenarnya tidak hadir ke dewan mesyuarat.
- **Kesesakan di Pintu Masuk**: Ahli beratur panjang di meja pendaftaran manual untuk mencari nama dalam kertas tebal.
- **Kelewatan Pengiraan Kuorum**: Mesyuarat rasmi tidak boleh bermula selagi urus setia belum selesai mengira jumlah ahli yang hadir secara manual bagi memastikan syarat korum undang-undang tubuh dipenuhi.

**e-Hadir** menyelesaikan isu ini dengan membolehkan pendaftaran layan diri di tablet kiosk atau telefon pintar ahli, mengesahkan foto wajah fizikal di dewan, memeriksa koordinat GPS dewan, dan mengemas kini peratusan kuorum mesyuarat pada skrin besar secara serta-merta (*real-time*).

---

## Untuk Siapa?

1. **Ahli Mesyuarat**: Mendaftar kehadiran sendiri dalam masa kurang daripada 30 saat menggunakan No. Gaji dan menerima Pas Digital rasmi.
2. **Urus Setia Pendaftaran**: Memantau senarai kehadiran, mengesahkan bukti foto swafoto, mengawal waktu buka/tutup pendaftaran, dan memuat turun laporan rasmi (CSV).
3. **Pengerusi & Ahli Jawatankuasa Mesyuarat**: Memantau status kuorum secara langsung pada skrin projektor dewan sebelum memulakan agenda mesyuarat.

---

## Apa yang Boleh Dibuat?

- **Semakan No. Gaji Pantas**: Memadankan nombor gaji atau nombor ahli dengan pangkalan data senarai induk kelayakan dewan.
- **Pencegahan Kehadiran Berulang**: Menghalang cubaan mendaftar lebih daripada sekali untuk nombor gaji yang sama secara automatik.
- **Tangkapan Swafoto Dewan Sahaja (*Live Selfie*)**: Hanya membenarkan tangkapan kamera langsung pada peranti tanpa pilihan memuat naik fail gambar dari galeri untuk mengelakkan penipuan.
- **Mampatan Imej Automatik**: Memampatkan gambar secara automatik dalam peranti ke saiz bawah 150KB bagi menjimatkan storan dan data internet.
- **Pengesahan Lokasi Masa Nyata & Geofens (*Google Maps Platform*)**: Mengimbas koordinat GPS peranti untuk mengesahkan sama ada ahli berada di dalam lingkungan dewan mesyuarat.
- **Pas Kehadiran Digital Rasmi**: Mengeluarkan pas bercop keselamatan dengan kod pengesahan unik, cap masa rasmi, dan butang cetak atau simpan ke PDF.
- **Papan Pemuka Urus Setia & Peta Geofens**: Memaparkan peratusan kuorum secara automatik, taburan kehadiran pada peta interaktif Google Maps, serta pengurusan senarai induk ahli.
- **Paparan Skrin Dewan (*Projektor LED*)**: Mod paparan skrin penuh (*fullscreen*) resolusi tinggi khusus untuk dipancarkan ke layar dewan mesyuarat.

---

## Contoh Cara Penggunaan

1. **Ahli memasukkan No. Gaji** (contoh: `LGM1001`) pada skrin kiosk atau telefon peranti sendiri (BYOD).
2. **Sistem menyemak kelayakan**: Nama penuh ahli dan bahagian dipaparkan, sementara koordinat lokasi disahkan terhadap zon dewan.
3. **Ahli mengambil foto swafoto**: Kamera hadapan diaktifkan secara langsung. Ahli melihat pratonton dan menekan butang *Rakam Foto*.
4. **Pas Kehadiran Digital Dikeluarkan**: Ahli menerima pas digital rasmi dengan kod keselamatan dan boleh terus melangkah masuk ke dalam dewan.

---

## Cara Mencuba

- **Pautan Demo Aplikasi Rasmi**: [https://ais-pre-y34oshbcbxh6l22vm5dgva-998658838973.asia-east1.run.app](https://ais-pre-y34oshbcbxh6l22vm5dgva-998658838973.asia-east1.run.app)
- **Contoh No. Gaji untuk Ujian**: `LGM1001`, `LGM1002`, `LGM1003`, `LGM1005`
- **PIN Urus Setia Lalai**: `123456`

---

## Status Projek Semasa

- **Tahap Projek**: Versi MVP (*Minimum Viable Product*) berfungsi penuh.
- **Fungsi yang Sudah Dibina & Diuji dalam Pengekodan**:
  - Aliran pendaftaran No. Gaji dan pencegahan pendua.
  - Tangkapan kamera hadapan WebRTC dengan mampatan JPEG sisi klien (<150KB).
  - Pengecaman lokasi GPS pelayar dan visualisasi Google Maps Platform.
  - Pengiraan kuorum automatik dan mod skrin projektor.
  - Muat naik dan muat turun senarai induk format CSV (dengan sokongan UTF-8 BOM untuk Microsoft Excel).
  - Penyelarasan antara tab pelayar menggunakan *BroadcastChannel API*.
- **Batasan Semasa**:
  - Pengesanan lokasi GPS bergantung kepada kebenaran (*permission*) pelayar dan perkakasan GPS peranti ahli. Sekiranya tidak dibenarkan, sistem berfungsi dalam mod pendaftaran manual.
  - Pangkalan data lalai beroperasi pada simpanan memori pelayar (*Local Storage*). Untuk perkongsian merentas peranti pelbagai komputer, penyambungan ke Firebase Firestore perlu diaktifkan melalui modal tetapan urus setia.

---

## Dokumentasi Berkaitan

Untuk maklumat lanjut mengikut keperluan anda, sila rujuk dokumen berikut:

- [Panduan Pengguna Langkah Demi Langkah](docs/PANDUAN-PENGGUNA.md) — Panduan lengkap untuk ahli dan urus setia dewan.
- [Keperluan Produk (PRD)](docs/KEPERLUAN-PRODUK.md) — Objektif produk, skop MVP, dan peraturan perniagaan.
- [Status dan Perancangan (Roadmap)](docs/STATUS-DAN-ROADMAP.md) — Status semasa, isu diketahui, dan perancangan masa depan.
- [Data dan Privasi](docs/DATA-DAN-PRIVASI.md) — Polisi data peribadi, lokasi, foto, dan storan.
- [Panduan Pemasangan & Penyelenggaraan](docs/SETUP-DAN-PENYELENGGARAAN.md) — Arahan menjalankan kod sumber untuk pembangun perisian.
- [Rekod Perubahan (Changelog)](CHANGELOG.md) — Sejarah perubahan dan versi aplikasi.

---

## Ringkasan Teknologi

- **React 19**: Digunakan untuk membina struktur paparan dan interaksi pengguna yang pantas.
- **TypeScript**: Memastikan kod aplikasi selamat daripada ralat jenis data.
- **Tailwind CSS**: Digunakan untuk mereka bentuk antara muka kemas mengikut standard institusi.
- **Google Maps Platform (`@vis.gl/react-google-maps`)**: Memaparkan peta interaktif dewan dan kedudukan geofens ahli.
- **WebRTC Camera API**: Mengawal perkakasan kamera hadapan secara langsung di dalam pelayar.
- **HTML5 Canvas**: Memampatkan imej swafoto ke bawah 150KB sebelum disimpan.
- **BroadcastChannel API**: Menyelaraskan pertambahan rekod kehadiran antara tab pelayar secara masa nyata tanpa perlu memuat semula halaman (*no reload*).

---

## Maklum Balas & Bantuan

Sekiranya anda menemui sebarang pepijat (*bug*) atau mempunyai cadangan penambahbaikan, sila laporkan melalui **GitHub Issues** di repositori ini selepas repositori disambungkan.
