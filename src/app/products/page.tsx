'use client';

import React from 'react';
import { ShoppingBag, Star, Package, ArrowUpRight } from 'lucide-react';
import styles from '../analytics/page.module.css'; // Re-use general card styles

export default function Products() {
  const products = [
    { name: 'Khóa học React Premium', category: 'Giáo dục', price: '1,500,000 ₫', sales: 340, revenue: '510,000,000 ₫' },
    { name: 'Template Next.js SaaS', category: 'Thiết kế', price: '790,000 ₫', sales: 185, revenue: '146,150,000 ₫' },
    { name: 'UI Kit Figma AdminPro', category: 'Tài nguyên', price: '450,000 ₫', sales: 520, revenue: '234,000,000 ₫' },
    { name: 'Plugin Tối Ưu Tốc Độ', category: 'Lập trình', price: '1,200,000 ₫', sales: 98, revenue: '117,600,000 ₫' },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleGroup}>
        <h1>Quản Lý Sản Phẩm</h1>
        <p>Danh sách sản phẩm dịch vụ số đang kinh doanh và doanh thu chi tiết từng mục.</p>
      </div>

      <div className={styles.analyticsGrid} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <ShoppingBag size={20} style={{ color: 'var(--accent)' }} />
            <h2 className={styles.cardTitle}>Danh Sách Sản Phẩm</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Tên Sản Phẩm</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Danh Mục</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Đơn Giá</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Đã Bán</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>{prod.name}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{prod.category}</td>
                    <td style={{ padding: '16px 12px' }}>{prod.price}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{prod.sales}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--accent)' }}>{prod.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
