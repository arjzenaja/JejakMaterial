'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Building2 } from 'lucide-react';
import { AuthFrame } from '@/components/auth/AuthFrame';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/context';
import { organizationSchema, type OrganizationInput } from '@/lib/auth/schemas';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { createOrganization } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (values: OrganizationInput) => {
    setFormError(null);
    try {
      await createOrganization(values.name);
      router.push('/dashboard');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Organisasi belum dapat disimpan. Coba lagi.'
      );
    }
  };

  return (
    <AuthFrame
      title="Buat organisasi"
      description="Setiap akun terhubung ke satu perusahaan. Nama ini menjadi konteks kerja di aplikasi."
      error={formError}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Nama perusahaan / organisasi"
          required
          error={errors.name?.message}
          hint="Minimal 2 karakter. Contoh: PT Surya Material."
        >
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              autoComplete="organization"
              placeholder="Nama perusahaan"
              className="pl-9"
              error={!!errors.name}
              {...register('name')}
            />
          </div>
        </FormField>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-brand-900 shadow-sm hover:bg-brand-950"
            isLoading={isSubmitting}
          >
            Simpan dan masuk
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </AuthFrame>
  );
}
