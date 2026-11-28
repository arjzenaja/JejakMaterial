import Link from "next/link";
import Image from "next/image";

export default function MarketingPage() {
  return (
    <main className="relative min-h-screen flex flex-col justify-between bg-[#0B120F] text-emerald-50 overflow-hidden px-6 py-6 lg:px-20 selection:bg-emerald-500 selection:text-black">
      
      {/* Background Organic Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] bg-teal-800/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Navigasi Atas */}
      <header className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between py-1 border-b border-emerald-900/40">
        <Link href="/" className="flex items-center group">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 my-[-24px]">
            <Image 
              src="/images/logo.png" 
              alt="JejakMaterial Logo" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <a 
          href="mailto:support@jejakmaterial.io" 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium transition-all shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Hubungi Tim Kami
        </a>
      </header>

      {/* Hero Section Utama */}
      <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-12">
        
        {/* Sisi Kiri: Teks & Tombol Aksi Utama */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            MFCA Industrial Intelligence Platform
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Kendali Alur Material Pabrik, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Tanpa Celah Limbah.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-100/70 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
              Transformasikan data produksi pabrik Anda menjadi keputusan finansial yang presisi melalui kalkulasi Material Flow Cost Accounting tingkat lanjut.
            </p>
          </div>

          {/* Tombol Aksi Utama */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-2 group">
                Masuk ke Ruang Kerja
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 font-semibold text-sm transition-all">
                Daftar Akun Baru
              </button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-emerald-900/40 text-left">
            <div>
              <p className="text-2xl font-semibold text-white font-mono">100%</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">Traceability</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white font-mono">Real-Time</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">Cost Tracking</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white font-mono">B2B Ready</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">Enterprise Grade</p>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Mockup Dashboard */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-lg rounded-2xl p-2 bg-gradient-to-b from-emerald-950/80 to-black/80 border border-emerald-800/40 shadow-2xl shadow-emerald-950/50 backdrop-blur-md">
            
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 rounded-t-xl border-b border-emerald-900/30">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-800"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-800/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-800/30"></div>
              </div>
              <span className="text-[11px] text-emerald-400/60 font-mono tracking-wider">
                workspace.jejakmaterial.io
              </span>
              <div className="w-4"></div>
            </div>

            <div className="relative w-full h-[300px] sm:h-[340px] rounded-b-xl overflow-hidden bg-emerald-950/30">
              <Image 
                src="/images/dashboard-mockup.png" 
                alt="JejakMaterial Workspace Preview"
                fill
                className="object-cover object-top opacity-90 hover:opacity-100 transition-opacity"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B120F] via-transparent to-transparent flex items-end p-5">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">Live Preview</span>
                  <p className="text-sm font-medium text-white">MFCA Material Flow & Efficiency Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Minimalist */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto pt-6 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/50">
        <p>&copy; {new Date().getFullYear()} JejakMaterial. All rights reserved.</p>
        <p className="font-mono mt-2 sm:mt-0">Industrial Grade B2B Architecture</p>
      </footer>
    </main>
  );
}