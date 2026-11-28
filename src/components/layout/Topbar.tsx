'use client';

import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
  breadcrumb?: string;
}

export function Topbar({ onMenuClick, title, breadcrumb }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/95 px-4 lg:px-8 backdrop-blur shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-input p-2 text-text-secondary hover:bg-neutral-100 hover:text-text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          {breadcrumb && (
            <span className="text-xs text-text-secondary font-medium">
              {breadcrumb}
            </span>
          )}
          {title && (
            <h1 className="text-base font-bold text-text-primary leading-tight">
              {title}
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-700/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-text-primary leading-none">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5 capitalize">
              {user?.roles?.[0]?.name || 'Admin'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-text-secondary hover:text-rose-600 hover:bg-rose-50 h-8 px-2 gap-1"
            title="Keluar (Logout)"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline text-xs">Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
