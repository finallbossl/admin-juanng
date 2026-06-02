'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useSidebar } from '@/components/ui/sidebar';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export default function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const el = document.querySelector('main');
    const handler = () => {
      const mainScroll = el?.scrollTop ?? 0;
      const windowScroll = window.scrollY ?? 0;
      setScrolled(mainScroll > 10 || windowScroll > 10);
    };

    window.addEventListener('scroll', handler, { passive: true });
    el?.addEventListener('scroll', handler, { passive: true });

    return () => {
      window.removeEventListener('scroll', handler);
      el?.removeEventListener('scroll', handler);
    };
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case '/':          return { main: 'Dashboard', sub: 'Overview' };
      case '/products':  return { main: 'Movies', sub: 'Management' };
      case '/users':     return { main: 'Users', sub: 'Accounts' };
      case '/analytics': return { main: 'Analytics', sub: 'Performance' };
      case '/settings':  return { main: 'Settings', sub: 'System' };
      case '/support':   return { main: 'Support', sub: 'Help' };
      default:           return { main: 'CineAdmin', sub: '' };
    }
  };

  const { main, sub } = getPageTitle();

  return (
    <header
      className="flex items-center justify-between px-6 h-[60px] flex-shrink-0 sticky top-0 z-30 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(8, 8, 8, 0.95)'
          : 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(229, 9, 20, 0.2)'
          : '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Left: mobile menu + breadcrumb title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar || toggleSidebar}
          id="mobile-menu-btn"
          className="md:hidden p-2 rounded-lg transition-colors duration-200 cursor-pointer"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLElement).style.color = '#F8FAFC';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
          }}
          title="Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Breadcrumb Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-[17px] font-bold tracking-tight" style={{ color: '#F8FAFC' }}>
            {main}
          </h1>
          {sub && (
            <>
              <span className="text-[14px] font-light" style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {sub}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: LIVE + Search + Notifications + Avatar */}
      <div className="flex items-center gap-3">

        {/* LIVE indicator */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(229, 9, 20, 0.08)',
            border: '1px solid rgba(229, 9, 20, 0.2)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#E50914', animation: 'liveBlink 1.8s ease-in-out infinite' }}
          />
          <span
            className="text-[10px] font-bold tracking-[0.12em] uppercase"
            style={{ color: 'rgba(229, 9, 20, 0.9)' }}
          >
            Live
          </span>
        </div>

        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <div
            className="absolute left-3 transition-colors duration-200 pointer-events-none"
            style={{ color: searchFocused ? '#E50914' : 'rgba(255,255,255,0.25)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="header-search"
            type="text"
            placeholder="Search movies, users..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="pl-9 pr-4 py-2 text-[13px] rounded-xl w-[240px] transition-all duration-250 outline-none"
            style={{
              background: searchFocused ? 'rgba(229,9,20,0.06)' : 'rgba(255,255,255,0.04)',
              border: searchFocused
                ? '1px solid rgba(229,9,20,0.5)'
                : '1px solid rgba(255,255,255,0.07)',
              boxShadow: searchFocused ? '0 0 0 3px rgba(229,9,20,0.12)' : 'none',
              color: '#F8FAFC',
            }}
          />
        </div>

        {/* Notification bell */}
        <button
          id="notification-btn"
          className="relative p-2 rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0"
          title="Notifications"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLElement).style.color = '#E50914';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {/* Badge */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{
              background: '#E50914',
              boxShadow: '0 0 6px rgba(229,9,20,0.8)',
              border: '1.5px solid #0a0a0a',
            }}
          />
        </button>

        {/* Avatar */}
        <div
          className="relative cursor-pointer flex-shrink-0 transition-all duration-200"
          title="Profile"
        >
          <div
            className="w-9 h-9 rounded-xl overflow-hidden"
            style={{ border: '1.5px solid rgba(229,9,20,0.5)', boxShadow: '0 0 12px rgba(229,9,20,0.2)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEyB_PvVRzXN4yiDitzp1PGOyIyf6LUr5hOqgntVo-SExz7qZ0lnlNYI5BDXnf7_EIS8bLZFPL9zaUKc8Q3eQPX0Yz5toTlRe6l3eTZTwabzhthg64CTqHzmyfMyf_6Uwe1qFKv9fMkXS_8ZieHXlpo2rIe2EqDYjbq1kjwEv4eP3u9RJQPmG1I6hDJMNa2f4VKYWuRAXmz9wKiMx8ntUwp4f7CKb4_Gl8dXTyak1rnLc66j4Cw19jP4NwOm1v4plHSeqjOfOnLVM"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
