'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, UserRound } from 'lucide-react';
import { AuthFrame } from '@/components/auth/AuthFrame';
import { FormField } from '@/components/forms/FormField';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/context';
import { registerSchema, resolveAuthenticatedPath, type RegisterInput } from '@/lib/auth/schemas';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    try {
      const user = await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      router.push(resolveAuthenticatedPath(user));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Pendaftaran gagal. Coba lagi beberapa saat.'
      );
    }
  };

  return (
    <AuthFrame
      title="Daftar akun"
      description="Isi data akun pengguna. Organisasi perusahaan dibuat pada langkah berikutnya."
      error={formError}
      footer={
        <p>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-900">
            Masuk
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Nama lengkap" required error={errors.name?.message}>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              autoComplete="name"
              placeholder="Nama operator atau penanggung jawab"
              className="pl-9"
              error={!!errors.name}
              {...register('name')}
            />
          </div>
        </FormField>

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

        <FormField
          label="Kata sandi"
          required
          error={errors.password?.message}
          hint="Minimal 8 karakter."
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="Buat kata sandi"
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <FormField label="Konfirmasi kata sandi" required error={errors.confirmPassword?.message}>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Ulangi kata sandi"
            error={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-brand-900 shadow-sm hover:bg-brand-950"
            isLoading={isSubmitting}
          >
            Buat akun
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}
