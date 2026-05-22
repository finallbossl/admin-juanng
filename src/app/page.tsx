'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Percent, 
  ShoppingBag,
  Eye,
  MoreVertical,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import styles from './page.module.css';

// Mock data for weekly revenue chart
const chartData = [
  { day: 'Thứ 2', value: 35, display: '35M ₫' },
  { day: 'Thứ 3', value: 48, display: '48M ₫' },
  { day: 'Thứ 4', value: 40, display: '40M ₫' },
  { day: 'Thứ 5', value: 65, display: '65M ₫' },
  { day: 'Thứ 6', value: 58, display: '58M ₫' },
  { day: 'Thứ 7', value: 85, display: '85M ₫' },
  { day: 'Chủ Nhật', value: 72, display: '72M ₫' },
];

// Donut data
const trafficSources = [
  { source: 'Tìm kiếm', percentage: 40, color: '#10b981', value: '40%' },
  { source: 'Trực tiếp', percentage: 30, color: '#3b82f6', value: '30%' },
  { source: 'Mạng xã hội', percentage: 20, color: '#f59e0b', value: '20%' },
  { source: 'Khác', percentage: 10, color: '#ef4444', value: '10%' },
];

// Recent registrations/transactions
const transactions = [
  { id: '#1254', name: 'Nguyễn Văn Anh', email: 'anh.nv@gmail.com', amount: '1,200,000 ₫', status: 'Thành công', date: 'Hôm nay, 14:23', type: 'success' },
  { id: '#1253', name: 'Trần Thị Bình', email: 'binh.tt@yahoo.com', amount: '450,000 ₫', status: 'Chờ duyệt', date: 'Hôm nay, 11:05', type: 'pending' },
  { id: '#1252', name: 'Lê Hoàng Long', email: 'long.lh@hotmail.com', amount: '3,100,000 ₫', status: 'Thành công', date: 'Hôm qua, 18:40', type: 'success' },
  { id: '#1251', name: 'Phạm Minh Tuấn', email: 'tuan.pm@outlook.com', amount: '890,000 ₫', status: 'Thất bại', date: 'Hôm qua, 15:12', type: 'danger' },
  { id: '#1250', name: 'Vũ Thị Ngọc', email: 'ngoc.vt@gmail.com', amount: '2,500,000 ₫', status: 'Thành công', date: '20/05/2026', type: 'success' },
];

