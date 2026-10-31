# Tahap 1: Setup Proyek + Kelola Menu dan Kategori — Rencana Implementasi

> **Cara eksekusi:** mode belajar terpandu. Pemilik proyek mengetik dan menjalankan setiap langkah sendiri; Claude memberikan kode sepotong demi sepotong beserta penjelasannya, lalu memeriksa hasilnya. Langkah memakai checkbox (`- [ ]`).

**Goal:** Backend REST API untuk kategori dan menu (termasuk upload foto) yang teruji otomatis, plus halaman admin Kelola Kategori dan Kelola Menu dengan layout bergaya TasteHouse.

**Architecture:** Monorepo `client/` (React + Vite + Tailwind) dan `server/` (Express + Prisma + PostgreSQL). Frontend memanggil REST API di `/api`. `app.js` mengekspor aplikasi Express tanpa `listen`, supaya bisa diuji dengan Supertest.

**Tech Stack:** Node.js 24, Express 5, Prisma 7, PostgreSQL 18, Zod 4, Multer, Vitest, Supertest, React, Vite, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-10-29-pos-kafe-design.md`

## Keputusan yang Perlu Disetujui Sebelum Mulai

| # | Keputusan | Usulan | Alternatif |
|---|---|---|---|
| K1 | Cara menjalankan PostgreSQL | Install PostgreSQL langsung di komputer | Docker; layanan cloud gratis (Neon/Supabase) |
| K2 | Penyimpanan foto menu | Folder `server/uploads/` (lokal); pindah ke layanan cloud saat Tahap 7 | Cloudinary sejak awal |
| K3 | Navigasi halaman frontend | React Router | — (standar de facto) |
| K4 | Memanggil API dari frontend | Fungsi kecil di atas `fetch` bawaan | Axios |
| K5 | Ikon | lucide-react | Heroicons |
| K6 | Notifikasi toast | react-hot-toast | Buat sendiri |
| K7 | Font | Plus Jakarta Sans (Google Fonts) | Poppins |

## Global Constraints

- Semua uang berupa bilangan bulat Rupiah (`Int`), tanpa desimal.
- Format error API: `{ "message": "..." }` dengan kode 400 (validasi), 404 (tidak ditemukan), 409 (konflik), 500 (error server).
- Menu tidak dihapus permanen: `DELETE` mengubah `isActive` menjadi `false`.
- Rahasia hanya di `server/.env`; `.env` masuk `.gitignore`; sediakan `server/.env.example`.
- Tes memakai database terpisah (`DATABASE_URL` di `server/.env.test`) supaya data development tidak terhapus.
- Autentikasi belum ada di tahap ini; rute admin sementara terbuka dan akan dilindungi di Tahap 2.

## Review Focus

1. Nama kategori duplikat (termasuk beda huruf besar/kecil, mis. "Kopi" dan "kopi") → 409, bukan error 500.
2. Menghapus kategori yang masih punya menu → 409 dengan pesan jelas, bukan error foreign key 500.
3. Harga atau stok dikirim sebagai teks ("25.000") atau negatif → 400; form frontend mengirim angka bulat.
4. ID yang tidak ada atau bukan angka (`/api/menus/abc`) → 404/400, bukan 500.
5. Upload file bukan gambar atau lebih dari 2 MB → 400 dengan pesan jelas.

## Catatan Pelaksanaan

Keputusan yang diambil saat Task 1–4 dikerjakan (30 Oktober 2026):

- **Prisma dikunci di versi 7** (`prisma@7`, `@prisma/client@7`, `@prisma/adapter-pg@7`, `pg`, `dotenv`). Prisma 8 masih release candidate dan berfokus pada TypeScript. Generator memakai `prisma-client-js` (deprecated di v7, tetap berfungsi) agar seluruh proyek tetap JavaScript.
- **Konfigurasi Prisma di `server/prisma.config.js`** (tidak memakai `prisma init`): `schema`, `migrations.path`, `migrations.seed = 'node prisma/seed.js'`, `datasource.url = env('DATABASE_URL')`. Prisma 7 tidak memuat `.env` otomatis, jadi `import 'dotenv/config'` dipakai di file konfigurasi dan di `src/lib/prisma.js`.
- **`src/lib/prisma.js`** membuat satu `PrismaClient` dengan adapter `PrismaPg`.
- **Lingkungan tes:** `vitest.config.js` memuat `.env.test` (`override: true`) dan mematikan `fileParallelism`. `tests/global-setup.js` menjalankan `prisma migrate deploy` sekali sebelum semua tes. `tests/setup.js` mengosongkan tabel sebelum setiap tes. Keduanya menolak berjalan bila `DATABASE_URL` tidak mengandung `pos_kafe_test`. `.env.test` masuk `.gitignore`.
- **Express 5** meneruskan error dari handler `async` ke `errorHandler` secara otomatis, jadi rute tidak memakai `try/catch`.
- **`errorHandler`** juga mengubah JSON rusak (`err.type === 'entity.parse.failed'`) menjadi 400 `{ message: "Format JSON tidak valid" }`.
- **`src/utils/parseId.js`**: `parseId(value: string): number` melempar `HttpError(400, 'ID tidak valid')` untuk nilai bukan bilangan bulat positif atau di atas 2.147.483.647. Dipakai di rute yang memiliki `:id`.
- **Struktur modul:** `src/modules/<fitur>/<fitur>.schema.js`, `.service.js`, `.routes.js`. Service melempar `HttpError`; routes hanya mengurus HTTP.
- **Kategori:** penghapusan ditolak bila masih ada menu, termasuk menu nonaktif. Pengecekan nama kembar tidak membedakan huruf besar/kecil dan mengecualikan kategori yang sedang diubah.

---

### Task 1: Server Express dan tes pertama

**Files:**
- Create: `.gitignore`, `server/package.json`, `server/src/app.js`, `server/src/server.js`, `server/vitest.config.js`
- Test: `server/tests/health.test.js`

**Interfaces:**
- Produces: `app` (default export `server/src/app.js`), endpoint `GET /api/health` → `200 { "status": "ok" }`; script npm `dev`, `test`.

- [x] **Step 1:** `npm init` di `server/`, set `"type": "module"`, install `express` serta dev dependency `vitest supertest`.
- [x] **Step 2: Tulis tes yang gagal**

```js
it('GET /api/health mengembalikan status ok', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});
```

- [x] **Step 3:** `npm test` → FAIL (app belum ada).
- [x] **Step 4:** Buat `app.js` (express.json + rute health) dan `server.js` (`app.listen(process.env.PORT ?? 3000)`).
- [x] **Step 5:** `npm test` → PASS. `npm run dev` lalu buka `http://localhost:3000/api/health`.
- [x] **Step 6:** Commit `feat(server): setup express dan health check`.

