'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system metrics
      const metricsRes = await api.get<SystemMetrics>('/system/metrics');
      setMetrics(metricsRes.result);

      // 2. Fetch movies
      const moviesRes = await api.get<any[]>('/catalog/movies');
      const sortedMovies = (moviesRes.result || [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2) // We show 2 new uploads in the mockup layout
        .map(m => ({
          id: m.id,
          name: m.name,
          type: m.type || 'Phim lẻ',
          quality: m.quality || 'HD',
          time: m.time ? `${m.time} phút` : 'Chưa rõ',
          createdAt: m.createdAt,
          thumbUrl: m.thumbUrl || ''
        }));
      setRecentMovies(sortedMovies);

      // 3. Fetch users
      const usersRes = await api.get<any[]>('/users');
      const sortedUsers = (usersRes.result || [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4) // We show 4 new registrations in the mockup
        .map(u => ({
          id: u.id,
          name: u.fullName || u.username,
          email: u.email,
          joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ'
        }));
      setRecentUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const timeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    } catch (e) {
      return 'Gần đây';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Header (Mobile Only) */}
        <div className="md:hidden mb-6">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-4 w-64 bg-white/5 mt-2" />
        </div>

        {/* Statistical Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="md:col-span-4 glass-panel rounded-xl p-6 h-36 flex flex-col justify-between border-none shadow-none">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/5" />
                  <Skeleton className="h-8 w-16 bg-white/5" />
                </div>
                <Skeleton className="h-10 w-10 bg-white/5 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-32 bg-white/5" />
            </div>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <div className="glass-panel rounded-xl p-6 space-y-4 border-none shadow-none">
              <Skeleton className="h-6 w-36 bg-white/5" />
              <div className="space-y-4 pt-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="h-20 w-16 bg-white/5 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-white/5" />
                      <Skeleton className="h-3 w-1/4 bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="glass-panel rounded-xl p-6 space-y-4 border-none shadow-none">
              <Skeleton className="h-6 w-36 bg-white/5" />
              <div className="space-y-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="h-10 w-10 bg-white/5 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2 bg-white/5" />
                      <Skeleton className="h-3 w-1/3 bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header (Mobile/Tablet) */}
      <div className="md:hidden mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Hello, Admin</h1>
        <p className="text-secondary text-body-md">Here's what's happening today.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: TOTAL VIEWS */}
        <div className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">TOTAL VIEWS</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">2.4M</h3>
            </div>
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined">visibility</span>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-green-500 font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +12%
            </span>
            <div className="flex-1 h-10 flex items-end gap-1 px-2">
              <div className="w-2 bg-primary-container/30 h-[20%] rounded-t-sm"></div>
              <div className="w-2 bg-primary-container/30 h-[40%] rounded-t-sm"></div>
              <div className="w-2 bg-primary-container/30 h-[30%] rounded-t-sm"></div>
              <div className="w-2 bg-primary-container/60 h-[60%] rounded-t-sm"></div>
              <div className="w-2 bg-primary-container/40 h-[45%] rounded-t-sm"></div>
              <div className="w-2 bg-primary-container/80 h-[80%] rounded-t-sm"></div>
              <div className="w-2 bg-primary-container h-[100%] rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Card 2: REVENUE */}
        <div className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">REVENUE</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">$15,420</h3>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-green-500 font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +8.4%
            </span>
            <svg className="flex-1 h-10 text-green-500 stroke-current fill-none stroke-2" viewBox="0 0 100 30">
              <path d="M0,25 Q15,20 25,22 T50,15 T75,10 T100,5" strokeLinecap="round"></path>
            </svg>
          </div>
        </div>

        {/* Card 3: NEW USERS */}
        <div className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">NEW USERS</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                {metrics?.totalUsers ? metrics.totalUsers.toLocaleString() : '1,284'}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-tertiary-container/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">person_add</span>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-tertiary font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +22%
            </span>
            <div className="flex-1 h-10 flex items-center justify-end">
              {recentUsers.length > 0 ? (
                <>
                  {recentUsers.slice(0, 3).map((user, idx) => (
                    <div 
                      key={user.id} 
                      className={`w-8 h-8 rounded-full border-2 border-surface bg-surface-variant overflow-hidden flex-shrink-0 flex items-center justify-center ${idx > 0 ? '-ml-3' : ''}`}
                    >
                      <div className="w-full h-full bg-gradient-to-tr from-primary-container to-on-primary-fixed-variant flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                  ))}
                  {metrics?.totalUsers && metrics.totalUsers > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container -ml-3 flex items-center justify-center text-[10px] font-bold text-white z-10 flex-shrink-0">
                      +{metrics.totalUsers - 3}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-variant overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="U1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7BHk8opuyYPRs0Ytbp6o5XVqxIODL3fcWiGXvnQzskpCiKtEWJhsbLCu9V_YAx8_ZLIVjuqRwszHfrZKnAK0kObtxWZzmpxyoInfl1FmHsXLnHc5HkhACglAsjgKZE8M6QXPOO8XsGjwwlt3Lw6fSLiWIFNWG66Fx5hsJi4fzaUjNN4pBcdS7kCXgjmPRLJrsm-r44xjovkogrcTGF8oJNQpZCSwmc8l0CIL9EZ9mDzVTNcpHVy2tudP3YOPc55E17ISPKizaoLI"/>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-variant -ml-3 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="U2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuYG2Elt7xtQ6meeUbKuBJKFx5VUoODZqRyRRG4sDukit8NjMMtGY6s9eL_jn6BWmgxIY__nnP51Fu2V6XPYzpY8DR964rQg7ojFczeTD2WYpX7Bj93lCS2FYVGWMXjNtAQ5ihgeFzyoX-fn076EQFg2TTEBDQnDQgMhMJEEVypiVL2sPMWy455fXYVgm0o7LFsFaDV-NiYlpc8XCxLEDfNZiXceTvgpj5ow2qcT-nvdMLV4rFBi7XcUbKGYgJniWSOJPhsoPCv7E"/>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-variant -ml-3 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="U3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2TMYMV10HP3wV8yt_bcYpBYI9EUnLg7PkPmvXOQoO_14WWJ_DZnNAYNQOxr68buxlp0HQr3PJCX30QUdn8xwrYhqedJ3ERQwxPHxYWlokCkXHGLthXK8w0kU27oVGnMtQO4jlagaJxgZbyCA5pMTR1J0WuJ-bAB51af_O6Y_cj13IF3UtHmh9F8Sqf4QUJq08tgKW77uutPKBcCvMNhXxB-ZmcLU6F1s8vAVicgMHMJvVAWXCHsnFl65p24J7eVhTdC6aD2WakHI"/>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container -ml-3 flex items-center justify-center text-[10px] font-bold text-white z-10 flex-shrink-0">+1.2k</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity (8 columns) */}
        <div className="md:col-span-8 space-y-6">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm">New Uploads</h3>
              <Link href="/products" className="text-primary-container text-label-lg font-label-lg hover:underline transition-all">
                View All
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentMovies.length > 0 ? (
                recentMovies.map((movie) => (
                  <div key={movie.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface-container-highest relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover" alt={movie.name} src={movie.thumbUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=60"}/>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-white">play_arrow</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">{movie.name}</h4>
                      <p className="text-secondary text-body-md truncate">{movie.type} • {movie.quality} • {movie.time}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                      <span className="text-label-lg font-label-lg text-green-500">Processing Complete</span>
                      <span className="text-secondary text-xs">{timeAgo(movie.createdAt)}</span>
                    </div>
                    <button className="text-secondary hover:text-white">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface-container-highest relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover" alt="The Midnight Protocol poster" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqUBizPFNSPJFCEFR2D-00c8fVn7ac09dU3t0ynfdI1ycXnmCEZnIohRp6Ok5CCpCHJ88mn9fi1td9esMoTeuFDYvwKlk0J_avDmX1qTbvVaVb8EX0AS6HCInjiuocqMe9rvkd70sUYEEffGL_NVXVJtYJchExQZe9w1ZtLTh7zvlG3W6qzB-ngWY3lxIA4uEEcEEMiiGvE2bjL_Q88WRIfN3gtGTprAbwE7LN8ju3AE3tWcVFrf24wFawBqz4-9T4RuqmWO3bgzc"/>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-white">play_arrow</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">The Midnight Protocol</h4>
                      <p className="text-secondary text-body-md truncate">Action / Thriller • 4K • 2h 15m</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                      <span className="text-label-lg font-label-lg text-green-500">Processing Complete</span>
                      <span className="text-secondary text-xs">2 hours ago</span>
                    </div>
                    <button className="text-secondary hover:text-white">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                  <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface-container-highest relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover" alt="Echoes of Silence poster" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4HTzH6yARagr4oeYI8QB-rnz_B0JrKyBznlqoMeydppycA9QqweZrMgvl_3_V4K9PKw6V-PZUUug0y3-g5hK2xGMi3Fnr3yesVM5iZXRSEiULzSAP2d596t9sDnjcc4uhMkBa_Ys-6y9VfPD2pSo7VuIfpdXSapy6eKjXr3f5uH--Kn4v0Emgh_UQ2hDplGM8yCcSS9IU5Wt06FdYRyeajRIX6squR-QxmEAEPhXvOPbZ5a9umjxzCloVxX7_eX6nOU3n_TdiB74"/>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-white">play_arrow</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">Echoes of Silence</h4>
                      <p className="text-secondary text-body-md truncate">Drama / Sci-Fi • 4K • 1h 48m</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                      <span className="text-label-lg font-label-lg text-primary-container">Uploading (84%)</span>
                      <span className="text-secondary text-xs">45 mins ago</span>
                    </div>
                    <button className="text-secondary hover:text-white">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Performance Card */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm">Performance</h3>
                <span className="material-symbols-outlined text-secondary">equalizer</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-body-md">Streaming Quality</span>
                    <span className="text-green-500 font-bold">Excellent</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[98%]"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-body-md">Server Load</span>
                    <span className="text-on-surface font-bold">{metrics?.cpuLoad || 42}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-container h-full transition-all duration-500" 
                      style={{ width: `${metrics?.cpuLoad || 42}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Content Card */}
            <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-1">Add New Content</h3>
              <p className="text-secondary text-body-md mb-4">Upload movies, trailers or manage schedules.</p>
              <Link href="/products">
                <button className="bg-primary-container text-white px-6 py-2 rounded-full font-label-lg text-label-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer font-semibold shadow-md shadow-primary-container/20">
                  Upload Now
                </button>
              </Link>
            </div>

          </div>
        </div>

        {/* Recent Registrations (4 columns) */}
        <div className="md:col-span-4 glass-panel rounded-xl flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-white/5">
              <h3 className="font-headline-sm text-headline-sm">New Registrations</h3>
            </div>
            <div className="flex-1 p-2 space-y-1">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                      <div className="w-full h-full bg-gradient-to-tr from-primary-container to-on-primary-fixed-variant flex items-center justify-center text-white font-bold text-sm uppercase">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-lg text-label-lg text-on-surface truncate font-semibold">{user.name}</p>
                      <p className="text-xs text-secondary truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] text-secondary font-bold uppercase flex-shrink-0">{user.joinedDate}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUVAmtnMnK4NfNZwVzykt_WGgpbRZxqOIU56NAQe8DnTQv8glIiUO_znpe-qgd9YsqP5wibdCgy6M912wyF73WpZxqjXzOgNak55-fEsawD9k9KBWnQy9BVdj-cp2ttq1iE48VbHfwFg6G0C8sNXNaJf5RZq9ueeQ5-FDCQMxxZHiwCf7BrrD7E2LQo4tXh0bK3FtcWfLjAM6tC_8d2NT-2fAzsIrjCNUhiiO_JEc-CkfbDl7TP2666wzqewad0ai6_C06r0aQams"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-lg text-label-lg text-on-surface truncate font-semibold">John Doe</p>
                      <p className="text-xs text-secondary truncate">j.doe@example.com</p>
                    </div>
                    <span className="text-[10px] text-secondary font-bold uppercase flex-shrink-0">5m ago</span>
                  </div>
                  <div className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXA0K6hGprGyDJIq0wcqsPwrMceYx_GInCEnyRRZmKXY3-5QT_AoBbaq4vFQvTQXKfbRR3rX70_FbQ1OfjtMCp1RJb_N8QPuE4HPnprvSsXg_F1vVe3PE8CNEr2meyz9ZCqlRjipKC4O5vcMH9XQP_fDOFhNWwPfGk3DfuOaBOc5Ch9gUjL4vQGPm8_CKzSzEcjsYrlGifZ2THqh1OQTpOK1wL2H0f-58AF0rfx6awWwLJBsemctTThGb3E3ZNC-31n6ZiGePC2AI"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-lg text-label-lg text-on-surface truncate font-semibold">Sarah Parker</p>
                      <p className="text-xs text-secondary truncate">s.parker@cinema.tv</p>
                    </div>
                    <span className="text-[10px] text-secondary font-bold uppercase flex-shrink-0">12m ago</span>
                  </div>
                  <div className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTTidZHHTl9CHDOb-GPTiOWyVFAwzi068yKxpShA3Iz_keT4wwdwT8KNdJPsQnHfNQQE6qtBg1DQrsvNmHlUpRE6oPYqw40pxm7SGrJuUh5YJhoE-dTsN5ahBDKZas12-dkotMmhW7pgrojBKCDvJ5p5EjE4Sj8v7Y_KKXM5S9_6l26YJ3sdW9gRzNGmEvNODf8hP_p4Teoi8Zi4KQq2e1oN6VruWal3absCnSS3ywNvZDcV-hHYIFXm41fXVxGy73Bk-SjSXi3Hw"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-lg text-label-lg text-on-surface truncate font-semibold">Mike Ross</p>
                      <p className="text-xs text-secondary truncate">mike.r@stream.com</p>
                    </div>
                    <span className="text-[10px] text-secondary font-bold uppercase flex-shrink-0">24m ago</span>
                  </div>
                  <div className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI-j8CmiNo6hHux0UITIEFXSj7glk0h5nBaXGT1Lkq6AYLPcm0bsfwk0KycDH3LTDQmkmMb4hJNgHltBVWFq_pZhExAph1qYdAIa-ts4p3fRbeIB1P5Jffi8e62Vw45QIt9_AlOjnmhz-NXXpEtEGALnwut_iOr1tLHiSlnhDOfotIQ9HF8Zt5f_YhsC-CXUuOknzVUkYZM7OjvYYvFCVmiD3jrM6gcpQvU8nuX25Hs9xg9HR097XTZvgsy1z2Dsi0pL7tYwbkmqM"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-lg text-label-lg text-on-surface truncate font-semibold">Elena L.</p>
                      <p className="text-xs text-secondary truncate">e.l@media.net</p>
                    </div>
                    <span className="text-[10px] text-secondary font-bold uppercase flex-shrink-0">1h ago</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-white/5">
            <Link 
              href="/users"
              className="block w-full py-2 text-center text-label-lg font-label-lg text-secondary hover:text-white transition-colors cursor-pointer"
            >
              Manage All Users
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
