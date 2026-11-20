export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md bg-surface p-6 rounded-card border border-border shadow-sm">
        {children}
      </div>
    </div>
  );
}
