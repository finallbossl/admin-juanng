'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ isCollapsed, isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Overview', href: '/', icon: 'dashboard' },
    { label: 'Movies', href: '/products', icon: 'movie' },
    { label: 'Users', href: '/users', icon: 'group' },
    { label: 'Analytics', href: '/analytics', icon: 'analytics' }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}
      
      <aside 
        className={`fixed left-0 top-0 h-screen glass-panel flex flex-col z-50 border-r border-white/5 transition-all duration-300 
          ${isCollapsed ? 'w-20' : 'w-64'} 
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed ? (
            <Link href="/">
              <span className="font-headline-lg text-headline-lg text-primary-container tracking-tighter select-none font-bold cursor-pointer">
                CA
              </span>
            </Link>
          ) : (
            <Link href="/">
              <h1 className="font-headline-lg text-headline-lg text-primary-container tracking-tighter select-none font-extrabold cursor-pointer">
                CineAdmin
              </h1>
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={idx} 
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-md shadow-primary-container/10' 
                    : 'text-secondary hover:bg-white/5 hover:text-on-surface'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {!isCollapsed && <span className="font-label-lg text-label-lg">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Container */}
        <div className="p-4 mt-auto">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-container to-on-primary-fixed-variant flex items-center justify-center text-white overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                alt="Admin Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEyB_PvVRzXN4yiDitzp1PGOyIyf6LUr5hOqgntVo-SExz7qZ0lnlNYI5BDXnf7_EIS8bLZFPL9zaUKc8Q3eQPX0Yz5toTlRe6l3eTZTwabzhthg64CTqHzmyfMyf_6Uwe1qFKv9fMkXS_8ZieHXlpo2rIe2EqDYjbq1kjwEv4eP3u9RJQPmG1I6hDJMNa2f4VKYWuRAXmz9wKiMx8ntUwp4f7CKb4_Gl8dXTyak1rnLc66j4Cw19jP4NwOm1v4plHSeqjOfOnLVM"
              />
            </div>
            
            {!isCollapsed && (
              <>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg text-on-surface truncate font-semibold">Admin Profile</span>
                  <span className="text-xs text-secondary truncate">Super Admin</span>
                </div>
                <Link 
                  href="/settings" 
                  className="ml-auto text-secondary hover:text-primary transition-colors flex items-center"
                  title="Cấu hình"
                >
                  <span className="material-symbols-outlined">settings</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
