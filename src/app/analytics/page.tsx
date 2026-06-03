'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Server, Globe } from 'lucide-react';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemMetrics {
  totalMovies: number;
  totalUsers: number;
  cpuLoad: number;
  memoryUsagePercent: number;
  memoryTotalMb: number;
  memoryUsedMb: number;
  uptime: string;
}

export default function Analytics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get<SystemMetrics>('/system/metrics');
      setMetrics(res.result);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông số phân tích.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(true);
    
    // Auto-update metrics every 5 seconds
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const performanceStats = [
    { name: 'Tải CPU máy chủ', value: metrics?.cpuLoad || 0, unit: '%', percent: metrics?.cpuLoad || 0, color: '#f59e0b' },
    { name: 'Sử dụng bộ nhớ RAM', value: metrics?.memoryUsagePercent || 0, unit: '%', percent: metrics?.memoryUsagePercent || 0, color: '#3b82f6' },
    { name: 'RAM Đã dùng / Tổng RAM', value: `${metrics?.memoryUsedMb || 0} MB / ${metrics?.memoryTotalMb || 0} MB`, unit: '', percent: metrics?.memoryUsagePercent || 0, color: '#e50914' },
  ];

  const browserStats = [
    { label: 'Google Chrome', value: '62.4%' },
    { label: 'Safari', value: '18.1%' },
    { label: 'Firefox', value: '8.5%' },
    { label: 'Edge', value: '6.2%' },
    { label: 'Khác', value: '4.8%' },
  ];

  const regionStats = [
    { label: 'Việt Nam', value: '75.2%' },
    { label: 'Hoa Kỳ', value: '10.5%' },
    { label: 'Nhật Bản', value: '5.3%' },
    { label: 'Hàn Quốc', value: '4.1%' },
    { label: 'Khác', value: '4.9%' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[var(--bg-hover)]" />
          <Skeleton className="h-4 w-96 bg-[var(--bg-hover)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-panel border-none shadow-none p-6! space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 bg-[var(--bg-hover)] rounded-full" />
                <Skeleton className="h-5 w-40 bg-[var(--bg-hover)]" />
              </div>
              <div className="space-y-4 pt-4">
                <Skeleton className="h-10 bg-[var(--bg-hover)] rounded-md" />
                <Skeleton className="h-10 bg-[var(--bg-hover)] rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Phân Tích Hệ Thống</h1>
        <p className="text-secondary text-body-md">Báo cáo hiệu năng và thông số kỹ thuật chi tiết của hệ thống máy chủ và lưu lượng truy cập.</p>
      </div>

      {error && (
        <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance metrics */}
        <Card className="glass-panel border-none shadow-none">
          <CardHeader className="p-6! pb-4! border-b border-[var(--border-color)] flex flex-row items-center gap-2 space-y-0">
            <Cpu size={20} className="text-primary" />
            <CardTitle className="font-headline-sm text-headline-sm">Hiệu Năng Máy Chủ (Tự động cập nhật mỗi 5s)</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6! space-y-5">
            {performanceStats.map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary">{stat.name}</span>
                  <span className="font-semibold text-on-surface">{stat.value} {stat.unit}</span>
                </div>
                <Progress value={stat.percent} className="w-full flex-col gap-0">
                  <ProgressTrack className="bg-[var(--bg-hover)] h-2">
                    <ProgressIndicator 
                      className="transition-all"
                      style={{ backgroundColor: stat.color }}
                    />
                  </ProgressTrack>
                </Progress>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System metrics summary */}
        <Card className="glass-panel border-none shadow-none">
          <CardHeader className="p-6! pb-4! border-b border-[var(--border-color)] flex flex-row items-center gap-2 space-y-0">
            <Server size={20} className="text-blue-400" />
            <CardTitle className="font-headline-sm text-headline-sm">Thông Tin Máy Chủ</CardTitle>
          </CardHeader>

          <CardContent className="p-6! space-y-3.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Trạng thái dịch vụ</span>
              <span className="font-semibold text-primary">Hoạt động bình thường</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Thời gian uptime</span>
              <span className="font-semibold text-on-surface">{metrics?.uptime || 'Đang tải...'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Phiên bản JDK</span>
              <span className="font-semibold text-on-surface">v21 (LTS)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Phiên bản Spring Boot</span>
              <span className="font-semibold text-on-surface">v4.0.6</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Phiên bản Next.js</span>
              <span className="font-semibold text-on-surface">16.2.6</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Môi trường triển khai</span>
              <span className="font-semibold text-on-surface">Development / Localhost</span>
            </div>
          </CardContent>
        </Card>

        {/* Browser breakdown */}
        <Card className="glass-panel border-none shadow-none">
          <CardHeader className="p-6! pb-4! border-b border-[var(--border-color)] flex flex-row items-center gap-2 space-y-0">
            <Globe size={20} className="text-yellow-500" />
            <CardTitle className="font-headline-sm text-headline-sm">Trình Duyệt Truy Cập</CardTitle>
          </CardHeader>

          <CardContent className="p-6! space-y-3.5">
            {browserStats.map((stat, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-secondary">{stat.label}</span>
                <span className="font-semibold text-on-surface">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Region breakdown */}
        <Card className="glass-panel border-none shadow-none">
          <CardHeader className="p-6! pb-4! border-b border-[var(--border-color)] flex flex-row items-center gap-2 space-y-0">
            <Globe size={20} className="text-red-400" />
            <CardTitle className="font-headline-sm text-headline-sm">Khu Vực Địa Lý</CardTitle>
          </CardHeader>

          <CardContent className="p-6! space-y-3.5">
            {regionStats.map((stat, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-secondary">{stat.label}</span>
                <span className="font-semibold text-on-surface">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
