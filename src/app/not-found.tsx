import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-brand-950">404</h1>
      <p className="mt-2 text-text-secondary">Halaman yang Anda cari tidak ditemukan.</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-brand-700 px-4 py-2 text-white hover:bg-brand-900 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
