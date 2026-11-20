export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Sidebar & Topbar Shell Placeholder */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
