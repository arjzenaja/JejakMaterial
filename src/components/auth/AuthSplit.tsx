import { AlertCircle, BarChart3, Layers, Recycle, ShieldCheck } from 'lucide-react';

type Variant = 'login' | 'register';

interface AuthSplitProps {
  variant: Variant;
  title: string;
  description: string;
  error?: string | null;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const WELCOME: Record<Variant, { eyebrow: string; headline: string; body: string }> = {
  login: {
    eyebrow: 'Selamat datang kembali',
    headline: 'Lihat ke mana setiap material mengalir.',
    body: 'Lanjutkan pencatatan dan temukan titik kehilangan material sebelum jadi biaya yang tak terlihat.',
  },
  register: {
    eyebrow: 'Mulai dari sini',
    headline: 'Satu akun untuk membuka biaya yang tersembunyi.',
    body: 'Buat akun, siapkan organisasi, lalu ubah data material jadi keputusan yang lebih hemat.',
  },
};

const HIGHLIGHTS = [
  { icon: Layers, label: 'Catat aliran material' },
  { icon: BarChart3, label: 'Analisis MFCA' },
  { icon: Recycle, label: 'Kurangi limbah' },
];

function FlowIllustration() {
  const paths = [
    'M66 110 H174',
    'M226 110 C280 110 300 60 334 60',
    'M226 110 C280 110 300 170 334 170',
  ];

  return (
    <svg viewBox="0 0 400 230" className="w-full max-w-md" role="img" aria-label="Ilustrasi aliran material">
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          className="stroke-white/25"
          strokeWidth="2"
          strokeDasharray="4 6"
        />
      ))}

      {paths.map((d, i) => (
        <circle key={`dot-${d}`} r="4" className={i === 2 ? 'fill-white/50' : 'fill-white'}>
          <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" path={d} />
        </circle>
      ))}

      {[
        { x: 40, y: 110, label: 'Input' },
        { x: 200, y: 110, label: 'Proses' },
        { x: 360, y: 60, label: 'Produk' },
        { x: 360, y: 170, label: 'Limbah' },
      ].map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="26" className="fill-white/10 stroke-white/40" strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="8" className="fill-white/80" />
          <text
            x={n.x}
            y={n.y + 46}
            textAnchor="middle"
            className="fill-white/70 text-[11px] font-medium"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function AuthSplit({ variant, title, description, error, footer, children }: AuthSplitProps) {
  const copy = WELCOME[variant];

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ===== welcoming ===== */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 to-brand-950 text-white lg:flex lg:w-[48%] xl:w-1/2">
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* rings */}
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          {/* brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Jejak Material</span>
          </div>

          {/* message */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                {copy.eyebrow}
              </span>
              <h1 className="max-w-md text-3xl font-bold leading-tight xl:text-4xl">{copy.headline}</h1>
              <p className="max-w-md text-sm leading-relaxed text-white/75">{copy.body}</p>
            </div>

            <FlowIllustration />
          </div>

          {/* highlights */}
          <ul className="flex flex-wrap gap-2">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/15 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ===== form ===== */}
      <main className="flex min-h-screen flex-1 flex-col">
        {/* header mobile */}
        <div className="flex items-center gap-3 bg-brand-900 px-6 py-4 text-white lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-semibold">Jejak Material</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">{title}</h2>
              <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-card border border-border bg-surface p-6 shadow-sm">{children}</div>

            {footer && <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>}

            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Data Anda tersimpan aman
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}