export default function Dashboard() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  // SVG dimensions & mapping helper
  const svgWidth = 550;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate SVG coordinates for line chart points
  const points = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - paddingX * 2);
    // Value range 0 - 100 mapped to height
    const y = svgHeight - paddingY - (d.value / 100) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Construct path string
  const pathString = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Construct area path string (needs to close the loop at the bottom)
  const areaString = points.length > 0 
    ? `${pathString} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z` 
    : '';

  // Donut chart calculations
  let accumulatedPercent = 0;

  return (
    <div className={styles.pageContainer}>
      {/* Welcome banner */}
      <div className={styles.welcomeSection}>
        <div className={styles.titleGroup}>
          <h1>Tổng Quan Hệ Thống</h1>
          <p>Chào mừng trở lại! Dưới đây là thống kê hoạt động mới nhất của dự án.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button className={styles.datePicker}>
            <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            21 Tháng 5, 2026
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className={styles.statGrid}>
        {/* Metric 1 */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Doanh Thu Tuần</span>
            <div className={styles.statIconWrapper}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={styles.statValue}>430M ₫</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>
              <TrendingUp size={14} style={{ marginRight: '2px' }} />
              +12.5%
            </span>
            <span className={styles.trendLabel}>so với tuần trước</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Người Dùng Mới</span>
            <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statValue}>2,850</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>
              <TrendingUp size={14} style={{ marginRight: '2px' }} />
              +8.2%
            </span>
            <span className={styles.trendLabel}>so với tuần trước</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Tỷ Lệ Chuyển Đổi</span>
            <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
              <Percent size={20} />
            </div>
          </div>
          <div className={styles.statValue}>3.24%</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>
              <TrendingUp size={14} style={{ marginRight: '2px' }} />
              +2.4%
            </span>
            <span className={styles.trendLabel}>đạt mục tiêu tháng</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Giao Dịch Thành Công</span>
            <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent)' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className={styles.statValue}>1,240</div>
          <div className={styles.statFooter}>
            <span className={styles.trendDown}>
              <TrendingDown size={14} style={{ marginRight: '2px' }} />
              -1.5%
            </span>
            <span className={styles.trendLabel}>giảm nhẹ giữa tuần</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        {/* Main Analytics Line Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Biểu Đồ Doanh Thu</h2>
            <div className={styles.chartTabs}>
              <button 
                onClick={() => setActiveTab('weekly')}
                className={`${styles.chartTab} ${activeTab === 'weekly' ? styles.chartTabActive : ''}`}
              >
                Tuần này
              </button>
              <button 
                onClick={() => setActiveTab('monthly')}
                className={`${styles.chartTab} ${activeTab === 'monthly' ? styles.chartTabActive : ''}`}
              >
                Tháng này
              </button>
            </div>
          </div>

          <div className={styles.chartBody}>
            <svg className={styles.svgChart} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[25, 50, 75, 100].map((val) => {
                const y = svgHeight - paddingY - (val / 100) * (svgHeight - paddingY * 2);
                return (
                  <g key={val}>
                    <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} className={styles.gridLine} />
                    <text x={10} y={y + 4} className={styles.gridText}>{val}M</text>
                  </g>
                );
              })}

              {/* Weekly Area */}
              <path d={areaString} className={styles.chartArea} />

              {/* Weekly Line */}
              <path d={pathString} className={styles.chartPath} />

              {/* Grid labels */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <text x={p.x} y={svgHeight - 4} textAnchor="middle" className={styles.gridText}>
                    {p.day}
                  </text>
                  
                  {/* Interactive Dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint === idx ? 6 : 4}
                    className={styles.chartDot}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Premium Chart Tooltip */}
            {hoveredPoint !== null && (
              <div 
                className="custom-chart-tooltip"
                style={{
                  position: 'absolute',
                  left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredPoint].y / svgHeight) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                  zIndex: 10,
                  transition: 'all 0.1s ease',
                  borderLeft: '3px solid var(--accent)'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{points[hoveredPoint].day}</div>
                <div style={{ color: 'var(--accent)', marginTop: '2px', fontWeight: 700 }}>{points[hoveredPoint].display}</div>
              </div>
            )}
          </div>
        </div>

        {/* Traffic Source Donut Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Nguồn Truy Cập</h2>
            <button className={styles.actionBtn}>
              <MoreVertical size={16} />
            </button>
          </div>

          <div className={styles.chartBody}>
            <div className={styles.donutContainer}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className={styles.donutSvg}>
                  {trafficSources.map((source, index) => {
                    const radius = 70;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (source.percentage / 100) * circumference;
                    const rotation = (accumulatedPercent / 100) * circumference;
                    accumulatedPercent += source.percentage;

                    return (
                      <circle
                        key={index}
                        cx="90"
                        cy="90"
                        r={radius}
                        className={styles.donutSegment}
                        stroke={source.color}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transform: `rotate(${(rotation / circumference) * 360}deg)`,
                          transformOrigin: '90px 90px',
                        }}
                      />
                    );
                  })}
                </svg>
                <div className={styles.donutCenter}>
                  <span className={styles.donutCenterValue}>18.4K</span>
                  <span className={styles.donutCenterLabel}>Lượt truy cập</span>
                </div>
              </div>

              {/* Legends */}
              <div className={styles.donutLegends}>
                {trafficSources.map((item, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ backgroundColor: item.color }} />
                    <span style={{ flex: 1 }}>{item.source}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className={styles.tableCard}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>Giao Dịch Gần Đây</h2>
          <button className={styles.actionBtn} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Xem tất cả
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Mã Đơn</th>
                <th className={styles.th}>Khách Hàng</th>
                <th className={styles.th}>Số Tiền</th>
                <th className={styles.th}>Thời Gian</th>
                <th className={styles.th}>Trạng Thái</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tr, idx) => (
                <tr key={idx} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{tr.id}</td>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {tr.name.charAt(0)}
                      </div>
                      <div className={styles.userNameGroup}>
                        <span style={{ fontWeight: 600 }}>{tr.name}</span>
                        <span className={styles.userEmail}>{tr.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td} style={{ fontWeight: 600 }}>{tr.amount}</td>
                  <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>{tr.date}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${
                      tr.type === 'success' ? styles.badgeSuccess : 
                      tr.type === 'pending' ? styles.badgePending : 
                      styles.badgeDanger
                    }`}>
                      {tr.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button className={styles.actionBtn}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
