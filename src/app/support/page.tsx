'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Support() {
  const tickets = [
    { id: '#TK-254', title: 'Lỗi thanh toán ngân hàng qua cổng VNPAY', status: 'Đang xử lý', priority: 'Cao', user: 'Hoàng Long' },
    { id: '#TK-253', title: 'Yêu cầu xuất hóa đơn đỏ cho doanh nghiệp', status: 'Mở', priority: 'Trung bình', user: 'Minh Tuấn' },
    { id: '#TK-252', title: 'Không kích hoạt được gói VIP Premium', status: 'Đã đóng', priority: 'Cao', user: 'Vũ Thị Ngọc' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Trung Tâm Hỗ Trợ</h1>
        <p className="text-secondary text-body-md">Tiếp nhận, xử lý phản hồi và giải đáp các thắc mắc từ khách hàng.</p>
      </div>

      <Card className="glass-panel border-none shadow-none">
        <CardHeader className="border-b border-[var(--border-color)] flex flex-row items-center gap-2 space-y-0" style={{ padding: '24px 24px 16px 24px' }}>
          <MessageSquare size={20} className="text-primary" />
          <CardTitle className="font-headline-sm text-headline-sm">Phiếu Hỗ Trợ Đang Xử Lý</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto" style={{ padding: '0px' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Mã Phiếu</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Tiêu Đề</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Khách Hàng</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Độ Ưu Tiên</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {tickets.map((t, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="font-semibold text-secondary" style={{ padding: '18px 24px' }}>{t.id}</td>
                  <td className="font-medium text-on-surface" style={{ padding: '18px 24px' }}>{t.title}</td>
                  <td className="text-on-surface" style={{ padding: '18px 24px' }}>{t.user}</td>
                  <td style={{ padding: '18px 24px' }}>
                    <span className={`font-semibold 
                      ${t.priority === 'Cao' ? 'text-red-600 dark:text-red-400' : 'text-secondary'}
                    `}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${t.status === 'Đã đóng' 
                        ? 'bg-[var(--bg-hover)] text-secondary' 
                        : t.status === 'Mở' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      }
                    `}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
