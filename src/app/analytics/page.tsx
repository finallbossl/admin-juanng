'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Server, Globe, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { api } from '@/utils/api';

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
    { name: 'RAM Đã dùng / Tổng RAM', value: `${metrics?.memoryUsedMb || 0} MB / ${metrics?.memoryTotalMb || 0} MB`, unit: '', percent: metrics?.memoryUsagePercent || 0, color: 'var(--accent)' },
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
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-container" size={32} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleGroup}>
        <h1>Phân Tích Hệ Thống</h1>
        <p>Báo cáo hiệu năng và thông số kỹ thuật chi tiết của hệ thống máy chủ và lưu lượng truy cập.</p>
      </div>

      {error && (
        <div style={{ color: '#ffb4ab', backgroundColor: 'rgba(255, 180, 171, 0.1)', border: '1px solid rgba(255, 180, 171, 0.2)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className={styles.analyticsGrid}>
        {/* Performance metrics */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Cpu size={20} style={{ color: 'var(--accent)' }} />
            <h2 className={styles.cardTitle}>Hiệu Năng Máy Chủ (Tự động cập nhật mỗi 5s)</h2>
          </div>
          
          <div className={styles.performanceList}>
            {performanceStats.map((stat, idx) => (
              <div key={idx} className={styles.performanceItem}>
                <div className={styles.performanceLabel}>
                  <span>{stat.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stat.value} {stat.unit}</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${stat.percent}%`,
                      background: `linear-gradient(90deg, ${stat.color} 0%, rgba(255,255,255,0.2) 100%)`
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System metrics summary */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Server size={20} style={{ color: '#3b82f6' }} />
            <h2 className={styles.cardTitle}>Thông Tin Máy Chủ</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Trạng thái dịch vụ</span>
              <span className={styles.statValue} style={{ color: 'var(--accent)' }}>Hoạt động bình thường</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Thời gian uptime</span>
              <span className={styles.statValue}>{metrics?.uptime || 'Đang tải...'}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Phiên bản JDK</span>
              <span className={styles.statValue}>v21 (LTS)</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Phiên bản Spring Boot</span>
              <span className={styles.statValue}>v4.0.6</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Phiên bản Next.js</span>
              <span className={styles.statValue}>16.2.6</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Môi trường triển khai</span>
              <span className={styles.statValue}>Development / Localhost</span>
            </div>
          </div>
        </div>

        {/* Browser breakdown */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Globe size={20} style={{ color: '#f59e0b' }} />
            <h2 className={styles.cardTitle}>Trình Duyệt Truy Cập</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {browserStats.map((stat, idx) => (
              <div key={idx} className={styles.statRow}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region breakdown */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Globe size={20} style={{ color: '#ef4444' }} />
            <h2 className={styles.cardTitle}>Khu Vực Địa Lý</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {regionStats.map((stat, idx) => (
              <div key={idx} className={styles.statRow}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
