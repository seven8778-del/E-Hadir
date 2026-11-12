# Panduan Pemasangan & Penyelenggaraan — e-Hadir

Dokumen ini ditujukan kepada pembangun perisian (*developers*) atau juruteknik IT yang ingin memasang, menjalankan kod sumber, atau menghoskan aplikasi e-Hadir.

---

## 1. Keperluan Sistem (Prerequisites)

Sebelum memulakan, pastikan komputer anda mempunyai perisian berikut:
- **Node.js**: Versi 18.0.0 atau lebih baharu (disyorkan Node.js 20+ LTS).
- **Pengurus Pakej (*Package Manager*)**: `npm` (disertakan bersama Node.js), `yarn`, atau `bun`.
- **Pelayar Web Moden**: Google Chrome, Microsoft Edge, Safari, atau Mozilla Firefox dengan sokongan WebRTC untuk kamera.

---

## 2. Langkah Pemasangan Tempatan (Local Setup)

### Langkah 1: Klon Repositori
```bash
git clone <URL_REPOSITORI_ANDA>
cd e-hadir
```

### Langkah 2: Pasang Kebergantungan Pakej (Dependencies)
```bash
npm install
```

### Langkah 3: Sediakan Pemboleh Ubah Persekitaran (Environment Variables)
Salin fail contoh `.env.example` ke fail baharu bernama `.env`:
```bash
cp .env.example .env
```

Buka fail `.env` dan masukkan kunci yang berkenaan:
```env
# VITE_GOOGLE_MAPS_API_KEY: Diperlukan untuk memaparkan peta interaktif Google Maps
VITE_GOOGLE_MAPS_API_KEY="KUNCI_API_GOOGLE_MAPS_ANDA"
```
*Nota*: Sekiranya kunci peta tidak dimasukkan, keseluruhan sistem pendaftaran No. Gaji, kamera selfie, dan kuorum tetap berfungsi sepenuhnya. Hanya tab visualisasi peta yang akan memaparkan notis kunci API diperlukan.

---

## 3. Menjalankan Aplikasi

### Mod Pembangunan (Development Server):
```bash
npm run dev
```
Aplikasi akan dibuka di alamat tempatan: `http://localhost:3000` (atau port yang ditetapkan).

### Menguji Semakan Kod (Lint & Type Check):
```bash
npm run lint
```
Perintah ini mengesahkan tiada ralat sintaksis atau ketidakpadanan jenis data TypeScript.

### Membina untuk Produksi (Production Build):
```bash
npm run build
```
Hasil binaan yang dioptimumkan akan disimpan di dalam folder `dist/`.

### Menguji Pratonton Binaan Produksi:
```bash
npm run preview
```

---

## 4. Langkah Menyambungkan Projek ke GitHub

Sekiranya anda ingin menyimpan projek ini ke dalam akaun GitHub peribadi atau organisasi anda:

1. **Buka akaun GitHub anda**: Pergi ke [https://github.com/new](https://github.com/new).
2. **Cipta repositori baharu**:
   - Nama repositori yang disyorkan: `e-hadir`
   - Keterangan pendek: `Sistem Kehadiran Mesyuarat Agung & Kiosk Fizikal berasaskan No. Gaji, Live Selfie, dan Kuorum Masa Nyata.`
   - Kebolehlihatan (*Visibility*): Pilih **Private** (Peribadi) sebagai amalan keselamatan lalai.
   - Jangan tandakan *Initialize with README* kerana fail dokumentasi telah disediakan di sini.
3. **Jalankan arahan git berikut dalam folder projek**:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi e-Hadir dengan dokumentasi lengkap"
   git branch -M main
   git remote add origin https://github.com/NAMA_PENGGUNA/e-hadir.git
   git push -u origin main
   ```

---

## 5. Pilihan Hos & Pelancaran (Deployment)

Aplikasi ini dibina sebagai aplikasi halaman tunggal (*Single Page Application - SPA*) berasaskan Vite dan React, menjadikannya sangat mudah dan ringan untuk dilancarkan di mana-mana platform hos web moden:

1. **Google Cloud Run / Cloud Storage**: Sesuai untuk persekitaran perusahaan.
2. **Vercel / Netlify**:
   - *Build command*: `npm run build`
   - *Output directory*: `dist`
3. **Firebase Hosting**:
   - Jalankan `firebase init hosting` dan pilih folder `dist`.

---

## 6. Penyelesaian Masalah Pemasangan (Technical FAQ)

### Masalah: "Kamera gagal dimulakan semasa ujian tempatan (HTTPS required)"
- **Penyelesaian**: Piawaian keselamatan pelayar moden mewajibkan protokol selamat HTTPS untuk capaian perkakasan kamera WebRTC, kecuali apabila diuji melalui `http://localhost`. Sekiranya menguji melalui alamat IP rangkaian tempatan (cth: `http://192.168.x.x`), anda perlu mengaktifkan sijil SSL setempat atau menggunakan terowong selamat seperti ngrok/Cloudflare Tunnel.

### Masalah: "Vite dev server tidak menyegarkan perubahan"
- **Penyelesaian**: Dalam sesetengah persekitaran kontena seperti AI Studio, pemantauan fail automatik (*file watcher*) dihadkan. Anda boleh menjalankan `npm run build` atau memulakan semula pelayan pembangunan.
