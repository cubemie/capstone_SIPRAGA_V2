# Migrations

Folder ini digunakan untuk menyimpan riwayat perubahan schema database yang dilakukan **setelah** sistem awal (`init.sql`) disepakati.

## Aturan Tim
Karena kita tidak menggunakan ORM/Migration tools spesifik seperti Sequelize atau Prisma, ikuti panduan berikut agar database semua anggota tim tetap sinkron:

1. **Jangan mengubah `init.sql`** jika itu adalah fitur baru. `init.sql` hanya dieksekusi saat Docker pertama kali jalan (saat volume kosong).
2. Jika butuh tabel baru atau menambah/menghapus kolom, buat file `.sql` baru di folder ini.
3. Beri nama file berurutan agar jelas. Contoh:
   - `001_create_table_pengumuman.sql`
   - `002_add_no_hp_to_warga.sql`
4. Segera push ke Git dan komunikasikan ke anggota tim (terutama PIC server/Docker) bahwa ada migration baru yang harus dijalankan.

## Cara Menjalankan Migration (Manual)
Jika Anda menggunakan **XAMPP / MySQL Lokal**:
1. Buka phpMyAdmin atau DBeaver.
2. Buka file migration `.sql` terbaru.
3. Jalankan query-nya.

Jika Anda menggunakan **Docker**:
1. Masuk ke dalam container MySQL:
   ```bash
   docker exec -it <nama_container_mysql> mysql -u root -p capstone
   ```
2. Copy-paste query SQL yang ada di file migration ke dalam terminal, atau gunakan command `source`.
