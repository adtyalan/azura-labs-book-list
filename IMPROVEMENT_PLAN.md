# 🚀 Rencana Peningkatan Aplikasi (Review Ready - Azura Labs)

Dokumen ini berisi daftar rekomendasi peningkatan untuk aplikasi **Booklist Management Website** agar menjadi *top of mind* dan memukau para penilai di Azura Labs saat melakukan review teknis dan fungsional.

---

## 🎨 1. Visual & UI/UX Polish (First Impression)
Kesan pertama sangat menentukan. Penilai harus langsung merasakan kualitas antarmuka yang premium dan modern.

- [x] **Pemilih Tema Dinamis (Theme Toggle)**
  - *Deskripsi*: Manfaatkan sistem tema bawaan daisyUI (misal: *light, dark, cupcake, luxury*).
  - *Mengapa*: Menunjukkan kepedulian terhadap aksesibilitas pengguna (kenyamanan membaca di malam hari/dark mode).
- [ ] **Animasi & Transisi Halus (Micro-Animations)**
  - *Deskripsi*: Tambahkan transisi visual (`transition-all duration-300`) pada pergantian mode list/grid, efek hover pada card buku (sedikit mengangkat dengan bayangan halus), dan rotasi ikon ketika tombol diklik.
  - *Mengapa*: Membuat aplikasi terasa "hidup" dan responsif secara taktil.
- [ ] **Peningkatan Sampul Buku Dinamis (`BookCoverPlaceholder`)**
  - *Deskripsi*: Gunakan kombinasi gradasi warna pastel modern (HSL-based) yang di-generate unik berdasarkan judul buku, serta tipografi inisial yang proporsional.
  - *Mengapa*: Menghilangkan kesan "desain mentah" dari placeholder default.
- [x] **Skeleton Loader yang Selaras**
  - *Deskripsi*: Buat skeleton loading yang menyerupai bentuk tabel atau barisan kartu buku yang asli saat data sedang dimuat dari server.
  - *Mengapa*: Menghindari lonjakan layout (*Layout Shift*) yang mengganggu estetika.

---

## ⚡ 2. Interaksi & Transisi Data (User Experience)
Interaksi yang aman dan informatif mencerminkan kematangan pengembang dalam membangun produk nyata.

- [ ] **Indikator Loading State Global / Blokir Input**
  - *Deskripsi*: Saat Next.js Server Action sedang berlangsung (tambah/edit/hapus), berikan efek visual *blur* tipis pada daftar buku atau tampilkan spinner kecil di tombol aksi yang sedang berjalan.
  - *Mengapa*: Mencegah aksi ganda (*double submit*) dari user dan memberikan feedback bahwa proses sedang berjalan.
- [x] **Sistem Toast Notification yang Lebih Kaya**
  - *Deskripsi*: Tambahkan ikon dinamis (sukses, error, warning) di dalam toast, berikan tombol hapus instan (X), dan jika memungkinkan, bar indikator waktu mundur (*timer progress bar*).
  - *Mengapa*: Meningkatkan kejelasan informasi sistem yang dikirimkan kepada pengguna.
- [x] **Konfirmasi Hapus Kategori dengan Ketikan Nama (Safety Confirmation)**
  - *Deskripsi*: Untuk menghapus kategori yang memicu efek penghapusan berantai (*cascade delete*), wajibkan user mengetikkan nama kategori tersebut sebelum tombol "Hapus Permanen" aktif.
  - *Mengapa*: Menunjukkan pemahaman mendalam tentang *Data Safety* dan pencegahan kesalahan fatal dari user (*human error*).

---

## 🔍 3. Fitur Pencarian & Filter yang Cerdas
Memaksimalkan kinerja penyaringan data agar lebih intuitif bagi penilai.

- [x] **Sorot Hasil Pencarian (Text Highlight)**
  - *Deskripsi*: Tandai teks yang cocok dengan kata kunci pencarian menggunakan tag `<mark>` atau latar belakang warna kuning transparan pada judul, penulis, atau penerbit di daftar hasil.
  - *Mengapa*: Memudahkan penilai memverifikasi apakah filter pencarian server-side benar-benar berfungsi dengan tepat.
- [x] **Empty State dengan Tombol Aksi Langsung**
  - *Deskripsi*: Ketika hasil filter kosong, berikan visualisasi ilustrasi yang ramah dan sebuah tombol menonjol: **"Atur Ulang Semua Filter"** yang langsung membersihkan seluruh query parameter di URL dengan satu klik.
  - *Mengapa*: Meningkatkan alur navigasi user (*User Flow*) agar tidak terjebak di halaman kosong.

---

## 🧱 4. Arsitektur & Kualitas Kode (SOLID & DX)
Kode yang bersih, terstruktur, dan aman adalah penentu utama kelulusan magang.

- [x] **Validasi Skema Sisi Server dengan Zod**
  - *Deskripsi*: Validasi seluruh data formulir input buku dan kategori di dalam Server Actions menggunakan pustaka **Zod**.
  - *Mengapa*: Menjamin keamanan data sebelum masuk ke Prisma/PostgreSQL dan menunjukkan penerapan prinsip *Defensive Programming*.
- [x] **Paginasi Server-Side (Pagination)**
  - *Deskripsi*: Batasi jumlah data buku yang dimuat per halaman (misal: 10 atau 20 data) dan kelola state halaman aktif menggunakan parameter URL (`?page=1`).
  - *Mengapa*: Menunjukkan bahwa Anda memikirkan skalabilitas aplikasi saat menangani ribuan data di dunia nyata (*real-world scalability*).
- [x] **Penanganan Transaksi Database (Prisma Transaction)**
  - *Deskripsi*: Gunakan `prisma.$transaction` untuk operasi yang melibatkan beberapa query bersamaan untuk memastikan integritas data terjamin.
  - *Mengapa*: Mencegah data inkonsisten (*partial state*) saat terjadi kegagalan sistem.
