import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MarketingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-950">JejakMaterial</h1>
          <p className="mt-2 text-text-secondary">
            Platform SaaS B2B untuk pengelolaan material produksi dan analisis Material Flow Cost Accounting (MFCA).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-brand-900 hover:bg-brand-950">
              Masuk ke Ruang Kerja
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              Daftar Akun
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
