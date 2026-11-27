'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { useAuth } from '@/lib/auth/context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-card bg-brand-700 text-white shadow-md mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            JejakMaterial
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Sistem Manajemen Material & Analisis MFCA Manufaktur
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 rounded-input bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField label="Email Perusahaan" required>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
              <Input
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </FormField>

          <FormField label="Kata Sandi" required>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-base shadow-md"
              isLoading={isLoading}
            >
              Masuk ke Aplikasi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Demo Credential Notice */}
        <div className="mt-6 border-t border-border pt-4 text-center">
          <span className="text-xs text-text-secondary">
            Kredensial Demo: <strong className="text-brand-700 font-medium">admin@demo.com</strong> / <strong className="text-brand-700 font-medium">password</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
