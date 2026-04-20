# Sistem Deteksi Kematangan Sawit

A web application built with Laravel 12 and PHP 8.4.

## Requirements

- PHP >= 8.4
- Composer
- Node.js & NPM
- MySQL

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/makerindo-repository/monitoring-sawit-web.git
cd monitoring-sawit-web
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node Dependencies

```bash
npm install
```

### 4. Environment Configuration

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

### 5. Konfigurasi Database

Sesuaikan konfigurasi database di file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=root
DB_PASSWORD=
```

### 6. Migrasi Database

```bash
php artisan migrate
```

Atau jika ingin sekaligus menjalankan seeder:

```bash
php artisan migrate --seed
```

### 7. Seed Data Default

Jalankan seeder untuk membuat user login default:

```bash
php artisan db:seed
```

Kredensial default:

| Field    | Value             |
| -------- | ----------------- |
| Email    | admin@example.com |
| Password | password          |

### 9. Seed Data Wilayah Indonesia

Package `laravolt/indonesia` menyediakan data Provinsi, Kota, Kecamatan, dan Kelurahan. Jalankan perintah berikut:

```bash
php artisan laravolt:indonesia:seed
```

> **Catatan:** Proses seeding data wilayah membutuhkan waktu cukup lama, terutama untuk data Kecamatan dan Kelurahan.

### 10. Build Assets

```bash
npm run build
```

### 11. Jalankan Aplikasi

```bash
php artisan serve
```

Aplikasi akan berjalan di `http://localhost:8000`.

---

## Development

Untuk mode development dengan hot-reload:

```bash
npm run dev
```

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
