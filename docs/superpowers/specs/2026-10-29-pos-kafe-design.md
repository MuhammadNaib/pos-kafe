# Spesifikasi Desain: POS Kafe

Tanggal: 29 Oktober 2026
Status: Disetujui (29 Oktober 2026)

## 1. Tujuan

Aplikasi kasir (Point of Sale) berbasis web untuk kafe, dibangun sebagai proyek portofolio full stack sekaligus sarana belajar.

Kriteria berhasil:
- Semua fitur di bagian 3 berjalan dan bisa didemokan secara online.
- Kode rapi di GitHub dengan README berisi screenshot, fitur, teknologi, dan cara menjalankan.
- Pemilik proyek memahami setiap bagian kode karena dibangun step by step dengan penjelasan.

Pengguna aplikasi: pemilik kafe (Admin) dan kasir (Kasir). Pelanggan tidak memakai aplikasi ini secara langsung; pelanggan hanya memindai QRIS saat membayar.

## 2. Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js 24 + Express 5 (REST API) |
| Database | PostgreSQL 18 + Prisma 7 (generator `prisma-client-js`, adapter `@prisma/adapter-pg`) |
| Pembayaran | Midtrans QRIS (mode Sandbox) |
| Validasi | Zod 4 |
| Autentikasi | bcrypt + JWT di httpOnly cookie |
| Pengujian | Vitest + Supertest (backend) |

Struktur repository (monorepo sederhana):

```
pos-kafe/
├── client/   frontend React
├── server/   backend Express + Prisma
└── docs/     dokumen desain dan rencana
```

## 3. Fitur

1. Layar kasir: pilih menu dari kartu bergambar, keranjang, total, kembalian, simpan transaksi.
2. Kelola menu: CRUD menu dan kategori, termasuk harga dan foto.
3. Login dan peran: Admin dan Kasir dengan akses berbeda.
4. Riwayat transaksi dan struk: daftar transaksi, filter tanggal, tampil dan cetak struk.
5. Dashboard laporan: omzet harian/bulanan, menu terlaris, grafik.
6. Manajemen stok: stok berkurang otomatis saat penjualan, peringatan stok menipis.
7. Pesanan per meja: nomor meja dan status pesanan.
8. Pembayaran QRIS lewat Midtrans (Sandbox).

## 4. Arsitektur

```
Frontend (React) --HTTP/JSON--> Backend (Express) --Prisma--> PostgreSQL
                                      |   ^
                         buat QRIS    |   |  webhook status pembayaran
                                      v   |
                                    Midtrans
```

Aturan:
- Frontend tidak pernah mengakses database secara langsung; semua lewat REST API di bawah `/api`.
- Semua rahasia (URL database, JWT secret, Server Key Midtrans) hanya ada di backend, disimpan di `.env` yang tidak di-commit.

Alur pembayaran QRIS:
1. Kasir menekan "Bayar QRIS". Frontend mengirim isi pesanan ke backend.
2. Backend membuat Order (`paymentStatus = UNPAID`), menghitung total sendiri, lalu meminta transaksi QRIS ke Midtrans.
3. Backend mengembalikan QR ke frontend; frontend menampilkannya dengan hitung mundur.
4. Pelanggan memindai dan membayar (di Sandbox lewat simulator Midtrans).
5. Midtrans mengirim webhook ke backend. Backend memverifikasi signature, lalu mengubah `paymentStatus` menjadi `PAID` (atau `EXPIRED`).
6. Frontend mengecek status pesanan secara berkala (polling) dan menampilkan "Lunas" beserta struk.

Saat development, backend di laptop dibuka ke internet sementara memakai ngrok supaya webhook Midtrans bisa sampai.

## 5. Database

| Tabel | Kolom |
|---|---|
| User | id, name, email (unik), password (hash), role (`ADMIN`/`CASHIER`), createdAt |
| Category | id, name (unik) |
| Menu | id, name, price (Int, Rupiah), imageUrl, stock (Int), minStock (Int), isActive (Boolean), categoryId |
| Table | id, number (Int, unik) |
| Order | id, code (unik), status (`PENDING`/`PREPARING`/`DONE`), paymentMethod (`CASH`/`QRIS`), paymentStatus (`UNPAID`/`PAID`/`EXPIRED`), total (Int), cashPaid (Int, opsional), change (Int, opsional), tableId (opsional), cashierId, createdAt |
| OrderItem | id, orderId, menuId, quantity, price (Int, salinan harga saat transaksi), subtotal (Int) |

Relasi: Category 1–n Menu; Order 1–n OrderItem; Menu 1–n OrderItem; Table 1–n Order; User 1–n Order (sebagai kasir).

