'use client';

import React from 'react';
import { HelpCircle, MessageSquare, AlertCircle } from 'lucide-react';
import styles from '../analytics/page.module.css'; // Re-use general card styles

export default function Support() {
  const tickets = [
    { id: '#TK-254', title: 'Lỗi thanh toán ngân hàng qua cổng VNPAY', status: 'Đang xử lý', priority: 'Cao', user: 'Hoàng Long' },
    { id: '#TK-253', title: 'Yêu cầu xuất hóa đơn đỏ cho doanh nghiệp', status: 'Mở', priority: 'Trung bình', user: 'Minh Tuấn' },
    { id: '#TK-252', title: 'Không kích hoạt được gói VIP Premium', status: 'Đã đóng', priority: 'Cao', user: 'Vũ Thị Ngọc' },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleGroup}>
        <h1>Trung Tâm Hỗ Trợ</h1>
        <p>Tiếp nhận, xử lý phản hồi và giải đáp các thắc mắc từ khách hàng.</p>
      </div>

      <div className={styles.analyticsGrid} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
            <h2 className={styles.cardTitle}>Phiếu Hỗ Trợ Đang Xử Lý</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Mã Phiếu</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Tiêu Đề</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Khách Hàng</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Độ Ưu Tiên</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.id}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 500 }}>{t.title}</td>
                    <td style={{ padding: '16px 12px' }}>{t.user}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ 
                        color: t.priority === 'Cao' ? 'var(--danger)' : 'var(--text-secondary)',
                        fontWeight: t.priority === 'Cao' ? 600 : 500
                      }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ 
                        backgroundColor: t.status === 'Đã đóng' ? 'var(--bg-primary)' : t.status === 'Mở' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: t.status === 'Đã đóng' ? 'var(--text-muted)' : t.status === 'Mở' ? '#3b82f6' : 'var(--warning)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {t.status}
                      </span>
                    </td>
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
