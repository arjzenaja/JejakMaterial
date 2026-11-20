import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