### Task 2: Database dan skema Prisma

**Files:**
- Create: `server/prisma/schema.prisma`, `server/prisma/seed.js`, `server/src/lib/prisma.js`, `server/.env`, `server/.env.example`, `server/.env.test`, `server/tests/setup.js`

**Interfaces:**
- Produces: `prisma` (default export `server/src/lib/prisma.js`, satu instance PrismaClient); model `Category { id Int, name String @unique }`, `Menu { id, name, price Int, imageUrl String?, stock Int @default(0), minStock Int @default(5), isActive Boolean @default(true), categoryId, createdAt }`; `tests/setup.js` mengosongkan tabel sebelum setiap tes.

Hanya Category dan Menu yang dibuat sekarang; tabel lain menyusul di tahap yang membutuhkannya.

- [x] **Step 1:** Siapkan PostgreSQL sesuai keputusan K1; buat database `pos_kafe` dan `pos_kafe_test`.
- [x] **Step 2:** Install `prisma` dan `@prisma/client`, `npx prisma init`, isi `DATABASE_URL`. Cek versi Prisma yang terpasang dan ikuti cara setup versi tersebut.
- [x] **Step 3:** Tulis model Category dan Menu, jalankan `npx prisma migrate dev --name init`.
- [x] **Step 4:** Seed: 4 kategori (Kopi, Non-Kopi, Makanan, Snack) dan 8 menu contoh. Jalankan, lalu cek dengan `npx prisma studio`.
- [x] **Step 5:** Konfigurasi Vitest memuat `.env.test` dan `tests/setup.js`; terapkan migrasi ke database tes. `npm test` → health test tetap PASS.
- [x] **Step 6:** Commit `feat(server): skema prisma kategori dan menu`.

### Task 3: Penanganan error dan validasi

**Files:**
- Create: `server/src/utils/HttpError.js`, `server/src/middlewares/errorHandler.js`, `server/src/middlewares/validate.js`
- Modify: `server/src/app.js`
- Test: `server/tests/errors.test.js`

