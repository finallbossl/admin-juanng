'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Bell,
  Search,
  Menu,
  RefreshCw,
  ChevronRight,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

const PAGE_META: Record<string, { main: string; sub: string; icon: string }> = {
  '/':          { main: 'Dashboard',  sub: 'Tổng quan hệ thống',    icon: '⬡' },
  '/products':  { main: 'Phim',       sub: 'Quản lý nội dung',      icon: '⬡' },
  '/users':     { main: 'Người dùng', sub: 'Quản lý tài khoản',     icon: '⬡' },
  '/analytics': { main: 'Báo cáo',   sub: 'Phân tích hiệu suất',   icon: '⬡' },
  '/settings':  { main: 'Cài đặt',   sub: 'Cấu hình hệ thống',     icon: '⬡' },
  '/support':   { main: 'Hỗ trợ',    sub: 'Tài liệu & Trợ giúp',   icon: '⬡' },
};

// Fake notification data
const NOTIFICATIONS = [
  { id: 1, type: 'upload',  title: 'Phim mới đã được thêm',    time: '2 phút trước',  unread: true },
  { id: 2, type: 'user',    title: '12 người dùng đăng ký mới', time: '18 phút trước', unread: true },
  { id: 3, type: 'system',  title: 'Server đang hoạt động tốt', time: '1 giờ trước',   unread: false },
];

