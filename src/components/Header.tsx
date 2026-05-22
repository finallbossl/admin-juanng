'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun, 
  Menu
} from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export default function Header({ onToggleSidebar, onToggleMobileSidebar }: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {/* Toggle desktop sidebar */}
        <button 
          onClick={onToggleSidebar} 
          className={`${styles.toggleBtn} md-show`} 
          title="Toggle Sidebar"
          style={{ display: 'none' }} /* We will toggle display via css classes or media queries */
        >
          <Menu size={20} />
        </button>

        {/* Toggle mobile sidebar */}
        <button 
          onClick={onToggleMobileSidebar} 
          className={styles.toggleBtn}
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Tìm kiếm mọi thứ..." 
            className={styles.searchInput} 
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme} 
          className={styles.iconBtn}
          title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className={styles.iconBtn} title="Thông báo">
          <Bell size={18} />
          <span className={styles.badge} />
        </button>

        <div className={styles.divider} />

        {/* Profile summary */}
        <div className={styles.profileSummary}>
          <div className={styles.avatarSmall}>A</div>
          <span className={styles.profileName}>Admin</span>
        </div>
      </div>
    </header>
  );
}
