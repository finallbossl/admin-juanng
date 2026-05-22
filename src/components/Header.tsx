'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export default function Header({ isSidebarCollapsed, onToggleSidebar, onToggleMobileSidebar }: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard Overview';
      case '/products': return 'Movies Management';
      case '/users': return 'Users & Accounts';
      case '/analytics': return 'Performance & Analytics';
      case '/settings': return 'System Settings';
      case '/support': return 'Help & Support';
      default: return 'CineAdmin';
    }
  };

  return (
    <header 
      className={`fixed top-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/10 transition-all duration-300 left-0
        ${isSidebarCollapsed ? 'md:left-20' : 'md:left-64'}
      `}
    >
      <div className="flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          {/* Toggle sidebar button for mobile */}
          <button 
            onClick={onToggleMobileSidebar}
            className="md:hidden text-primary-container p-2 hover:bg-white/5 rounded-full cursor-pointer flex items-center justify-center transition-colors"
            title="Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          {/* Toggle sidebar button for desktop */}
          <button 
            onClick={onToggleSidebar}
            className="hidden md:flex text-primary-container p-2 hover:bg-white/5 rounded-full cursor-pointer items-center justify-center transition-colors"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <h2 className="font-headline-sm text-headline-sm text-on-surface hidden sm:block">
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
              search
            </span>
            <input 
              type="text" 
              placeholder="Search data..." 
              className="bg-surface-container text-on-surface border-none rounded-full pl-10 pr-4 h-10 text-body-md focus:ring-2 focus:ring-primary-container w-64 transition-all focus:outline-none"
            />
          </div>

          {/* Theme toggle */}
          <button 
            onClick={toggleTheme} 
            className="text-secondary hover:text-on-surface p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center justify-center transition-colors"
            title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notifications */}
          <button 
            className="text-primary-container hover:opacity-80 active:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 relative cursor-pointer flex items-center justify-center"
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container rounded-full border border-surface"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
