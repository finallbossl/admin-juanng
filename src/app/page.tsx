'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';

interface Movie {
  id: string;
  name: string;
  type: string;
  quality: string;
  time: string;
  createdAt: string;
  thumbUrl: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
}

interface SystemMetrics {
  totalMovies: number;
  totalUsers: number;
  cpuLoad: number;
  memoryUsagePercent: number;
  uptime: string;
}

/* ─────────────────────────────────────────── helpers */
function timeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diffMs / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  } catch {
    return 'recently';
  }
}

/* ─────────────────────────────────────────── SVG Area Chart */
function AreaChart() {
  const data = [30, 52, 38, 68, 55, 83, 72, 91, 76, 110, 95, 124, 108, 140];
  const w = 500, h = 120;
  const pad = { t: 12, r: 8, b: 28, l: 8 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const xStep = cw / (data.length - 1);

  const toX = (i: number) => pad.l + i * xStep;
  const toY = (v: number) => pad.t + ch - ((v - min) / (max - min)) * ch;

  const linePath = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`)
    .join(' ');

  const areaPath =
    `M${toX(0)},${h - pad.b} ` +
    data.map((v, i) => `L${toX(i)},${toY(v)}`).join(' ') +
    ` L${toX(data.length - 1)},${h - pad.b} Z`;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 120 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((t, i) => (
        <line
          key={i}
          x1={pad.l} y1={pad.t + ch * t}
          x2={w - pad.r} y2={pad.t + ch * t}
          stroke="var(--border-color)" strokeWidth="1"
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line stroke */}
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lineGlow)"
      />

      {/* Peak dot */}
      {(() => {
        const peakIdx = data.indexOf(max);
        return (
          <>
            <circle cx={toX(peakIdx)} cy={toY(max)} r="4" fill="var(--accent)" />
            <circle cx={toX(peakIdx)} cy={toY(max)} r="7" fill="var(--accent-glow)" />
          </>
        );
      })()}

      {/* Day labels */}
      {days.map((d, i) => {
        const dataIdx = Math.round(i * (data.length - 1) / (days.length - 1));
        return (
          <text
            key={i}
            x={toX(dataIdx)}
            y={h - 4}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            {d}
          </text>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────── Skeleton */
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-cinema rounded-2xl h-[140px]" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="skeleton-cinema rounded-2xl h-[220px]" />
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton-cinema rounded-2xl h-[160px]" />
            <div className="skeleton-cinema rounded-2xl h-[160px]" />
          </div>
        </div>
        <div className="skeleton-cinema rounded-2xl" style={{ minHeight: 420 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── Panel wrapper */
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card-cinema rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────── Main Component */
export default function DashboardHome() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [metricsRes, moviesRes, usersRes] = await Promise.all([
          api.get<SystemMetrics>('/system/metrics'),
          api.get<any[]>('/catalog/movies'),
          api.get<any[]>('/users'),
        ]);

        setMetrics(metricsRes.result);
        setRecentMovies(
          (moviesRes.result || [])
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map((m: any) => ({
              id: m.id, name: m.name,
              type: m.type || 'Phim lẻ',
              quality: m.quality || 'HD',
              time: m.time ? (m.time.toString().includes('phút') ? m.time : `${m.time} phút`) : 'Chưa rõ',
              createdAt: m.createdAt,
              thumbUrl: m.thumbUrl || '',
            }))
        );
        setRecentUsers(
          (usersRes.result || [])
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((u: any) => ({
              id: u.id,
              name: u.fullName || u.username,
              email: u.email,
              joinedDate: u.createdAt ? timeAgo(u.createdAt) : 'recently',
            }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageSkeleton />;

  /* ── Fallback data */
  const fallbackMovies: Movie[] = [
    { id: '1', name: 'The Midnight Protocol', type: 'Action / Thriller', quality: '4K HDR', time: '2h 15m', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), thumbUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqUBizPFNSPJFCEFR2D-00c8fVn7ac09dU3t0ynfdI1ycXnmCEZnIohRp6Ok5CCpCHJ88mn9fi1td9esMoTeuFDYvwKlk0J_avDmX1qTbvVaVb8EX0AS6HCInjiuocqMe9rvkd70sUYEEffGL_NVXVJtYJchExQZe9w1ZtLTh7zvlG3W6qzB-ngWY3lxIA4uEEcEEMiiGvE2bjL_Q88WRIfN3gtGTprAbwE7LN8ju3AE3tWcVFrf24wFawBqz4-9T4RuqmWO3bgzc' },
    { id: '2', name: 'Echoes of Silence', type: 'Drama / Sci-Fi', quality: '4K HDR', time: '1h 48m', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), thumbUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4HTzH6yARagr4oeYI8QB-rnz_B0JrKyBznlqoMeydppycA9QqweZrMgvl_3_V4K9PKw6V-PZUUug0y3-g5hK2xGMi3Fnr3yesVM5iZXRSEiULzSAP2d596t9sDnjcc4uhMkBa_Ys-6y9VfPD2pSo7VuIfpdXSapy6eKjXr3f5uH--Kn4v0Emgh_UQ2hDplGM8yCcSS9IU5Wt06FdYRyeajRIX6squR-QxmEAEPhXvOPbZ5a9umjxzCloVxX7_eX6nOU3n_TdiB74' },
    { id: '3', name: 'Fractured Empire', type: 'History / Epic', quality: '1080p', time: '2h 38m', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), thumbUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=60' },
  ];
  const fallbackUsers: User[] = [
    { id: '1', name: 'John Doe',     email: 'j.doe@example.com',   joinedDate: '5m ago' },
    { id: '2', name: 'Sarah Parker', email: 's.parker@cinema.tv',  joinedDate: '12m ago' },
    { id: '3', name: 'Mike Ross',    email: 'mike.r@stream.com',   joinedDate: '24m ago' },
    { id: '4', name: 'Elena L.',     email: 'e.l@media.net',       joinedDate: '1h ago' },
    { id: '5', name: 'Daniel K.',    email: 'd.k@cineclub.io',     joinedDate: '2h ago' },
  ];
  const userAvatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDUVAmtnMnK4NfNZwVzykt_WGgpbRZxqOIU56NAQe8DnTQv8glIiUO_znpe-qgd9YsqP5wibdCgy6M912wyF73WpZxqjXzOgNak55-fEsawD9k9KBWnQy9BVdj-cp2ttq1iE48VbHfwFg6G0C8sNXNaJf5RZq9ueeQ5-FDCQMxxZHiwCf7BrrD7E2LQo4tXh0bK3FtcWfLjAM6tC_8d2NT-2fAzsIrjCNUhiiO_JEc-CkfbDl7TP2666wzqewad0ai6_C06r0aQams',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBXA0K6hGprGyDJIq0wcqsPwrMceYx_GInCEnyRRZmKXY3-5QT_AoBbaq4vFQvTQXKfbRR3rX70_FbQ1OfjtMCp1RJb_N8QPuE4HPnprvSsXg_F1vVe3PE8CNEr2meyz9ZCqlRjipKC4O5vcMH9XQP_fDOFhNWwPfGk3DfuOaBOc5Ch9gUjL4vQGPm8_CKzSzEcjsYrlGifZ2THqh1OQTpOK1wL2H0f-58AF0rfx6awWwLJBsemctTThGb3E3ZNC-31n6ZiGePC2AI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBTTidZHHTl9CHDOb-GPTiOWyVFAwzi068yKxpShA3Iz_keT4wwdwT8KNdJPsQnHfNQQE6qtBg1DQrsvNmHlUpRE6oPYqw40pxm7SGrJuUh5YJhoE-dTsN5ahBDKZas12-dkotMmhW7pgrojBKCDvJ5p5EjE4Sj8v7Y_KKXM5S9_6l26YJ3sdW9gRzNGmEvNODf8hP_p4Teoi8Zi4KQq2e1oN6VruWal3absCnSS3ywNvZDcV-hHYIFXm41fXVxGy73Bk-SjSXi3Hw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCI-j8CmiNo6hHux0UITIEFXSj7glk0h5nBaXGT1Lkq6AYLPcm0bsfwk0KycDH3LTDQmkmMb4hJNgHltBVWFq_pZhExAph1qYdAIa-ts4p3fRbeIB1P5Jffi8e62Vw45QIt9_AlOjnmhz-NXXpEtEGALnwut_iOr1tLHiSlnhDOfotIQ9HF8Zt5f_YhsC-CXUuOknzVUkYZM7OjvYYvFCVmiD3jrM6gcpQvU8nuX25Hs9xg9HR097XTZvgsy1z2Dsi0pL7tYwbkmqM',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDUVAmtnMnK4NfNZwVzykt_WGgpbRZxqOIU56NAQe8DnTQv8glIiUO_znpe-qgd9YsqP5wibdCgy6M912wyF73WpZxqjXzOgNak55-fEsawD9k9KBWnQy9BVdj-cp2ttq1iE48VbHfwFg6G0C8sNXNaJf5RZq9ueeQ5-FDCQMxxZHiwCf7BrrD7E2LQo4tXh0bK3FtcWfLjAM6tC_8d2NT-2fAzsIrjCNUhiiO_JEc-CkfbDl7TP2666wzqewad0ai6_C06r0aQams',
  ];

  const movies = recentMovies.length > 0 ? recentMovies : fallbackMovies;
  const users  = recentUsers.length > 0  ? recentUsers  : fallbackUsers;
  const cpuLoad = metrics?.cpuLoad ?? 42;
  const memLoad = metrics?.memoryUsagePercent ?? 67;

  const getStatus = (idx: number) =>
    idx === 0
      ? { label: 'Complete', color: 'var(--success)', dot: true }
      : idx === 1
      ? { label: 'Processing 84%', color: 'var(--accent)', dot: true }
      : { label: 'Queued', color: 'var(--warning)', dot: false };

  /* ── Stat card hover states are handled in globals.css under .stat-card class */

  return (
    <div className="flex flex-col gap-4 fade-in">

      {/* ═══════════════════════════════════════════════
          ROW 1 — Metric Cards
          ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* TOTAL VIEWS */}
        <div className="stat-card" style={{ padding: '20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                 style={{ color: 'var(--text-muted)' }}>
                Total Views
              </p>
              <p className="text-[32px] font-black leading-none tracking-tight stat-number"
                 style={{ color: 'var(--text-primary)' }}>
                2.4<span style={{ color: 'var(--accent)', fontSize: '22px' }}>M</span>
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          {/* Sparkline bars */}
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="2,10 7,5 10,8 14,3" />
                <polyline points="11,3 14,3 14,6" />
              </svg>
              +12.4%
            </span>
            <div className="flex items-end gap-[3px] h-9 flex-1">
              {[18, 32, 24, 48, 38, 62, 52, 74, 60, 88, 76, 100].map((hpct, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${hpct}%`,
                    background: i >= 10
                      ? 'var(--accent)'
                      : `var(--accent-glow)`,
                    boxShadow: i >= 10 ? '0 0 8px var(--accent-glow-strong)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* REVENUE */}
        <div className="stat-card" style={{ padding: '20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                 style={{ color: 'var(--text-muted)' }}>
                Revenue
              </p>
              <p className="text-[32px] font-black leading-none tracking-tight stat-number"
                 style={{ color: 'var(--text-primary)' }}>
                $15<span style={{ fontSize: '22px' }}>,420</span>
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-auto" style={{ marginTop: '12px' }}>
            <span className="text-[12px] font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="2,10 7,5 10,8 14,3" /><polyline points="11,3 14,3 14,6" />
              </svg>
              +8.4%
            </span>
            {/* Mini SVG line */}
            <svg className="flex-1 h-9" viewBox="0 0 120 36" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,30 Q20,24 30,26 T60,18 T90,10 T120,4" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M0,30 Q20,24 30,26 T60,18 T90,10 T120,4 L120,36 L0,36 Z" fill="url(#revGrad)" />
            </svg>
          </div>
        </div>

        {/* NEW USERS */}
        <div className="stat-card" style={{ padding: '20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                 style={{ color: 'var(--text-muted)' }}>
                New Users
              </p>
              <p className="text-[32px] font-black leading-none tracking-tight stat-number"
                 style={{ color: 'var(--text-primary)' }}>
                {(metrics?.totalUsers ?? 1284).toLocaleString()}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-auto" style={{ marginTop: '12px' }}>
            <span className="text-[12px] font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="2,10 7,5 10,8 14,3" /><polyline points="11,3 14,3 14,6" />
              </svg>
              +22%
            </span>
            {/* Avatar stack */}
            <div className="flex items-center ml-1">
              {userAvatars.slice(0, 4).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`User ${i + 1}`}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  style={{
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: i,
                    border: '2px solid var(--bg-secondary)',
                  }}
                />
              ))}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                style={{ marginLeft: -8, zIndex: 5, background: 'var(--accent)', border: '2px solid var(--bg-secondary)' }}
              >
                +1.2k
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ROW 2 — [Area Chart + Lists] | [Registrations]
          ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left 2 columns ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* ── Area Chart Panel ── */}
          <Panel>
            <div
              className="flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 20px' }}
            >
              <div>
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Traffic Overview
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Views per day this week
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Views</span>
                </div>
                <div
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-accent)' }}
                >
                  ↑ 24.8%
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {/* Total stat above chart */}
              <p className="text-[28px] font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                1.2<span style={{ color: 'var(--accent)' }}>M</span>{' '}
                <span className="text-[14px] font-normal" style={{ color: 'var(--text-muted)' }}>
                  this week
                </span>
              </p>
              <AreaChart />
            </div>
          </Panel>

          {/* ── New Uploads ── */}
          <Panel>
            <div
              className="flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 20px' }}
            >
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                New Uploads
              </h3>
              <Link
                href="/products"
                className="text-[12px] font-semibold transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-hover)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
              >
                View All →
              </Link>
            </div>
            <div>
              {movies.map((movie, idx) => {
                const status = getStatus(idx);
                return (
                  <div
                    key={movie.id}
                    className="flex items-center gap-4 cursor-pointer group/row transition-colors"
                    style={{ borderBottom: idx < movies.length - 1 ? '1px solid var(--border-color)' : 'none', padding: '14px 16px' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-[50px] h-[66px] rounded-lg overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={movie.thumbUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=60'}
                        alt={movie.name}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
                        style={{ background: 'var(--accent-dim)', backdropFilter: 'blur(2px)' }}
                      >
                        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {movie.name}
                      </p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                        {movie.type} · {movie.quality} · {movie.time}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        {status.dot && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: status.color, boxShadow: `0 0 5px ${status.color}` }}
                          />
                        )}
                        <span className="text-[11px] font-semibold" style={{ color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(movie.createdAt)}
                      </span>
                    </div>

                    <button
                      className="p-1.5 rounded-lg flex-shrink-0 transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* ── Bottom row: Performance + Add New ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Performance / Server Status */}
            <Panel>
              <div style={{ padding: '20px' }}>
                <div
                  className="flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}
                >
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Server Status
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--success)', animation: 'onlinePulse 2s ease-out infinite' }}
                    />
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--success)' }}>
                      Online
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Stream quality */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
                          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" />
                        </svg>
                        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                          Streaming Quality
                        </span>
                      </div>
                      <span className="text-[12px] font-bold" style={{ color: 'var(--success)' }}>Excellent</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: '98%',
                          background: 'linear-gradient(90deg, var(--success), var(--success))',
                          boxShadow: '0 0 8px var(--success-dim)',
                          animation: 'progressFill 1s cubic-bezier(0.16,1,0.3,1) forwards',
                        }}
                      />
                    </div>
                  </div>

                  {/* CPU Load */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
                          <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
                          <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
                          <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
                          <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
                        </svg>
                        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                          CPU Load
                        </span>
                      </div>
                      <span className="text-[12px] font-bold" style={{ color: cpuLoad > 70 ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {cpuLoad}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${cpuLoad}%`,
                          background: cpuLoad > 70
                            ? 'linear-gradient(90deg, var(--danger), var(--danger))'
                            : 'linear-gradient(90deg, var(--accent), var(--accent-dark))',
                          boxShadow: `0 0 8px var(--accent-glow)`,
                          animation: 'progressFill 1s cubic-bezier(0.16,1,0.3,1) forwards',
                        }}
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M6 19v-3" /><path d="M10 19v-7" /><path d="M14 19v-5" /><path d="M18 19v-9" />
                          <path d="M2 4h20" />
                        </svg>
                        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                          Memory
                        </span>
                      </div>
                      <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                        {memLoad}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${memLoad}%`,
                          background: 'linear-gradient(90deg, var(--info), var(--info))',
                          boxShadow: '0 0 8px var(--info-dim)',
                          animation: 'progressFill 1.1s cubic-bezier(0.16,1,0.3,1) forwards',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Add New Content */}
            <div
              className="rounded-2xl flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-colors duration-250"
              style={{
                background: 'var(--accent-dim)',
                border: '1px dashed var(--border-accent)',
                padding: '20px',
                transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'var(--accent-glow)';
                el.style.borderColor = 'var(--accent)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'var(--accent-dim)';
                el.style.borderColor = 'var(--border-accent)';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
                  boxShadow: '0 8px 24px var(--accent-glow-strong)',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Add New Content
                </h3>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Upload movies, trailers or manage schedules
                </p>
              </div>
              <Link href="/products">
                <button
                  className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white cursor-pointer transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
                    boxShadow: '0 4px 16px var(--accent-glow-strong)',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px var(--accent-glow-strong)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px var(--accent-glow-strong)')}
                >
                  Upload Now
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            Right column — New Registrations
            ═══════════════════════════════════════════════ */}
        <Panel className="flex flex-col">
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 20px' }}
          >
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                New Registrations
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Real-time sign-ups
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent)', animation: 'liveBlink 1.8s ease-in-out infinite' }}
              />
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                Live
              </span>
            </div>
          </div>

          <div className="flex-1" style={{ padding: '8px' }}>
            {users.map((user, idx) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-xl transition-colors cursor-pointer"
                style={{ padding: '12px' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden"
                    style={{ border: '1.5px solid var(--border-color)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userAvatars[idx % userAvatars.length]}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {idx < 2 && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                      style={{
                        background: 'var(--success)',
                        borderColor: 'var(--bg-primary)',
                        animation: 'onlinePulse 2s ease-out infinite',
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </div>

                {/* Time */}
                <div
                  className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide flex-shrink-0"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-accent)' }}
                >
                  {user.joinedDate}
                </div>
              </div>
            ))}
          </div>

          <div
            className="px-5 py-3 mt-auto flex-shrink-0"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <Link
              href="/users"
              className="block text-center text-[12px] font-semibold py-2 rounded-xl transition-all"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              }}
            >
              Manage All Users →
            </Link>
          </div>
        </Panel>

      </div>
    </div>
  );
}
