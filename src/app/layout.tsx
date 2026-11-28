import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import SplashScreen from './SplashScreen';

export const metadata: Metadata = {
  title: "JejakMaterial — SaaS Pelacak Material, Limbah, dan MFCA",
  description: "Platform B2B untuk pengelolaan material produksi dan analisis Material Flow Cost Accounting (MFCA)",
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
          <Providers>
            <SplashScreen />
            {children}
          </Providers>
        </body>
    </html>
  );
}
