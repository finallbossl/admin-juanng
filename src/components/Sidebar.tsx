'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Film,
  Database,
  Users,
  BarChart3,
  FileText,
  HelpCircle,
  Settings,
  ChevronDown
} from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: string;
  badge?: number;
  children?: SubMenuItem[];
}

interface NavigationSection {
  title: string;
  items: MenuItem[];
}

const navigationSections: NavigationSection[] = [
  {
    title: 'QUẢN TRỊ NỘI DUNG',
    items: [
      {
        label: 'Tổng quan',
        href: '/',
        icon: 'LayoutDashboard',
      },
      {
        label: 'Quản lý Phim',
        icon: 'Film',
        children: [
          {
            label: 'Danh sách phim',
            href: '/products',
          },
          {
            label: 'Thêm phim mới',
            href: '/products?add=true',
          },
          {
            label: 'Thể loại phim',
            href: '/products?tab=genres',
          },
        ],
      },
      {
        label: 'Cấu hình nguồn phim',
        href: '/settings?tab=crawler',
        icon: 'Database',
      },
    ],
  },
  {
    title: 'DỮ LIỆU & BÁO CÁO',
    items: [
      {
        label: 'Người dùng',
        href: '/users',
        icon: 'Users',
        badge: 12,
      },
      {
        label: 'Báo cáo',
        href: '/analytics',
        icon: 'BarChart3',
      },
    ],
  },
  {
    title: 'HỆ THỐNG & TRỢ GIÚP',
    items: [
      {
        label: 'Tài liệu hướng dẫn',
        href: '/support?tab=docs',
        icon: 'FileText',
      },
      {
        label: 'Trợ giúp & Hỗ trợ',
        href: '/support',
        icon: 'HelpCircle',
      },
    ],
  },
];

