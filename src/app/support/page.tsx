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
        <CardHeader className="p-6! pb-4! border-b border-[var(--border-color)] flex flex-row items-center gap-2 space-y-0">
          <MessageSquare size={20} className="text-primary" />
          <CardTitle className="font-headline-sm text-headline-sm">Phiếu Hỗ Trợ Đang Xử Lý</CardTitle>
        </CardHeader>

        <CardContent className="p-0! overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="p-4 text-secondary font-semibold">Mã Phiếu</th>
                <th className="p-4 text-secondary font-semibold">Tiêu Đề</th>
                <th className="p-4 text-secondary font-semibold">Khách Hàng</th>
                <th className="p-4 text-secondary font-semibold">Độ Ưu Tiên</th>
                <th className="p-4 text-secondary font-semibold">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {tickets.map((t, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-4 font-semibold text-secondary">{t.id}</td>
                  <td className="p-4 font-medium text-on-surface">{t.title}</td>
                  <td className="p-4 text-on-surface">{t.user}</td>
                  <td className="p-4">
                    <span className={`font-semibold 
                      ${t.priority === 'Cao' ? 'text-red-400' : 'text-secondary'}
                    `}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${t.status === 'Đã đóng' 
                        ? 'bg-[var(--bg-hover)] text-secondary' 
                        : t.status === 'Mở' 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : 'bg-yellow-500/10 text-yellow-400'
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
