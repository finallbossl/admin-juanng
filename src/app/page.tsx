'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      <div className="space-y-6">
        {/* Welcome Header (Mobile Only) */}
        <div className="md:hidden mb-6">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-4 w-64 bg-white/5 mt-2" />
        </div>

        {/* Statistical Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="md:col-span-4 glass-panel rounded-xl p-6 h-36 flex flex-col justify-between border-none shadow-none">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/5" />
                  <Skeleton className="h-8 w-16 bg-white/5" />
                </div>
                <Skeleton className="h-10 w-10 bg-white/5 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-32 bg-white/5" />
            </Card>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <Card className="glass-panel rounded-xl p-6 space-y-4 border-none shadow-none">
              <Skeleton className="h-6 w-36 bg-white/5" />
              <div className="space-y-4 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="h-20 w-16 bg-white/5 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-white/5" />
                      <Skeleton className="h-3 w-1/4 bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="md:col-span-4">
            <Card className="glass-panel rounded-xl p-6 space-y-4 border-none shadow-none">
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
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header (Mobile Only) */}
      <div className="md:hidden mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Hello, Admin</h1>
        <p className="text-secondary text-body-md">Here's what's happening today.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Statistical Cards (4 columns each) */}
        {/* Card 1: TOTAL MOVIES */}
        <Card className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 border-none shadow-none">
          <CardHeader className="p-0 flex flex-row justify-between items-start mb-4 space-y-0">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">TOTAL MOVIES</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics?.totalMovies || 0}</h3>
            </div>
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined">movie</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex items-end gap-4">
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
          </CardContent>
        </Card>

        {/* Card 2: CPU LOAD */}
        <Card className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 border-none shadow-none">
          <CardHeader className="p-0 flex flex-row justify-between items-start mb-4 space-y-0">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">CPU LOAD</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics?.cpuLoad || 0}%</h3>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined">memory</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex items-end gap-4">
            <span className="text-green-500 font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +8.4%
            </span>
            <svg className="flex-1 h-10 text-green-500 stroke-current fill-none stroke-2" viewBox="0 0 100 30">
              <path d="M0,25 Q15,20 25,22 T50,15 T75,10 T100,5" strokeLinecap="round"></path>
            </svg>
          </CardContent>
        </Card>

        {/* Card 3: TOTAL USERS */}
        <Card className="md:col-span-4 glass-panel rounded-xl p-6 group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 border-none shadow-none">
          <CardHeader className="p-0 flex flex-row justify-between items-start mb-4 space-y-0">
            <div>
              <p className="text-secondary font-label-lg text-label-lg mb-1">TOTAL USERS</p>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">{metrics?.totalUsers || 0}</h3>
            </div>
            <div className="p-2 rounded-lg bg-tertiary-container/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">person_add</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex items-end gap-4">
            <span className="text-tertiary font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +22%
            </span>
            <div className="flex-1 h-10 flex items-center justify-end gap-[-4px]">
              <Avatar className="w-8 h-8 border-2 border-surface bg-surface-variant overflow-hidden flex-shrink-0">
                <AvatarImage alt="U1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7BHk8opuyYPRs0Ytbp6o5XVqxIODL3fcWiGXvnQzskpCiKtEWJhsbLCu9V_YAx8_ZLIVjuqRwszHfrZKnAK0kObtxWZzmpxyoInfl1FmHsXLnHc5HkhACglAsjgKZE8M6QXPOO8XsGjwwlt3Lw6fSLiWIFNWG66Fx5hsJi4fzaUjNN4pBcdS7kCXgjmPRLJrsm-r44xjovkogrcTGF8oJNQpZCSwmc8l0CIL9EZ9mDzVTNcpHVy2tudP3YOPc55E17ISPKizaoLI"/>
                <AvatarFallback>U1</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 border-2 border-surface bg-surface-variant -ml-3 overflow-hidden flex-shrink-0">
                <AvatarImage alt="U2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuYG2Elt7xtQ6meeUbKuBJKFx5VUoODZqRyRRG4sDukit8NjMMtGY6s9eL_jn6BWmgxIY__nnP51Fu2V6XPYzpY8DR964rQg7ojFczeTD2WYpX7Bj93lCS2FYVGWMXjNtAQ5ihgeFzyoX-fn076EQFg2TTEBDQnDQgMhMJEEVypiVL2sPMWy455fXYVgm0o7LFsFaDV-NiYlpc8XCxLEDfNZiXceTvgpj5ow2qcT-nvdMLV4rFBi7XcUbKGYgJniWSOJPhsoPCv7E"/>
                <AvatarFallback>U2</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 border-2 border-surface bg-surface-variant -ml-3 overflow-hidden flex-shrink-0">
                <AvatarImage alt="U3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2TMYMV10HP3wV8yt_bcYpBYI9EUnLg7PkPmvXOQoO_14WWJ_DZnNAYNQOxr68buxlp0HQr3PJCX30QUdn8xwrYhqedJ3ERQwxPHxYWlokCkXHGLthXK8w0kU27oVGnMtQO4jlagaJxgZbyCA5pMTR1J0WuJ-bAB51af_O6Y_cj13IF3UtHmh9F8Sqf4QUJq08tgKW77uutPKBcCvMNhXxB-ZmcLU6F1s8vAVicgMHMJvVAWXCHsnFl65p24J7eVhTdC6aD2WakHI"/>
                <AvatarFallback>U3</AvatarFallback>
              </Avatar>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container -ml-3 flex items-center justify-center text-[10px] font-bold text-white z-10 flex-shrink-0">+1.2k</div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity (8 columns) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* New Uploads Card */}
          <Card className="glass-panel rounded-xl overflow-hidden border-none shadow-none">
            <CardHeader className="p-6 border-b border-white/5 flex flex-row justify-between items-center space-y-0">
              <CardTitle className="font-headline-sm text-headline-sm">New Uploads</CardTitle>
              <Link href="/products" className="text-primary-container text-label-lg font-label-lg hover:underline transition-all cursor-pointer">
                View All
              </Link>
            </CardHeader>
            
            <CardContent className="p-0 divide-y divide-white/5">
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
                      <span className="text-label-lg font-label-lg text-green-500">Processing Complete</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-secondary hover:text-white flex-shrink-0 hover:bg-transparent">
                      <span className="material-symbols-outlined">more_vert</span>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-secondary">Không có phim nào mới tải lên.</div>
              )}
            </CardContent>
          </Card>

          {/* Secondary Lists / Small Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Performance Card */}
            <Card className="glass-panel rounded-xl p-6 border-none shadow-none">
              <CardHeader className="p-0 flex flex-row justify-between items-center mb-6 space-y-0">
                <CardTitle className="font-headline-sm text-headline-sm">Performance</CardTitle>
                <span className="material-symbols-outlined text-secondary">equalizer</span>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-body-md">Streaming Quality</span>
                    <span className="text-green-500 font-bold">Excellent</span>
                  </div>
                  <Progress value={98} className="w-full flex-col gap-0">
                    <ProgressTrack className="bg-white/5 h-2">
                      <ProgressIndicator className="bg-green-500" />
                    </ProgressTrack>
                  </Progress>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-body-md">Server Load (CPU)</span>
                    <span className="text-on-surface font-bold">{metrics?.cpuLoad || 0}%</span>
                  </div>
                  <Progress value={metrics?.cpuLoad || 0} className="w-full flex-col gap-0">
                    <ProgressTrack className="bg-white/5 h-2">
                      <ProgressIndicator className="bg-primary-container" />
                    </ProgressTrack>
                  </Progress>
                </div>
              </CardContent>
            </Card>

            {/* Add New Content Card */}
            <Card className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 border-none shadow-none">
              <CardContent className="p-0 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm mb-1">Add New Content</h3>
                <p className="text-secondary text-body-md mb-4">Upload movies, trailers or manage schedules.</p>
                <Link href="/products" className="w-full">
                  <Button className="w-full bg-primary-container text-white px-6 py-2 rounded-full font-label-lg text-label-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer font-semibold shadow-md shadow-primary-container/20 border-none h-auto">
                    Upload Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>

        </div>

        {/* Recent Registrations (4 columns) */}
        <Card className="md:col-span-4 glass-panel rounded-xl flex flex-col justify-between border-none shadow-none">
          <div>
            <CardHeader className="p-6 border-b border-white/5">
              <CardTitle className="font-headline-sm text-headline-sm">New Registrations</CardTitle>
            </CardHeader>
            
            <CardContent className="p-2 space-y-1">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <Avatar className="w-10 h-10 border border-white/10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-tr from-primary-container to-on-primary-fixed-variant text-white font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
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
            </CardContent>
          </div>
          
          <CardFooter className="p-4 border-t border-white/5">
            <Link 
              href="/users"
              className="block w-full py-2 text-center text-label-lg font-label-lg text-secondary hover:text-white transition-colors cursor-pointer"
            >
              Manage All Users
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