export default function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggle: toggleTheme, mounted: themeMounted } = useTheme();
  const isDark = theme === 'dark';

  const [scrolled, setScrolled]             = useState(false);
  const [searchFocused, setSearchFocused]   = useState(false);
  const [searchValue, setSearchValue]       = useState('');
  const [showNotif, setShowNotif]           = useState(false);
  const [notifRead, setNotifRead]           = useState(false);
  const [liveTime, setLiveTime]             = useState('');
  const [refreshSpin, setRefreshSpin]       = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Scroll detection
  useEffect(() => {
    const el = document.querySelector('#main-scroll') ?? document.querySelector('main');
    const handler = () => {
      const s = (el?.scrollTop ?? 0) > 10 || window.scrollY > 10;
      setScrolled(s);
    };
    window.addEventListener('scroll', handler, { passive: true });
    el?.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      el?.removeEventListener('scroll', handler);
    };
  }, []);

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K → focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const metaRaw = PAGE_META[pathname] ?? { main: 'CineAdmin', sub: '', icon: '⬡' };
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  const isAddMode = searchParams.get('add') === 'true';
  const currentTab = searchParams.get('tab');

  let pageTitle = metaRaw.main;
  let pageSub = metaRaw.sub;

  if (pathname === '/products') {
    if (isAddMode) {
      pageTitle = 'Thêm Phim Mới';
      pageSub = 'Thêm nội dung phim mới vào hệ thống';
    } else if (currentTab === 'genres') {
      pageTitle = 'Thể Loại Phim';
      pageSub = 'Quản lý danh mục thể loại phim';
    }
  }

  const handleRefresh = () => {
    setRefreshSpin(true);
    setTimeout(() => setRefreshSpin(false), 800);
  };

  return (
    <>
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes live-blink {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(229,9,20,0.8); }
          50%       { opacity: 0.4; box-shadow: 0 0 2px rgba(229,9,20,0.2); }
        }
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes notif-slide-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes theme-icon-in {
          from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
          to   { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        .live-dot { animation: live-blink 1.6s ease-in-out infinite; }
        .spin-anim { animation: spin-once 0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
        .notif-panel { animation: notif-slide-in 0.2s cubic-bezier(0.16,1,0.3,1) forwards; }
        .theme-icon { animation: theme-icon-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      <header
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 30,
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          background: scrolled
            ? 'var(--bg-header-scrolled)'
            : 'var(--bg-header)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderBottom: scrolled
            ? '1px solid var(--border-header-scrolled)'
            : '1px solid var(--border-header)',
          boxShadow: scrolled
            ? 'var(--shadow-header-scrolled)'
            : 'none',
        }}
      >

        {/* ── LEFT: Mobile toggle + Breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Mobile sidebar toggle */}
          <button
            onClick={onToggleMobileSidebar ?? toggleSidebar}
            id="mobile-menu-btn"
            title="Toggle menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--accent-dim)';
              el.style.borderColor = 'var(--border-accent)';
              el.style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--bg-hover)';
              el.style.borderColor = 'var(--border-color)';
              el.style.color = 'var(--text-secondary)';
            }}
          >
            <Menu size={16} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {/* Page icon accent bar */}
            <div style={{
              width: '3px',
              height: '28px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%)',
              boxShadow: '0 0 8px var(--accent-glow-strong)',
              flexShrink: 0,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
              {/* Main title */}
              <h1 style={{
                fontSize: '16px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: 'var(--text-primary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {pageTitle}
              </h1>
              {/* Sub title */}
              {pageSub && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {pageSub}
                </span>
              )}
            </div>

            {/* Breadcrumb separator + current route chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
              <ChevronRight size={12} style={{ color: 'var(--border-color)', flexShrink: 0 }} />
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--accent)',
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-accent)',
                borderRadius: '6px',
                padding: '2px 7px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {pathname === '/' ? 'root' : pathname.replace('/', '')}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: LIVE clock + Search + Refresh + Notifications + Avatar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* LIVE clock indicator — desktop only */}
          <div
            style={{
              alignItems: 'center',
              gap: '7px',
              padding: '5px 10px',
              borderRadius: '20px',
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-accent)',
              cursor: 'default',
              userSelect: 'none',
            }}
            className="hidden md:flex"
          >
            <span
              className="live-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                flexShrink: 0,
                display: 'block',
              }}
            />
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em' }}>
              LIVE
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
              {liveTime}
            </span>
          </div>

          {/* Search bar — desktop */}
          <div
            className="hidden sm:flex"
            style={{ position: 'relative', alignItems: 'center' }}
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '11px',
                color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
                pointerEvents: 'none',
                transition: 'color 0.2s',
                zIndex: 1,
              }}
            />
            <input
              ref={searchRef}
              id="header-search"
              type="text"
              placeholder="Tìm kiếm..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                paddingLeft: '34px',
                paddingRight: searchFocused ? (searchValue ? '32px' : '12px') : '54px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '12.5px',
                borderRadius: '12px',
                width: searchFocused ? '230px' : '190px',
                outline: 'none',
                background: searchFocused ? 'var(--accent-dim)' : 'var(--bg-hover)',
                border: searchFocused
                  ? '1px solid var(--border-accent)'
                  : '1px solid var(--border-color)',
                boxShadow: searchFocused ? '0 0 0 3px var(--accent-glow)' : 'none',
                color: 'var(--text-primary)',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
            {/* Clear button */}
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                style={{
                  position: 'absolute',
                  right: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                }}
              >
                <X size={12} />
              </button>
            )}
            {/* Shortcut hint */}
            {!searchFocused && !searchValue && (
              <span style={{
                position: 'absolute',
                right: '10px',
                fontSize: '9px',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                pointerEvents: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '1px 5px',
              }}>
                Ctrl K
              </span>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            title="Refresh"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--bg-hover)';
              el.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--bg-hover)';
              el.style.color = 'var(--text-secondary)';
            }}
          >
            <RefreshCw size={14} className={refreshSpin ? 'spin-anim' : ''} />
          </button>

          {/* ── Theme Toggle Button (Dark ↔ Light) ── */}
          {themeMounted && (
            <button
              onClick={toggleTheme}
              title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.07)'
                  : '1px solid rgba(234,179,8,0.35)',
                background: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(234,179,8,0.1)',
                color: isDark ? 'rgba(255,255,255,0.45)' : '#D97706',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                if (isDark) {
                  el.style.background = 'rgba(234,179,8,0.12)';
                  el.style.borderColor = 'rgba(234,179,8,0.4)';
                  el.style.color = '#FBBF24';
                  el.style.boxShadow = '0 0 12px rgba(234,179,8,0.2)';
                } else {
                  el.style.background = 'rgba(99,102,241,0.12)';
                  el.style.borderColor = 'rgba(99,102,241,0.4)';
                  el.style.color = '#818CF8';
                  el.style.boxShadow = '0 0 12px rgba(99,102,241,0.2)';
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(234,179,8,0.1)';
                el.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(234,179,8,0.35)';
                el.style.color = isDark ? 'rgba(255,255,255,0.45)' : '#D97706';
                el.style.boxShadow = 'none';
              }}
            >
              <span key={theme} className="theme-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </span>
            </button>
          )}

          {/* Notification bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              id="notification-btn"
              onClick={() => {
                setShowNotif(prev => !prev);
                setNotifRead(true);
              }}
              title="Thông báo"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: showNotif
                  ? '1px solid var(--border-accent)'
                  : '1px solid var(--border-color)',
                background: showNotif
                  ? 'var(--accent-dim)'
                  : 'var(--bg-hover)',
                color: showNotif ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (showNotif) return;
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'var(--bg-hover)';
                el.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                if (showNotif) return;
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'var(--bg-hover)';
                el.style.color = 'var(--text-secondary)';
              }}
            >
              <Bell size={15} />
              {/* Unread badge */}
              {!notifRead && unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent-glow-strong)',
                  border: '1.5px solid var(--bg-primary)',
                }} />
              )}
            </button>

            {/* Notification dropdown panel */}
            {showNotif && (
              <div
                className="notif-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '300px',
                  borderRadius: '16px',
                  background: 'var(--bg-secondary)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid var(--border-accent)',
                  boxShadow: 'var(--shadow-xl), 0 0 0 1px var(--border-accent-glow)',
                  overflow: 'hidden',
                  zIndex: 50,
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '14px 16px 10px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Thông báo</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: '20px',
                    padding: '2px 8px',
                  }}>
                    {unreadCount} mới
                  </span>
                </div>
                {/* Items */}
                {NOTIFICATIONS.map((n, i) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid var(--border-color)' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      background: n.unread ? 'var(--accent-dim)' : 'transparent',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.unread ? 'var(--accent-dim)' : 'transparent'; }}
                  >
                    {/* Dot */}
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      marginTop: '5px',
                      flexShrink: 0,
                      background: n.unread ? 'var(--accent)' : 'var(--border-hover)',
                      boxShadow: n.unread ? '0 0 6px var(--accent-glow-strong)' : 'none',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12.5px', color: n.unread ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: n.unread ? 600 : 400, margin: 0, lineHeight: 1.4 }}>
                        {n.title}
                      </p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: 500 }}>
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Footer */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)' }}>
                  <Link
                    href="/support"
                    style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 600, display: 'block', textAlign: 'center', transition: 'color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                    onClick={() => setShowNotif(false)}
                  >
                    Xem tất cả thông báo →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Divider */}
          <div style={{
            width: '1px',
            height: '28px',
            background: 'var(--border-color)',
            flexShrink: 0,
            margin: '0 2px',
          }} className="hidden sm:block" />

          {/* Avatar */}
          <div
            title="Profile"
            style={{ cursor: 'pointer', flexShrink: 0 }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1.5px solid var(--border-accent)',
                boxShadow: '0 0 12px var(--accent-glow)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--accent)';
                el.style.boxShadow = '0 0 18px var(--accent-glow-strong)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--border-accent)';
                el.style.boxShadow = '0 0 12px var(--accent-glow)';
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEyB_PvVRzXN4yiDitzp1PGOyIyf6LUr5hOqgntVo-SExz7qZ0lnlNYI5BDXnf7_EIS8bLZFPL9zaUKc8Q3eQPX0Yz5toTlRe6l3eTZTwabzhthg64CTqHzmyfMyf_6Uwe1qFKv9fMkXS_8ZieHXlpo2rIe2EqDYjbq1kjwEv4eP3u9RJQPmG1I6hDJMNa2f4VKYWuRAXmz9wKiMx8ntUwp4f7CKb4_Gl8dXTyak1rnLc66j4Cw19jP4NwOm1v4plHSeqjOfOnLVM"
                alt="Admin"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
