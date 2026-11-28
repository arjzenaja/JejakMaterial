'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Scale,
  Factory,
  GitBranch,
  Coins,
  FileText,
  Settings,
  X,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
      },
    ],
  },
  {
    groupTitle: 'INVENTORY',
    items: [
      {
        title: 'Material Management',
        href: '/material-management',
        icon: Package,
        permission: 'materials.view',
      },
      {
        title: 'Material Movements',
        href: '/material-movements',
        icon: ArrowLeftRight,
        permission: 'movements.view',
      },
      {
        title: 'Material Balance',
        href: '/material-balance',
        icon: Scale,
        permission: 'balance.view',
      },
    ],
  },
  {
    groupTitle: 'PRODUCTION',
    items: [
      {
        title: 'Production Management',
        href: '/production-management',
        icon: Factory,
        permission: 'production.view',
      },
    ],
  },
  {
    groupTitle: 'ANALYSIS',
    items: [
      {
        title: 'Material Flow & Loss',
        href: '/material-flow-loss',
        icon: GitBranch,
        permission: 'flow.view',
      },
      {
        title: 'MFCA Analysis',
        href: '/mfca-analysis',
        icon: Coins,
        permission: 'mfca.view',
      },
    ],
  },
  {
    groupTitle: 'REPORTS',
    items: [
      {
        title: 'Reports & Executive Audit',
        href: '/reports-executive-audit',
        icon: FileText,
        permission: 'reports.view',
      },
    ],
  },
  {
    groupTitle: 'ADMINISTRATION',
    items: [
      {
        title: 'Settings & User Management',
        href: '/settings-user-management',
        icon: Settings,
        permission: 'settings.view',
      },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, organization } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-950 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-brand-900 shadow-xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-brand-900">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-input bg-brand-700 text-white font-bold shadow-md">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                JejakMaterial
              </span>
              <span className="text-[10px] text-emerald-300/80 tracking-wider font-medium uppercase mt-1">
                MFCA & Tracking
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-input p-1.5 text-neutral-400 hover:bg-brand-900 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {group.groupTitle && (
                  <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-emerald-400/60 uppercase">
                    {group.groupTitle}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex items-center gap-3 rounded-input px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-brand-700 text-white shadow-sm font-semibold'
                          : 'text-neutral-300 hover:bg-brand-900 hover:text-white'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-emerald-400/70 group-hover:text-emerald-300'
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer Organization Context */}
        <div className="p-4 border-t border-brand-900 bg-brand-950/80">
          <div className="rounded-input bg-brand-900/60 p-3 flex items-center gap-2.5 border border-brand-900">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {organization?.name ?? 'Organisasi aktif'}
              </span>
              <span className="text-[10px] text-emerald-300/70 truncate">
                Kode Tenant: {organization?.code ?? '-'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
