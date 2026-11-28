import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi.')
    .email('Format email tidak valid.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi.')
      .email('Format email tidak valid.'),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter.'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

export const organizationSchema = z.object({
  name: z.string().trim().min(2, 'Nama organisasi minimal 2 karakter.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;

export function resolveAuthenticatedPath(user: { organization_id: number | null } | null): string {
  if (!user) return '/login';
  if (user.organization_id == null) return '/onboarding/organization';
  return '/dashboard';
}