**Interfaces:**
- Produces: `class HttpError extends Error { constructor(status: number, message: string) }`; `errorHandler(err, req, res, next)` dipasang terakhir di app; `validate(schema: ZodSchema)` middleware yang mengganti `req.body` dengan hasil parse atau melempar `HttpError(400, <pesan Zod pertama>)`; rute tak dikenal → 404 `{ message: "Rute tidak ditemukan" }`.

- [x] **Step 1:** Install `zod`. Tulis tes: rute tak dikenal → 404 dengan pesan di atas; rute uji yang melempar error biasa → 500 `{ message: "Terjadi kesalahan pada server" }` (detail error tidak bocor ke klien).
- [x] **Step 2:** `npm test` → FAIL.
- [x] **Step 3:** Implementasikan ketiga file dan pasang di `app.js`.
- [x] **Step 4:** `npm test` → PASS.
- [x] **Step 5:** Commit `feat(server): error handler dan validasi`.

### Task 4: API Kategori

**Files:**
- Create: `server/src/modules/categories/category.routes.js`, `category.schema.js`, `category.service.js`
- Modify: `server/src/app.js`
- Test: `server/tests/categories.test.js`

**Interfaces:**
- Consumes: `prisma`, `HttpError`, `validate`.
- Produces: `GET /api/categories` → `[{ id, name, menuCount }]` urut nama; `POST /api/categories` `{ name }` → 201; `PUT /api/categories/:id` `{ name }` → 200; `DELETE /api/categories/:id` → 204. Skema: `name` string di-trim, 1–50 karakter.

- [x] **Step 1: Tulis tes yang gagal**
  - `POST` `{ name: "Kopi" }` → 201, body berisi `id` dan `name: "Kopi"`.
  - `POST` `{ name: "  " }` → 400.
  - `POST` "kopi" saat "Kopi" sudah ada → 409 `{ message: "Kategori sudah ada" }`.
  - `PUT` id yang tidak ada → 404; `PUT /api/categories/abc` → 400.
  - `DELETE` kategori yang masih punya menu → 409 `{ message: "Kategori masih memiliki menu" }`.
  - `DELETE` kategori kosong → 204, lalu `GET` tidak memuatnya.
- [x] **Step 2:** `npm test` → FAIL.
- [x] **Step 3:** Implementasikan; cek duplikat tanpa membedakan huruf besar/kecil di service.
- [x] **Step 4:** `npm test` → PASS.
- [x] **Step 5:** Commit `feat(server): API kategori`.

### Task 5: API Menu

**Files:**
- Create: `server/src/modules/menus/menu.routes.js`, `menu.schema.js`, `menu.service.js`
- Modify: `server/src/app.js`
- Test: `server/tests/menus.test.js`

**Interfaces:**
- Consumes: `prisma`, `HttpError`, `validate`.
- Produces: `GET /api/menus?categoryId=&includeInactive=true` → `[{ id, name, price, imageUrl, stock, minStock, isActive, category: { id, name } }]`; `GET /api/menus/:id`; `POST /api/menus` → 201; `PUT /api/menus/:id` → 200 (field parsial boleh); `DELETE /api/menus/:id` → 204 (soft delete). Skema: `name` 1–100 karakter, `price` integer > 0, `stock` integer ≥ 0, `minStock` integer ≥ 0, `categoryId` integer, `imageUrl` string opsional.

