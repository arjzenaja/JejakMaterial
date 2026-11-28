import React, { ReactNode } from 'react';
import { Layers } from 'lucide-react';

interface AuthFrameProps {
  title: string;
  description: string;
  error?: string | null;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFrame({ title, description, error, children, footer }: AuthFrameProps) {
  return (
    <div className="flex min-h-screen justify-center bg-canvas px-4 py-8 sm:items-center sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-card bg-brand-900 text-white shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-950">JejakMaterial</h1>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-brand-700">
            MFCA & Tracking
          </p>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-input border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs font-medium text-danger"
            >
              {error}
            </div>
          )}

          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-border pt-4 text-center text-sm text-text-secondary">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
