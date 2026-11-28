'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail } from 'lucide-react';
import { AuthSplit } from '@/components/auth/AuthSplit';
import { FormField } from '@/components/forms/FormField';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/context';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/auth/mock';
import { loginSchema, resolveAuthenticatedPath, type LoginInput } from '@/lib/auth/schemas';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    try {
      const user = await login(values.email, values.password);
      router.push(resolveAuthenticatedPath(user));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Login gagal. Periksa kembali email dan kata sandi Anda.'
      );
    }
  };

  return (
    <AuthSplit
      variant="login"
      title="Masuk ke ruang kerja"
      description="Gunakan akun perusahaan untuk melanjutkan pencatatan material dan analisis MFCA."
      error={formError}
      footer={
        <p>
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-900">
            Daftar
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" required error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              type="email"
              autoComplete="email"
              placeholder="nama@perusahaan.com"
              className="pl-9"
              error={!!errors.email}
              {...register('email')}
            />
          </div>
        </FormField>

        <FormField label="Kata sandi" required error={errors.password?.message}>
          <PasswordInput
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-brand-900 shadow-sm hover:bg-brand-950"
            isLoading={isSubmitting}
          >
            Masuk
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </AuthSplit>
  );
}