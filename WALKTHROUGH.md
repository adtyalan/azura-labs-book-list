# 📚 PustakaKita — Walkthrough Aplikasi Manajemen Daftar Buku

> Dokumen ini menjelaskan secara menyeluruh alur pengguna, fitur-fitur aplikasi, desain arsitektur sistem, serta keputusan teknis yang diambil selama proses pengembangan. Ditujukan kepada reviewer dan tim Azura Labs.

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Arsitektur Sistem](#4-arsitektur-sistem)
5. [Skema Database](#5-skema-database)
6. [User Flow Lengkap](#6-user-flow-lengkap)
7. [Fitur-Fitur Aplikasi](#7-fitur-fitur-aplikasi)
8. [Arsitektur Backend — Server Actions](#8-arsitektur-backend--server-actions)
9. [Arsitektur Frontend — Komponen](#9-arsitektur-frontend--komponen)
10. [Keputusan Teknis & Kelebihan](#10-keputusan-teknis--kelebihan)
11. [Menjalankan Proyek](#11-menjalankan-proyek)

---

## 1. Gambaran Umum

**PustakaKita** adalah aplikasi web manajemen daftar buku berbasis full-stack yang dibangun sebagai bagian dari uji kompetensi magang di Azura Labs. Aplikasi ini memungkinkan pengguna untuk:

- Melihat, menambah, mengedit, dan menghapus data buku secara real-time
- Mengelola kategori buku (Create, Read, Update, Delete)
- Memfilter dan mencari buku berdasarkan judul, penulis, penerbit, kategori, atau rentang tanggal terbit
- Melihat statistik ringkas koleksi buku (total buku, kategori, halaman, dan rata-rata ketebalan buku)
- Berpindah antara tampilan **Tabel** (detail) dan **Grid Kartu** (visual)
- Menggunakan antarmuka dalam dua mode tema: **Light** dan **Dark**

---

## 2. Tech Stack

| Layer | Teknologi | Versi | Alasan Pemilihan |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.2.10 | Full-stack dalam satu codebase, Server Components, Server Actions |
| **UI Language** | TypeScript + TSX | ^5 | Type-safety mencegah runtime error |
| **Database** | PostgreSQL (via Neon) | — | Relasional, handal untuk data terstruktur |
| **ORM** | Prisma | ^6.19.3 | Type-safe query, schema-first, migrasi mudah |
| **Validasi** | Zod | ^4.4.3 | Validasi skema runtime sisi server yang kuat |
| **Styling** | Tailwind CSS v4 | ^4 | Utility-first, performa tinggi |
| **Komponen UI** | daisyUI | ^5.6.15 | Komponen siap pakai berbasis Tailwind |
| **Ikon** | Lucide React | ^1.23.0 | Konsisten, ringan, dan tree-shakeable |
| **Runtime** | Node.js | — | Ekosistem Next.js |

---

## 3. Struktur Proyek

```
book-list-azura-labs/
├── app/
│   ├── actions/
│   │   ├── books.ts         ← Server Actions: CRUD Buku + validasi Zod
│   │   └── categories.ts    ← Server Actions: CRUD Kategori + Prisma Transaction
│   ├── globals.css          ← Tema global, utilitas CSS kustom
│   ├── layout.tsx           ← Root layout: Header, ThemeToggle, script tema
│   └── page.tsx             ← Halaman utama (Server Component): fetch data + statistik
│
├── components/
│   ├── BookTable.tsx         ← Komponen utama Client: tabel, grid, modal, filter, paginasi
│   ├── HeaderFilter.tsx      ← Komponen filter: pencarian, kategori, rentang tanggal
│   ├── SkeletonLoader.tsx    ← Skeleton loading animasi saat transisi
│   ├── ThemeToggle.tsx       ← Toggle tema light/dark
│   └── BookCoverPlaceholder.tsx ← Placeholder visual sampul buku
│
├── lib/
│   └── prisma.ts            ← Singleton instance Prisma Client
│
├── prisma/
│   ├── schema.prisma        ← Definisi model database
│   ├── seed.ts              ← Data awal (seeding) untuk pengembangan
│   └── migrations/          ← Riwayat migrasi database
│
├── PRD.md                   ← Product Requirements Document
├── IMPROVEMENT_PLAN.md      ← Rencana peningkatan bertahap yang sudah dieksekusi
└── WALKTHROUGH.md           ← Dokumen ini
```

---

## 4. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Client Components                  │   │
│  │   BookTable.tsx, HeaderFilter.tsx, ThemeToggle.tsx    │   │
│  │   (useState, useTransition, useSearchParams)          │   │
│  └─────────────────┬────────────────────────────────────┘   │
└────────────────────│────────────────────────────────────────┘
                     │ Server Actions (RPC over HTTP)
                     │ createBook / updateBook / deleteBook
                     │ createCategory / deleteCategory (+ $transaction)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Server (Node.js)                │
│                                                             │
│  ┌───────────────────┐    ┌──────────────────────────────┐  │
│  │   page.tsx        │    │   app/actions/books.ts        │  │
│  │ (Server Component)│    │   app/actions/categories.ts   │  │
│  │  - Fetch data     │    │   - Validasi Zod              │  │
│  │  - Hitung statistik│   │   - Prisma Query / Transaction│  │
│  │  - Render awal    │    │   - revalidatePath()          │  │
│  └──────┬────────────┘    └──────────────┬───────────────┘  │
│         │                                │                   │
│  ┌──────▼────────────────────────────────▼───────────────┐  │
│  │                  Prisma ORM Client                     │  │
│  └──────────────────────────────┬─────────────────────────┘  │
└─────────────────────────────────│───────────────────────────┘
                                  │ Connection Pool (DATABASE_URL)
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL (Neon Serverless)                 │
│                  Tabel: Book, Category                       │
└─────────────────────────────────────────────────────────────┘
```

**Pola arsitektur yang dipakai: Server-centric dengan Server Actions.**

- **Server Components** (`page.tsx`) merender data awal di server tanpa JavaScript di sisi klien.
- **Server Actions** (`books.ts`, `categories.ts`) adalah fungsi server yang dipanggil langsung dari komponen klien — menggantikan pola REST API tradisional secara elegan.
- **Client Components** (`BookTable.tsx`, dll.) hanya bertanggung jawab atas interaktivitas UI.

---

## 5. Skema Database

```prisma
model Category {
  id        String   @id @default(uuid())
  name      String   @unique           // Nama kategori harus unik
  books     Book[]                     // Relasi 1-ke-banyak ke Buku
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Book {
  id              String   @id @default(uuid())
  title           String
  author          String
  publicationDate DateTime
  publisher       String
  numberOfPages   Int
  categoryId      String
  category        Category @relation(
    fields: [categoryId], 
    references: [id], 
    onDelete: Cascade       // Hapus kategori → otomatis hapus buku di dalamnya
  )
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([title, author, publisher]) // Indeks gabungan untuk performa pencarian
}
```

**Keputusan desain database:**
- `onDelete: Cascade` — memastikan tidak ada buku yatim piatu (*orphan data*) saat kategori dihapus.
- `@@index([title, author, publisher])` — indeks komposit untuk mempercepat query pencarian teks (`LIKE/icontains`).
- UUID sebagai primary key — lebih aman dari auto-increment integer (tidak mudah ditebak).

---

## 6. User Flow Lengkap

### 6.1 Alur Melihat & Menavigasi Daftar Buku

```
Pengguna buka aplikasi
    │
    ▼
[Server] page.tsx merender halaman
    │  - Ambil data buku (10 per halaman, diurutkan terbaru)
    │  - Ambil semua kategori
    │  - Hitung statistik (total buku, kategori, halaman, rata-rata)
    │
    ▼
[Browser] Tampilan awal muncul
    │  - Statistik dashboard (Total Buku, Kategori, Halaman) — hanya di desktop
    │  - Tabel buku dengan paginasi
    │
    ├──► Klik tombol "Grid" → tampilan berubah ke kartu visual
    │
    ├──► Klik tombol "«" / "»" → navigasi ke halaman sebelumnya/selanjutnya
    │       (URL berubah ke ?page=N, server mem-fetch ulang data halaman tersebut)
    │
    └──► Klik toggle bulan/matahari → tema berubah (light ↔ dark)
                                       (disimpan ke localStorage, berlaku instan)
```

### 6.2 Alur Pencarian & Filter

```
Pengguna mengetik di kotak pencarian
    │
    ▼
[HeaderFilter.tsx] Memperbarui URL query string (?search=...)
    │  via useTransition + router.push (non-blocking)
    │
    ▼
[BookTable.tsx] Mendeteksi isPending = true → tampilkan SkeletonLoader
    │
    ▼
[Server] page.tsx mengambil data dengan filter aktif
    │  - Prisma WHERE: title ILIKE, author ILIKE, publisher ILIKE (OR)
    │  - Filter kategori: WHERE categoryId = '...'
    │  - Filter tanggal: WHERE publicationDate BETWEEN startDate AND endDate
    │
    ▼
[Browser] Hasil baru tampil
    │  - Kata yang dicari disorot dengan highlight kuning (regex-based)
    │
    └──► Tidak ada hasil → tampilkan Empty State dengan tombol "Atur Ulang Semua Filter"
```

### 6.3 Alur Menambah Buku

```
Klik tombol "+ Tambah Buku"
    │
    ▼
[Modal] Form Tambah Buku terbuka (6 field)
    │  - Judul, Penulis, Tanggal Terbit, Penerbit, Jumlah Halaman, Kategori
    │
    ▼
Pengguna mengisi form & klik "Simpan"
    │
    ▼
[Client] Validasi dasar client-side (field kosong)
    │
    ▼
[Server Action] createBook() dipanggil
    │  1. Zod memvalidasi tipe & batas karakter setiap field
    │     - Judul: wajib, maks 100 karakter
    │     - Penulis: wajib, maks 80 karakter
    │     - Tanggal: harus bisa di-parse sebagai Date valid
    │     - Penerbit: wajib, maks 100 karakter
    │     - Halaman: harus bilangan bulat positif
    │     - categoryId: harus berformat UUID valid
    │  2. Jika validasi gagal → kembalikan pesan error Zod
    │  3. Prisma INSERT ke tabel Book
    │  4. revalidatePath("/") → invalidasi cache halaman
    │
    ▼
[Client] Toast muncul: "Buku '...' berhasil ditambahkan" ✓
         Modal otomatis tertutup
         Halaman refresh otomatis (data terbaru dari server)
```

### 6.4 Alur Menghapus Kategori (dengan Konfirmasi Ketat)

```
Klik ikon Trash pada kategori
    │
    ▼
[Modal] Dialog konfirmasi muncul
    │  - Menampilkan peringatan: "Aksi ini akan menghapus SEMUA buku di dalamnya"
    │  - Input field: "Ketik nama kategori untuk konfirmasi"
    │
    ▼
Pengguna mengetik nama kategori persis
    │  - Tombol "Hapus Sekarang" baru aktif setelah nama cocok
    │
    ▼
[Server Action] deleteCategory() dipanggil
    │  1. prisma.$transaction() membungkus seluruh operasi
    │  2. Cari kategori berdasarkan ID (lempar error jika tidak ditemukan)
    │  3. Hapus kategori → Prisma Cascade delete menghapus semua buku terkait
    │  4. Jika ada kegagalan di tengah jalan → otomatis ROLLBACK
    │
    ▼
[Client] Toast muncul: "Kategori '...' beserta semua buku berhasil dihapus" ✓
```

---

## 7. Fitur-Fitur Aplikasi

### 7.1 Manajemen Buku (CRUD)

| Fitur | Deskripsi |
|---|---|
| **Tambah Buku** | Form modal 6 field dengan validasi Zod sisi server |
| **Edit Buku** | Modal pre-filled dengan data buku yang dipilih |
| **Hapus Buku** | Dialog konfirmasi sebelum menghapus |
| **Lihat Detail** | Tampilan tabel (detail) atau grid kartu (visual) |

### 7.2 Manajemen Kategori (CRUD)

| Fitur | Deskripsi |
|---|---|
| **Tambah Kategori** | Dari panel manajemen kategori, langsung inline |
| **Edit Kategori** | Inline editing dengan cek duplikasi nama |
| **Hapus Kategori** | Konfirmasi ketik nama + Prisma Transaction |
| **Lihat Jumlah Buku** | Setiap kategori menampilkan jumlah buku terkait |

### 7.3 Filter & Pencarian

| Fitur | Deskripsi |
|---|---|
| **Pencarian Global** | Mencari di judul, penulis, DAN penerbit sekaligus |
| **Filter Kategori** | Dropdown pilih kategori |
| **Filter Tanggal** | Rentang tanggal terbit (dari – sampai) |
| **Sorot Hasil Cari** | Kata yang dicari disorot warna kuning di hasil |
| **Empty State Cerdas** | Jika tidak ada hasil, tampilkan tombol "Atur Ulang Semua Filter" |

### 7.4 Paginasi Server-Side

| Fitur | Deskripsi |
|---|---|
| **10 buku per halaman** | Dikontrol di server, bukan client |
| **Navigasi halaman** | Tombol «Prev, [Hal X / Total], Next» |
| **URL-based state** | State halaman tersimpan di URL (?page=N), mendukung bookmark & berbagi link |
| **Skeleton Loader** | Animasi loading tampil saat berpindah halaman |

### 7.5 UX & Aksesibilitas

| Fitur | Deskripsi |
|---|---|
| **Tema Light/Dark** | Toggle instan, disimpan ke localStorage, tanpa flash putih |
| **Skeleton Loading** | Animasi baris/kartu saat data baru dimuat |
| **Toast Notifikasi** | Umpan balik operasi CRUD dengan ikon sukses/gagal + tombol tutup manual |
| **Responsive** | Mobile-first: statistik hanya tampil di desktop (lg+), kolom kategori tersembunyi di mobile |
| **Teks Panjang** | Ellipsis + animasi sliding saat hover untuk label panjang di desktop |
| **View Toggle** | Beralih antara tampilan Tabel dan Grid |

---

## 8. Arsitektur Backend — Server Actions

Server Actions di Next.js berfungsi sebagai lapisan backend tanpa perlu membuat endpoint API terpisah. Setiap fungsi ditandai dengan `"use server"` dan dipanggil secara langsung dari komponen klien.

### 8.1 `app/actions/books.ts`

```
bookInputSchema (Zod)
  ├── title: string, min 1, maks 100 karakter
  ├── author: string, min 1, maks 80 karakter
  ├── publicationDate: string → diparsing menjadi Date, validasi format
  ├── publisher: string, min 1, maks 100 karakter
  ├── numberOfPages: number, harus bilangan bulat & positif
  └── categoryId: string, harus berformat UUID valid

getBooks(filters)
  ├── Terima: search, categoryId, startDate, endDate, page, limit
  ├── Bangun WHERE clause Prisma secara dinamis
  ├── Hitung totalCount (untuk kalkulasi totalPages paginasi)
  ├── Eksekusi findMany dengan skip/take (OFFSET/LIMIT)
  └── Kembalikan: { books, totalCount, page, totalPages }

createBook(input)  →  safeParse → Prisma.create → revalidatePath
updateBook(id, input)  →  safeParse → Prisma.update → revalidatePath
deleteBook(id)  →  Prisma.delete → revalidatePath
```

### 8.2 `app/actions/categories.ts`

```
categorySchema (Zod)
  └── string, min 1, maks 50, tidak boleh hanya spasi

getCategories()
  └── findMany + _count { books } (jumlah buku per kategori)

createCategory(name)
  ├── safeParse → cek duplikasi nama (findUnique)
  └── Prisma.create

updateCategory(id, name)
  ├── safeParse → cek duplikasi nama oleh ID lain (findFirst)
  └── Prisma.update

deleteCategory(id)
  └── prisma.$transaction(async (tx) => {
        1. tx.category.findUnique → validasi keberadaan
        2. tx.category.delete → cascade hapus semua buku
      })
      // Jika salah satu gagal → ROLLBACK otomatis
```

**Mengapa menggunakan `$transaction` pada deleteCategory?**

Operasi penghapusan kategori melibatkan dua langkah: mencari data kategori, lalu menghapusnya. Dengan transaksi, kedua operasi ini dijamin atomik — jika terjadi kegagalan jaringan atau database di antara keduanya, sistem akan melakukan *rollback* sehingga tidak ada data yang terhapus sebagian.

---

## 9. Arsitektur Frontend — Komponen

### 9.1 Hierarki Komponen

```
app/layout.tsx  (Server Component)
├── <head> script tema (baca localStorage sebelum React mount)
├── ThemeToggle.tsx  (Client Component — toggle tema)
└── {children}
    └── app/page.tsx  (Server Component)
        ├── getBooks() — fetch data server-side
        ├── getCategories() — fetch data server-side
        ├── Statistik Dashboard Cards (hidden di mobile)
        └── BookTable.tsx  (Client Component — interaktif)
            ├── HeaderFilter.tsx  (Client Component — pencarian & filter)
            ├── SkeletonLoader.tsx  (saat isPending = true)
            ├── Tampilan Tabel / Grid (dirender berdasarkan viewMode)
            ├── Paginasi Panel (tombol «/»)
            └── Modal-Modal:
                ├── Modal Form Buku (Tambah/Edit)
                ├── Modal Manajemen Kategori (CRUD)
                └── Modal Konfirmasi Hapus
```

### 9.2 `BookTable.tsx` — Komponen Utama

Komponen ini merupakan inti interaktivitas aplikasi. Tanggung jawabnya:

| Tanggung Jawab | Implementasi |
|---|---|
| **State management** | `useState` untuk modal, form, toast, delete target |
| **Navigasi filter & halaman** | `useSearchParams + useRouter + useTransition` |
| **Loading state** | `isPending` dari `useTransition` → render `SkeletonLoader` |
| **Highlight teks** | `renderHighlightedText()` — regex splitting teks untuk sorot query |
| **CRUD Buku** | `handleSaveBook`, `handleExecuteDelete` memanggil Server Actions |
| **CRUD Kategori** | `handleAddCategory`, `handleSaveEditCategory`, delete dengan konfirmasi ketik |
| **Responsive Layout** | Kolom kategori sembunyikan di mobile, badge kategori gabung di kolom detail |
| **Paginasi** | `handlePageChange(n)` → memperbarui URL `?page=N` |

### 9.3 `HeaderFilter.tsx` — Komponen Filter

Bertanggung jawab tunggal: menangkap input filter dari pengguna dan merefleksikannya ke URL sebagai query string. Tidak ada state buku di sini — murni mengatur filter.

### 9.4 `ThemeToggle.tsx` — Toggle Tema

Mengubah atribut `data-theme` pada tag `<html>` dan menyimpan preferensi ke `localStorage`. Script inisialisasi di `<head>` (dieksekusi sebelum React mount) memastikan tema dari `localStorage` diterapkan sebelum halaman tampil, mencegah *flash* putih.

### 9.5 `SkeletonLoader.tsx` — Loading Placeholder

Merender baris-baris tabel atau kartu-kartu grid dengan animasi `pulse` sebagai visual pengganti saat data server sedang dimuat. Menerima prop `viewMode` untuk menyesuaikan tampilan skeleton sesuai mode aktif.

---

## 10. Keputusan Teknis & Kelebihan

### 10.1 Server Actions vs REST API

Pendekatan ini memilih **Server Actions** dibanding API Routes tradisional karena:
- **Tidak perlu boilerplate fetch/axios** di sisi klien
- **Type-safety end-to-end** — tipe TypeScript dari Server Action otomatis tersedia di komponen klien
- **Otomatis terintegrasi dengan Next.js caching** melalui `revalidatePath()`
- **Kode lebih ringkas**: satu file Server Action menggantikan beberapa file route handler

### 10.2 Validasi Zod di Sisi Server (Defensive Programming)

Meskipun ada validasi dasar di sisi klien (memeriksa field kosong), validasi sesungguhnya dilakukan di **Server Action dengan Zod**. Ini penting karena:
- Klien tidak dapat dipercaya sepenuhnya — pengguna bisa memanipulasi request HTTP
- Memberikan pesan error yang deskriptif dan terlokalisasi
- Memastikan integritas tipe data sebelum menyentuh database

### 10.3 Paginasi Server-Side vs Client-Side

Paginasi diimplementasikan di sisi server (`getBooks` dengan `skip/take` Prisma) bukan di klien, karena:
- **Skalabilitas**: hanya 10 buku yang dikirim ke browser per request, bukan seluruh dataset
- **Performa**: query database lebih efisien dengan `LIMIT/OFFSET`
- **State di URL**: pengguna bisa mem-bookmark atau berbagi link halaman tertentu

### 10.4 `useTransition` untuk UX Non-Blocking

Semua navigasi filter dan halaman dibungkus dalam `startTransition()`. Ini memberikan keunggulan:
- UI tetap responsif saat data baru sedang dimuat (bukan freeze)
- `isPending` digunakan sebagai trigger `SkeletonLoader` — pengguna tahu ada proses berjalan
- Tidak ada pesan "Loading..." yang mengganggu, digantikan animasi skeleton yang elegan

### 10.5 Tema Light/Dark Tanpa Flash (FOUC Prevention)

Tema disimpan di `localStorage`. Untuk mencegah *Flash of Unstyled Content* (FOUC) — di mana tema terang tampil sebentar sebelum tema gelap diterapkan — sebuah script kecil disisipkan di `<head>` yang berjalan **sebelum** React mount dan langsung mengatur `data-theme` pada tag `<html>`. Tag `<html>` juga diberi `suppressHydrationWarning` untuk menghindari pesan peringatan hidrasasi React.

### 10.6 Konfirmasi Hapus Kategori Berbasis Ketik Nama

Penghapusan kategori bersifat destruktif (menghapus semua buku di dalamnya via cascade). Untuk mencegah penghapusan yang tidak disengaja, pengguna diwajibkan **mengetik nama kategori secara persis** sebelum tombol hapus aktif. Pola ini terinspirasi dari praktik industri (GitHub, Vercel) untuk aksi destructive yang tidak bisa dibatalkan.

---

## 11. Menjalankan Proyek

### Prasyarat
- Node.js >= 18
- Akun PostgreSQL (atau Neon untuk serverless)

### Langkah Setup

```bash
# 1. Clone repositori
git clone <url-repo>
cd book-list-azura-labs

# 2. Instalasi dependensi
npm install

# 3. Konfigurasi environment variable
cp .env.example .env
# Edit .env dan isi DATABASE_URL dengan connection string PostgreSQL Anda

# 4. Jalankan migrasi database
npx prisma migrate dev

# 5. (Opsional) Isi data awal
npx prisma db seed

# 6. Jalankan server pengembangan
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### Perintah Berguna

```bash
npm run build   # Build produksi (sekaligus validasi TypeScript)
npm run start   # Jalankan server produksi
npx prisma studio  # GUI database browser
```

---

## Ringkasan

PustakaKita dibangun dengan pendekatan **server-centric modern** menggunakan paradigma terbaru Next.js App Router. Setiap lapisan memiliki tanggung jawab yang jelas:

| Lapisan | File Utama | Tanggung Jawab |
|---|---|---|
| Presentasi | `layout.tsx`, `page.tsx` | Render awal, layout, statistik |
| Logika UI | `BookTable.tsx`, `HeaderFilter.tsx` | Interaktivitas, state, navigasi |
| Bisnis | `books.ts`, `categories.ts` | Validasi, aturan bisnis, query DB |
| Data | `schema.prisma`, Prisma Client | Definisi model, akses database |
| Database | PostgreSQL | Persistensi data |

Proyek ini mendemonstrasikan pemahaman terhadap prinsip **SOLID** (Single Responsibility per komponen/action), **Defensive Programming** (validasi Zod sisi server), **skalabilitas** (paginasi server-side), dan **integritas data** (Prisma Transaction) — semua dalam codebase yang bersih, modular, dan mudah dikembangkan.

---

*Dokumen ini dibuat sebagai bagian dari portofolio uji kompetensi magang di Azura Labs.*
