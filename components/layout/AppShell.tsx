'use client';

import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';


interface AppShellProps {
  children: ReactNode;
  title?: string;
  breadcrumb?: string;
}

export function AppShell({ children, title, breadcrumb }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          breadcrumb={breadcrumb}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
