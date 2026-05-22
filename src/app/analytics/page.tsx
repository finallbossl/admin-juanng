'use client';

import React from 'react';
import { BarChart3, TrendingUp, Cpu, Server, Globe } from 'lucide-react';
import styles from './page.module.css';

export default function Analytics() {
  const performanceStats = [
    { name: 'Thời gian phản hồi API (trung bình)', value: 124, unit: 'ms', percent: 85, color: 'var(--accent)' },
    { name: 'Tải CPU máy chủ', value: 42, unit: '%', percent: 42, color: '#f59e0b' },
    { name: 'Sử dụng bộ nhớ RAM', value: 68, unit: '%', percent: 68, color: '#3b82f6' },
    { name: 'Băng thông sử dụng', value: 72, unit: 'TB', percent: 72, color: '#ef4444' },
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

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleGroup}>
        <h1>Phân Tích Hệ Thống</h1>
        <p>Báo cáo hiệu năng và thông số kỹ thuật chi tiết của hệ thống máy chủ và lưu lượng truy cập.</p>
      </div>

      <div className={styles.analyticsGrid}>
        {/* Performance metrics */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Cpu size={20} style={{ color: 'var(--accent)' }} />
            <h2 className={styles.cardTitle}>Hiệu Năng Máy Chủ</h2>
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
              <span className={styles.statValue}>15 ngày 4 giờ 22 phút</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Phiên bản node</span>
              <span className={styles.statValue}>v20.11.0</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Phiên bản Next.js</span>
              <span className={styles.statValue}>16.2.6</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Môi trường triển khai</span>
              <span className={styles.statValue}>Production (Vercel)</span>
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
