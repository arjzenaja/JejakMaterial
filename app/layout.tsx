import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'JejakMaterial - Sistem Manajemen Material & Analisis MFCA',
  description: 'Aplikasi manajemen material dan analisis MFCA untuk industri manufaktur',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-canvas text-text-primary min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