Keputusan:
- Uang disimpan sebagai bilangan bulat Rupiah (Rp 25.000 = `25000`) untuk menghindari error pembulatan desimal.
- OrderItem menyimpan salinan harga (price snapshot) supaya transaksi lama tidak berubah saat harga menu diubah.
- `status` (alur dapur) dan `paymentStatus` (pembayaran) dipisah karena keduanya independen.
- Menu tidak dihapus permanen, hanya dinonaktifkan (`isActive = false`, soft delete).
- Pesanan tunai langsung `PAID` saat disimpan. Pesanan QRIS mulai `UNPAID`.
- Stok dipotong saat pesanan dibuat. Jika pembayaran QRIS menjadi `EXPIRED`, stok dikembalikan.

## 6. Halaman

| Halaman | Admin | Kasir | Isi |
|---|:---:|:---:|---|
| Login | ✓ | ✓ | Form email dan password |
| Kasir (POS) | ✓ | ✓ | Tab kategori, grid kartu menu, panel keranjang, pilih meja, tombol Bayar Tunai / QRIS |
| Pembayaran QRIS (pop-up) | ✓ | ✓ | QR code, hitung mundur, status otomatis |
| Struk (pop-up) | ✓ | ✓ | Detail transaksi, tombol cetak |
| Pesanan Aktif | ✓ | ✓ | Kartu pesanan per meja, ubah status |
| Riwayat Transaksi | ✓ | ✓ | Tabel transaksi, filter tanggal, lihat struk |
| Dashboard | ✓ | ✗ | Kartu ringkasan, grafik omzet, menu terlaris, stok menipis |
| Kelola Menu | ✓ | ✗ | Tabel menu, form tambah/edit dengan upload foto, stok |
| Kelola Kategori & Meja | ✓ | ✗ | CRUD sederhana |
| Kelola User | ✓ | ✗ | Tambah dan kelola akun kasir |

Gaya visual mengikuti referensi TasteHouse:
- Layout: sidebar kiri dengan ikon, header dengan pencarian dan profil, konten berupa kartu membulat.
- Warna: aksen oranye, latar krem/putih hangat, kartu kategori berwarna pastel.
- Kartu menu: foto, nama, harga, tombol "+" oranye, badge (misalnya "Stok Menipis").
- Kartu ringkasan dashboard meniru baris fitur dengan ikon pada referensi.
- Responsif; halaman kasir nyaman dipakai di tablet.

## 7. Keamanan

- Password di-hash dengan bcrypt.
- Login menghasilkan JWT yang disimpan di httpOnly cookie.
- Setiap rute API dicek login dan perannya (middleware).
- Backend menghitung ulang total dari harga di database; frontend hanya mengirim `menuId` dan `quantity`.
- Webhook Midtrans diverifikasi memakai signature key sebelum status diubah.
- Rahasia di `.env`; `.env` masuk `.gitignore`, disediakan `.env.example`.

## 8. Penanganan Error

- Semua input API divalidasi dengan Zod.
- Pembuatan pesanan dan pengurangan stok dijalankan dalam satu database transaction.
- Pesanan ditolak bila stok tidak cukup.
- Format error API seragam: `{ "message": "..." }` dengan kode HTTP yang sesuai (400, 401, 403, 404, 409, 500).
- Frontend menampilkan error sebagai notifikasi toast.

## 9. Pengujian

- Backend: Vitest + Supertest, ditulis dengan gaya TDD (tes dulu, lalu kode). Yang diuji: perhitungan total dan kembalian, pengurangan dan pengembalian stok, penolakan stok kurang, pengecekan peran, verifikasi signature webhook.
- Frontend: checklist uji manual di akhir setiap tahap.

## 10. Tahapan

| Tahap | Isi |
|---|---|
| 1 | Setup proyek + kelola menu dan kategori |
| 2 | Login dan peran |
| 3 | Layar kasir + transaksi tunai + struk + riwayat |
| 4 | Pembayaran QRIS Midtrans |
| 5 | Stok otomatis + pesanan per meja |
| 6 | Dashboard laporan |
| 7 | Deploy online + README |

Setiap tahap punya rencana kerjanya sendiri. Rencana ditulis tepat sebelum tahap itu dimulai.

## 11. Cara Kerja

- Kode diberikan step by step dan dijelaskan; pemilik proyek mengetik dan menjalankannya sendiri.
- Setiap keputusan teknis baru (library, struktur, desain) ditawarkan dulu dan baru dijalankan setelah disetujui.

## 12. Di Luar Cakupan

Diskon, pajak/PPN, varian ukuran, multi-cabang, pemesanan online oleh pelanggan, dan mode Production Midtrans.
