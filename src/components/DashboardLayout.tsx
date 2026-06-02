'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  {
    label: 'Overview',
    href: '/',
    icon: 'dashboard',
  },
  {
    label: 'Phim',
    href: '/products',
    icon: 'movie',
  },
  {
    label: 'Users',
    href: '/users',
    icon: 'group',
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: 'analytics',
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && pathname !== '/login') {
      window.location.href = '/login';
    } else {
      setAuthorized(true);
    }
    // Trigger stagger entrance after mount
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  if (pathname === '/login') return <>{children}</>;
  if (!authorized) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <TooltipProvider>
        <div
          className="flex h-screen w-full overflow-hidden relative"
          style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background var(--transition-normal), color var(--transition-normal)' }}
        >
          {/* ── Cinematic background texture */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: 'var(--bg-radial-gradient)',
              zIndex: 0,
            }}
          />

          {/* ── Sidebar (Refactored to use Shadcn UI internally) */}
          <Sidebar />

          {/* ── Main content area with SidebarInset */}
          <SidebarInset
            className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden relative bg-transparent border-none!"
            style={{ zIndex: 1 }}
          >
            <Header />

            <main
              id="main-scroll"
              className="flex-1 overflow-y-auto"
              style={{
                paddingTop: '20px',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingBottom: 'calc(68px + 20px)', /* account for mobile bottom nav */
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {children}
              {/* Spacer to prevent mobile bottom nav overlapping bottom content */}
              <div className="h-[88px] md:hidden flex-shrink-0 pointer-events-none" />
            </main>
          </SidebarInset>

          {/* ── Mobile bottom nav ── */}
          <nav
            className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-[68px]"
            style={{
              background: 'var(--bg-sidebar)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--border-sidebar)',
              transition: 'background var(--transition-normal), border-color var(--transition-normal)',
            }}
          >
            {mobileNavItems.map((item, idx) => {
              const active = idx === 0 ? pathname === '/' : pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 py-2 gap-1.5 transition-all active:scale-90 cursor-pointer relative"
                  style={{ color: active ? 'var(--accent)' : 'var(--text-sidebar)' }}
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span
                    className="text-[10px] font-semibold tracking-wider"
                    style={{ color: active ? 'var(--accent)' : 'var(--text-sidebar)' }}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span
                      className="absolute bottom-0 w-10 h-0.5 rounded-full"
                      style={{
                        background: 'var(--accent)',
                        boxShadow: '0 0 8px var(--accent-glow-strong)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Scanline / Grid Effect Overlay ── */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: 'var(--scanline-bg)',
              backgroundSize: 'var(--scanline-size)',
              zIndex: 100,
              transition: 'background var(--transition-normal), background-size var(--transition-normal)',
            }}
          />
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
