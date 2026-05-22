'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isCollapsed: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ isCollapsed, isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { 
      category: 'Hệ thống',
      items: [
        { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
        { label: 'Phân tích', href: '/analytics', icon: BarChart3 }
      ]
    },
    { 
      category: 'Quản lý',
      items: [
        { label: 'Tài khoản', href: '/users', icon: Users },
        { label: 'Sản phẩm', href: '/products', icon: ShoppingBag }
      ]
    },
    { 
      category: 'Cấu hình',
      items: [
        { label: 'Thiết lập', href: '/settings', icon: Settings },
        { label: 'Hỗ trợ', href: '/support', icon: HelpCircle }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`${styles.mobileOverlay} ${isOpenMobile ? styles.mobileOverlayOpen : ''}`} 
        onClick={onCloseMobile}
      />
      
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${isOpenMobile ? styles.sidebarOpen : ''}`}>
        {/* Logo Section */}
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <TrendingUp size={22} />
          </div>
          <span className={`${styles.logoText} ${isCollapsed ? styles.logoTextHidden : ''}`}>
            ADMIN<span style={{ color: 'var(--accent)' }}>PRO</span>
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className={styles.navSection}>
          {menuItems.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 'var(--space-md)' }}>
              <div className={`${styles.categoryLabel} ${isCollapsed ? styles.categoryLabelHidden : ''}`}>
                {section.category}
              </div>
              
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link 
                    key={itemIdx} 
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={styles.navIcon} />
                    <span className={`${styles.navLabel} ${isCollapsed ? styles.navLabelHidden : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer profile info */}
        <div className={styles.footerSection}>
          <div className={styles.avatar}>A</div>
          <div className={`${styles.userInfo} ${isCollapsed ? styles.userInfoHidden : ''}`}>
            <span className={styles.userName}>Administrator</span>
            <span className={styles.userRole}>Super Admin</span>
          </div>
        </div>
      </aside>
    </>
  );
}