- [ ] **Step 1: Tulis tes yang gagal**
  - `POST` menu valid → 201 dan `isActive: true`.
  - `POST` `price: "25.000"`, `price: -5000`, atau `price: 2500.5` → 400.
  - `POST` dengan `categoryId` yang tidak ada → 400 `{ message: "Kategori tidak ditemukan" }`.
  - `GET /api/menus` tidak memuat menu nonaktif; dengan `includeInactive=true` memuatnya.
  - `GET /api/menus?categoryId=<id>` hanya mengembalikan menu kategori itu.
  - `DELETE` → 204, menu masih ada di database dengan `isActive: false`.
  - `GET /api/menus/999999` → 404.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementasikan.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat(server): API menu`.

### Task 6: Upload foto menu

**Files:**
- Create: `server/src/modules/uploads/upload.routes.js`
- Modify: `server/src/app.js`, `.gitignore` (abaikan `server/uploads/*`)
- Test: `server/tests/uploads.test.js`, `server/tests/fixtures/kopi.png`

**Interfaces:**
- Produces: `POST /api/uploads` (multipart, field `image`) → 201 `{ url: "/uploads/<nama-unik>.<ext>" }`; folder `server/uploads` disajikan statis di `/uploads`. Hanya `image/jpeg`, `image/png`, `image/webp`, maksimal 2 MB.

- [ ] **Step 1:** Install `multer`. Tulis tes: PNG kecil → 201 dan `GET` url-nya → 200; file `.txt` → 400 `{ message: "File harus berupa gambar JPG, PNG, atau WEBP" }`; file > 2 MB → 400 `{ message: "Ukuran gambar maksimal 2 MB" }`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementasikan; ubah error Multer menjadi `HttpError(400, ...)`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat(server): upload foto menu`.

### Task 7: Setup frontend dan layout

**Files:**
- Create: `client/` (Vite React), `client/src/index.css` (token tema), `client/src/lib/api.js`, `client/src/components/layout/AppLayout.jsx`, `Sidebar.jsx`, `Header.jsx`, `client/src/App.jsx` (rute)
- Modify: `client/vite.config.js` (proxy `/api` dan `/uploads` ke `http://localhost:3000`)

**Interfaces:**
- Produces: `api(path: string, options?: RequestInit): Promise<any>` — mengirim/menerima JSON, melempar `Error(message)` dari body error API; `<AppLayout>` dengan sidebar (Kasir, Pesanan, Riwayat, Dashboard, Menu, Kategori, Meja, User) dan `<Outlet />`; token warna tema (oranye utama, latar krem, teks gelap, pastel kategori) didefinisikan sekali di CSS.

- [ ] **Step 1:** Buat proyek Vite React, install Tailwind dan library dari keputusan K3–K7.
- [ ] **Step 2:** Definisikan token tema dan font.
- [ ] **Step 3:** Bangun Sidebar, Header, AppLayout; rute `/menu` dan `/kategori` (halaman lain berupa placeholder).
- [ ] **Step 4:** Buat `api.js` dan proxy Vite.
- [ ] **Step 5:** Uji manual: `npm run dev`, sidebar tampil mirip referensi, menu aktif tersorot, tampilan rapi di lebar tablet (768px).
- [ ] **Step 6:** Commit `feat(client): setup frontend dan layout`.

### Task 8: Halaman Kelola Kategori

**Files:**
- Create: `client/src/pages/CategoriesPage.jsx`, `client/src/components/categories/CategoryForm.jsx`

**Interfaces:**
- Consumes: `api`, endpoint Task 4.

- [ ] **Step 1:** Daftar kategori sebagai kartu pastel berisi nama dan jumlah menu.
- [ ] **Step 2:** Form tambah dan edit (modal), tombol hapus dengan konfirmasi.
- [ ] **Step 3:** Pesan error API (mis. "Kategori masih memiliki menu") tampil sebagai toast.
- [ ] **Step 4:** Uji manual: tambah, ubah, hapus kategori kosong, coba hapus kategori berisi menu, coba nama duplikat.
- [ ] **Step 5:** Commit `feat(client): halaman kelola kategori`.

### Task 9: Halaman Kelola Menu

**Files:**
- Create: `client/src/pages/MenusPage.jsx`, `client/src/components/menus/MenuForm.jsx`, `client/src/lib/format.js`

**Interfaces:**
- Consumes: `api`, endpoint Task 4–6.
- Produces: `formatRupiah(value: number): string` → `formatRupiah(25000) === "Rp 25.000"`.

- [ ] **Step 1:** Tabel menu (foto, nama, kategori, harga Rupiah, stok, status) dengan filter kategori dan opsi tampilkan menu nonaktif; badge "Stok Menipis" bila `stock <= minStock`.
- [ ] **Step 2:** Form tambah/edit di modal: input harga dan stok sebagai angka bulat, pilih kategori, upload foto dengan pratinjau (upload ke `/api/uploads`, lalu kirim `imageUrl`).
- [ ] **Step 3:** Tombol nonaktifkan (soft delete) dengan konfirmasi.
- [ ] **Step 4:** Uji manual: tambah menu dengan foto, ubah harga, nonaktifkan, filter, upload file salah format.
- [ ] **Step 5:** Commit `feat(client): halaman kelola menu`.

## Selesai Tahap 1

- [ ] `npm test` di `server/` → semua PASS.
- [ ] Alur lengkap di browser: buat kategori → buat menu dengan foto → tampil di tabel → nonaktifkan.
- [ ] Ringkasan: apa yang dipelajari di tahap ini, lalu susun rencana Tahap 2.
