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
          style={{ background: '#0a0a0a', color: '#F8FAFC' }}
        >
          {/* ── Cinematic background texture */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(229,9,20,0.04) 0%, transparent 60%)',
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
              background: 'rgba(8, 8, 8, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(229, 9, 20, 0.15)',
            }}
          >
            {mobileNavItems.map((item, idx) => {
              const active = idx === 0 ? pathname === '/' : pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex flex-col items-center justify-center flex-1 py-2 gap-1.5 transition-all active:scale-90 cursor-pointer relative"
                  style={{ color: active ? '#E50914' : 'rgba(255,255,255,0.3)' }}
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span
                    className="text-[10px] font-semibold tracking-wider"
                    style={{ color: active ? '#E50914' : 'rgba(255,255,255,0.3)' }}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span
                      className="absolute bottom-0 w-10 h-0.5 rounded-full"
                      style={{
                        background: '#E50914',
                        boxShadow: '0 0 8px rgba(229,9,20,0.8)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Scanline Effect Overlay ── */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 255, 0, 0.02))',
              backgroundSize: '100% 2px, 3px 100%',
              zIndex: 100,
            }}
          />
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
