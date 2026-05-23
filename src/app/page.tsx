'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { Loader2 } from 'lucide-react';

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
        .slice(0, 5)
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
        .slice(0, 4)
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

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-container" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header (Mobile Only) */}
      <div className="md:hidden mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Hello, Admin</h1>
        <p className="text-secondary text-body-md">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Statistical Cards (4 columns each) */}
        {/* Card 1: TOTAL MOVIES */}
        <div className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">TOTAL MOVIES</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics?.totalMovies || 0}</h3>
            </div>
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined">movie</span>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-green-500 font-bold text-sm flex items-center gap-1">
              Hệ thống phim trực tuyến
            </span>
          </div>
        </div>

        {/* Card 2: CPU LOAD */}
        <div className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">CPU LOAD</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics?.cpuLoad || 0}%</h3>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined">memory</span>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-green-500 font-bold text-sm flex items-center gap-1">
              Trạng thái CPU máy chủ
            </span>
          </div>
        </div>

        {/* Card 3: TOTAL USERS */}
        <div className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">TOTAL USERS</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics?.totalUsers || 0}</h3>
            </div>
            <div className="p-2 rounded-lg bg-tertiary-container/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">person_add</span>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-tertiary font-bold text-sm flex items-center gap-1">
              Tài khoản khách hàng
            </span>
          </div>
        </div>

        {/* Recent Activity (8 columns) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* New Uploads Card */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm">New Uploads</h3>
              <Link href="/products" className="text-primary-container text-label-lg font-label-lg hover:underline transition-all cursor-pointer">
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
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <span className="material-symbols-outlined text-white">play_arrow</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">{movie.name}</h4>
                      <p className="text-secondary text-body-md truncate">{movie.type} • {movie.quality} • {movie.time}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                      <span className="text-label-lg font-label-lg text-green-500">Đã đồng bộ</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-secondary">Không có phim nào mới tải lên.</div>
              )}
            </div>
          </div>

          {/* Secondary Lists / Small Cards */}
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
                    <span className="text-secondary text-body-md">Memory Usage</span>
                    <span className="text-green-500 font-bold">{metrics?.memoryUsagePercent || 0}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics?.memoryUsagePercent || 0}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-body-md">Server Load (CPU)</span>
                    <span className="text-on-surface font-bold">{metrics?.cpuLoad || 0}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: `${metrics?.cpuLoad || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Crawl Card */}
            <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">download</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-1">Crawl Movies</h3>
              <p className="text-secondary text-body-md mb-4">Đồng bộ danh sách phim từ nguồn phim cấu hình sẵn.</p>
              <Link href="/products">
                <button className="bg-primary-container text-white px-6 py-2 rounded-full font-label-lg text-label-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer font-semibold shadow-md shadow-primary-container/20">
                  Manage Movies
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
            
            <div className="p-2 space-y-1">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0 flex items-center justify-center text-white bg-gradient-to-tr from-primary-container to-on-primary-fixed-variant">
                      <span className="font-bold">{user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-lg text-label-lg text-on-surface truncate font-semibold">{user.name}</p>
                      <p className="text-xs text-secondary truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] text-secondary font-bold uppercase flex-shrink-0">{user.joinedDate}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-secondary">Chưa có người dùng đăng ký.</div>
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