export default function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps = {}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // Mouse coordinate tracking for interactive follow glow
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [isMouseInSidebar, setIsMouseInSidebar] = useState(false);

  // Hover states for list items
  const [hoveredItemKey, setHoveredItemKey] = useState<string | null>(null);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Matcher for active URLs (checks path and query params)
  const isUrlActive = (href: string) => {
    if (pathname === href) return true;
    if (!href.includes('?')) {
      return pathname === href;
    }
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search === href;
    }
    return pathname === href.split('?')[0];
  };

  // Check if a parent item is active
  const isParentActive = (item: MenuItem) => {
    if (item.href) {
      return isUrlActive(item.href);
    }
    if (item.children) {
      return item.children.some(child => isUrlActive(child.href));
    }
    return false;
  };

  // Track expanded submenus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationSections.forEach(section => {
      section.items.forEach(item => {
        if (item.children && item.children.some(child => pathname === child.href.split('?')[0])) {
          initial[item.label] = true;
        }
      });
    });
    return initial;
  });

  // Auto-expand menu on path change
  useEffect(() => {
    navigationSections.forEach(section => {
      section.items.forEach(item => {
        if (item.children && item.children.some(child => pathname === child.href.split('?')[0])) {
          setExpandedMenus(prev => ({
            ...prev,
            [item.label]: true,
          }));
        }
      });
    });
  }, [pathname]);

  const toggleSubMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Dynamically retrieve Lucide icons with premium styling
  const getIcon = (name: string, active: boolean, isHovered: boolean) => {
    const iconProps = {
      size: 20,
      strokeWidth: 2.0,
      className: `transition-all duration-300 flex-shrink-0 ${
        active
          ? 'text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)] scale-105'
          : isHovered
            ? 'text-[var(--text-sidebar-active)] scale-105'
            : 'text-[var(--text-sidebar)]'
      }`,
    };

    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard {...iconProps} />;
      case 'Film': return <Film {...iconProps} />;
      case 'Database': return <Database {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'BarChart3': return <BarChart3 {...iconProps} />;
      case 'FileText': return <FileText {...iconProps} />;
      case 'HelpCircle': return <HelpCircle {...iconProps} />;
      default: return null;
    }
  };

  return (
    <>
      {/* ── Sleek Animations & Glow Overlays ── */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
        }
        .online-status-pulse {
          animation: pulse-dot 2.2s infinite ease-in-out;
        }
        @keyframes active-dot-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
            box-shadow: 0 0 4px rgba(229, 9, 20, 0.6);
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
            box-shadow: 0 0 10px rgba(229, 9, 20, 0.9);
          }
        }
        .active-glow-dot {
          animation: active-dot-pulse 1.8s infinite ease-in-out;
        }
        .sidebar-interactive-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            220px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
            rgba(229, 9, 20, 0.07),
            transparent 80%
          );
          z-index: 0;
          pointer-events: none;
          opacity: var(--glow-opacity, 0);
          transition: opacity 0.4s ease;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <ShadcnSidebar
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsMouseInSidebar(true)}
        onMouseLeave={() => setIsMouseInSidebar(false)}
        className="border-r border-[var(--border-sidebar)]! sidebar-interactive-glow overflow-hidden w-[260px]! transition-colors duration-250"
        style={{
          '--sidebar-width': '260px',
          '--sidebar': 'var(--bg-sidebar)',
          '--sidebar-border': 'var(--border-sidebar)',
          '--mouse-x': `${mouseCoords.x}px`,
          '--mouse-y': `${mouseCoords.y}px`,
          '--glow-opacity': isMouseInSidebar ? 1 : 0,
          background: 'var(--bg-sidebar)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as React.CSSProperties}
      >
        {/* ── Frosted Glass Noise Overlay ── */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0 mix-blend-overlay bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />

        {/* ── Cyber-Tech Decorative Corner Brackets ── */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-white/10 pointer-events-none z-10" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-white/10 pointer-events-none z-10" />
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-white/10 pointer-events-none z-10" />
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-white/10 pointer-events-none z-10" />

        {/* ── Brand Header Logo (Padded top 12px, left 24px, right 24px) ── */}
        <SidebarHeader
          className="pr-6 flex-shrink-0 relative z-10 flex flex-row! items-center border-b border-[rgba(229, 9, 20, 0.08)] bg-transparent"
          style={{ paddingLeft: '24px', paddingTop: '12px', paddingBottom: '12px' }}
        >
          <Link
            href="/"
            onClick={() => isMobile && setOpenMobile(false)}
            className="flex items-center gap-3.5 cursor-pointer group select-none transition-transform duration-250 active:scale-95"
          >
            {/* Minimalist Film Reel SVG Logo with Glow */}
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#9B0710] flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 border border-white/10"
              style={{ boxShadow: '0 0 15px rgba(229, 9, 20, 0.45)' }}
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="7.5" r="1" fill="currentColor" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
                <circle cx="7.5" cy="12" r="1" fill="currentColor" />
                <circle cx="16.5" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-black tracking-[-0.03em] leading-none flex items-baseline">
                <span className="text-[var(--text-primary)]">Cine</span>
                <span className="text-[var(--accent)] font-black ml-0.5" style={{ textShadow: '0 0 10px var(--accent-glow)' }}>Admin</span>
              </span>
              <div className="flex items-center gap-2 mt-1.5 leading-none">
                <span className="text-[8px] font-extrabold tracking-[0.2em] uppercase leading-none" style={{ color: 'var(--text-sidebar)', opacity: 0.45 }}>
                  STREAM CONTROL
                </span>
                <span className="text-[6.5px] font-mono px-1 py-0.5 rounded-sm border leading-none tracking-normal" style={{ color: 'var(--text-sidebar)', opacity: 0.35, borderColor: 'var(--border-sidebar)', background: 'var(--bg-hover)' }}>
                  SYS.REF: C09
                </span>
              </div>
            </div>
          </Link>
        </SidebarHeader>

        {/* ── Navigation List (pl-4 pr-4 containers for perfectly padded floating buttons) ── */}
        <SidebarContent className="flex-1 pl-4 pr-4 pt-3! pb-6! overflow-y-auto no-scrollbar relative z-10 flex flex-col gap-6 bg-transparent">
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-2">
              {/* Section Header Label: Aligns text exactly to 48px from left (nav pl-4 + header pl-32 = 48px) */}
              <div 
                className="flex items-center gap-2.5 pr-2 mb-1"
                style={{ paddingLeft: '32px' }}
              >
                <span className="text-[10.5px] font-extrabold tracking-widest select-none uppercase" style={{ color: 'var(--text-sidebar)', opacity: 0.55 }}>
                  {section.title}
                </span>
                <div className="flex-1 h-[1px]" style={{ background: 'var(--border-sidebar)', opacity: 0.4 }} />
              </div>

              {/* Section Items */}
              <SidebarMenu className="flex flex-col gap-1.5 bg-transparent border-none! outline-none!">
                {section.items.map((item, idx) => {
                  const active = isParentActive(item);
                  const expanded = expandedMenus[item.label];
                  const itemKey = `${sIdx}-${idx}`;
                  const isHovered = hoveredItemKey === itemKey;

                  return (
                    <SidebarMenuItem key={idx} className="bg-transparent border-none! outline-none!">
                      {/* Button: padding puts icon at 24px left (nav pl-4 + button style pl-8 = 24px). pr-2 puts right items at 24px right (nav pr-4 + button pr-2 = 24px) */}
                      <SidebarMenuButton
                        render={item.href ? <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} /> : <div />}
                        onClick={item.href ? undefined : () => toggleSubMenu(item.label)}
                        isActive={active}
                        onMouseEnter={() => setHoveredItemKey(itemKey)}
                        onMouseLeave={() => setHoveredItemKey(null)}
                        className={`relative flex items-center pr-2! py-3! rounded-xl! transition-all! duration-200! cursor-pointer! group/nav select-none active:scale-[0.98]! h-auto! w-full! bg-transparent! border-none! outline-hidden!
                          ${active
                            ? 'text-[var(--text-sidebar-active)]!'
                            : isHovered
                              ? 'text-[var(--text-sidebar-active)]! bg-[var(--bg-hover)]!'
                              : 'text-[var(--text-sidebar)]! hover:text-[var(--text-sidebar-active)]!'
                          }
                        `}
                        style={{
                          paddingLeft: '32px',
                          ...(active ? {
                            background: 'var(--accent-dim)',
                            backgroundImage: 'radial-gradient(circle at left center, var(--accent-glow) 0%, transparent 60%)',
                            boxShadow: '0 0 10px var(--accent-dim)',
                          } : {})
                        }}
                      >
                        {/* ── Active or Hover Left Accent Bar ── */}
                        <span
                          className={`absolute left-0 top-3 bottom-3 w-[2.5px] rounded-r transition-all duration-300 ${
                            active
                              ? 'bg-gradient-to-b from-[var(--accent)] to-[var(--accent-dark)] opacity-100 shadow-[0_0_8px_var(--accent)]'
                              : isHovered
                                ? 'bg-[var(--accent)]/40 opacity-100'
                                : 'bg-transparent opacity-0'
                          }`}
                        />

                        {/* Icon */}
                        {getIcon(item.icon, active, isHovered)}

                        {/* Label (Icon 20px + Gap 16px = 36px. Aligns text precisely at 84px from left edge) */}
                        <span 
                          className={`text-[13.8px] tracking-wide transition-colors duration-200 font-semibold ${active ? 'text-[var(--text-sidebar-active)]' : 'text-[var(--text-sidebar)]'}`}
                          style={{ marginLeft: '16px' }}
                        >
                          {item.label}
                        </span>

                        {/* Glow indicator dot at the end of active menu item */}
                        {active && !item.children && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)] active-glow-dot" style={{ boxShadow: '0 0 4px var(--accent)' }} />
                        )}

                        {/* Numeric Badge with subtle shadow */}
                        {item.badge !== undefined && (
                          <span
                            className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold text-white transition-transform duration-200 group-hover/nav:scale-105"
                            style={{
                              background: 'var(--accent)',
                              boxShadow: '0 0 8px var(--accent-glow)',
                              lineHeight: '1.2',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Dropdown Chevron */}
                        {item.children && (
                          <ChevronDown
                            size={16}
                            className={`ml-auto transition-transform duration-300 text-slate-400 ${
                              expanded ? 'rotate-180 text-[var(--accent)]' : ''
                            } ${isHovered ? 'text-[var(--text-sidebar-active)]' : ''}`}
                          />
                        )}
                      </SidebarMenuButton>

                      {/* Submenu links with indicators (Aligned text to exactly 84px: nav pl-4 (16) + ml-32 (32) + pl-6 (24) + ml-12 (12) = 84px) */}
                      {item.children && expanded && (
                        <SidebarMenuSub 
                          className="flex flex-col gap-2 mt-1.5 border-l pl-5 py-1.5 transition-all duration-300 bg-transparent mx-0! border-r-0! border-t-0! border-b-0! outline-none!"
                          style={{ marginLeft: '32px', borderColor: 'var(--border-sidebar)' }}
                        >
                          {item.children.map((child, cIdx) => {
                            const childActive = isUrlActive(child.href);
                            return (
                              <SidebarMenuSubItem key={cIdx} className="bg-transparent border-none! outline-none!">
                                <SidebarMenuSubButton
                                  render={<Link href={child.href} onClick={() => isMobile && setOpenMobile(false)} />}
                                  isActive={childActive}
                                  className={`relative text-[13px]! py-1.5! pl-6! pr-2! transition-all! duration-200! cursor-pointer! select-none! block! hover:translate-x-1! h-auto! w-full! bg-transparent! border-none! outline-none!
                                    ${childActive
                                      ? 'text-[var(--text-sidebar-active)]! font-semibold!'
                                      : 'text-[var(--text-sidebar)]! hover:text-[var(--text-sidebar-active)]! font-medium!'
                                    }
                                  `}
                                >
                                  {/* Connector Dot */}
                                  <span
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                      childActive
                                        ? 'bg-[var(--accent)] shadow-[0_0_6px_var(--accent)] scale-100'
                                        : 'bg-slate-700 scale-75 opacity-40 hover:opacity-80'
                                    }`}
                                  />
                                  <span 
                                    className="transition-colors duration-200"
                                    style={{ marginLeft: '12px' }}
                                  >
                                    {child.label}
                                  </span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </SidebarContent>

        {/* ── Technical Coordinates Readout (Aligned to 24px left and 24px right) ── */}
        <div 
          className="pr-6 py-2.5 select-none flex justify-between text-[7.5px] font-mono border-t z-10 transition-colors duration-250" 
          style={{ paddingLeft: '24px', color: 'var(--text-sidebar)', opacity: 0.5, borderColor: 'var(--border-sidebar)', background: 'var(--bg-hover)' }}
        >
          <span>LOC: VN-MAIN</span>
          <span>LAT 10.7629 // LNG 106.6601</span>
        </div>

        {/* ── User Profile Section (Floating Card Style aligned to 16px/32px grids) ── */}
        <SidebarFooter 
          className="mt-auto relative z-10 flex flex-col gap-2 bg-transparent"
          style={{ paddingBottom: '28px', paddingTop: '12px', paddingLeft: '16px', paddingRight: '16px' }}
        >
          {/* Floating Frosted Profile Card - inline padding to bypass shadcn overrides */}
          <div
            className="flex items-center rounded-2xl border border-[var(--border-sidebar)] transition-all duration-300 cursor-pointer group/profile
              hover:border-[var(--accent)]/25 hover:bg-[var(--bg-hover)] hover:shadow-[0_0_15px_var(--accent-glow)] bg-[var(--bg-hover)]/30 relative overflow-hidden transition-colors duration-250
            "
            style={{ padding: '10px 14px', gap: '12px', width: '100%' }}
          >
            <div className="relative flex-shrink-0">
              {/* Profile Avatar with spring scale & subtle gradient border */}
              <div className="w-9 h-9 rounded-full border border-[var(--border-sidebar)] p-0.5 overflow-hidden transition-all duration-300 group-hover/profile:border-[var(--accent)]/70 group-hover/profile:scale-105">
                <Avatar className="w-full h-full">
                  <AvatarImage
                    alt="Admin Profile"
                    className="object-cover rounded-full"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEyB_PvVRzXN4yiDitzp1PGOyIyf6LUr5hOqgntVo-SExz7qZ0lnlNYI5BDXnf7_EIS8bLZFPL9zaUKc8Q3eQPX0Yz5toTlRe6l3eTZTwabzhthg64CTqHzmyfMyf_6Uwe1qFKv9fMkXS_8ZieHXlpo2rIe2EqDYjbq1kjwEv4eP3u9RJQPmG1I6hDJMNa2f4VKYWuRAXmz9wKiMx8ntUwp4f7CKb4_Gl8dXTyak1rnLc66j4Cw19jP4NwOm1v4plHSeqjOfOnLVM"
                  />
                  <AvatarFallback
                    className="text-white font-bold text-xs"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
                  >
                    AD
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Glowing Pulse Online status dot */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[var(--bg-sidebar)] bg-[#10B981] online-status-pulse transition-colors duration-250" />
            </div>
            <div className="flex flex-col min-w-0" style={{ flex: '1 1 0', overflow: 'hidden' }}>
              <span className="font-bold text-[13.5px] leading-tight text-[var(--text-primary)] truncate transition-colors duration-200 group-hover/profile:text-[var(--accent)]">
                Cine Admin
              </span>
              <span className="text-[8.5px] font-extrabold text-[var(--accent)] uppercase tracking-widest mt-1 leading-none opacity-90 transition-colors duration-250">
                SYSTEM OWNER
              </span>
            </div>

            {/* Settings Gear Button — pushed to far right */}
            <Link
              href="/settings"
              onClick={() => isMobile && setOpenMobile(false)}
              onMouseEnter={() => setIsSettingsHovered(true)}
              onMouseLeave={() => setIsSettingsHovered(false)}
              className={`border rounded-xl transition-all duration-300 flex items-center justify-center p-2 active:scale-90 flex-shrink-0
                ${isSettingsHovered
                  ? 'text-[var(--accent)] bg-[var(--accent-dim)] border-[var(--border-accent)] shadow-[0_0_12px_var(--accent-glow)]'
                  : 'text-[var(--text-sidebar)] bg-[var(--bg-hover)] border-[var(--border-sidebar)] hover:text-[var(--text-sidebar-active)] hover:border-[var(--border-sidebar)]'
                }
              `}
              style={{
                marginLeft: 'auto',
                flexShrink: 0,
                transform: isSettingsHovered ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, border-color 0.2s, color 0.2s',
              }}
              title="Settings"
            >
              <Settings size={15} />
            </Link>
          </div>
        </SidebarFooter>
      </ShadcnSidebar>
    </>
  );
}
