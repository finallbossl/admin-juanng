'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '@/utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function Settings() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get<any>('/users/my-info');
        const user = res.result;
        setUsername(user.username || '');
        setEmail(user.email || '');
        setFullName(user.fullName || '');
        setAvatarUrl(user.avatarUrl || '');
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin cá nhân.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(false);
    setError('');
    
    try {
      const res = await api.put<any>('/users/my-info', {
        fullName,
        avatarUrl
      });
      // Save updated user to localStorage
      localStorage.setItem('user', JSON.stringify(res.result));
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật cấu hình cá nhân.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[var(--bg-hover)]" />
          <Skeleton className="h-4 w-96 bg-[var(--bg-hover)]" />
        </div>
        <Card className="glass-panel border-none shadow-none space-y-6" style={{ padding: '24px' }}>
          <div className="space-y-4">
            <Skeleton className="h-5 w-40 bg-[var(--bg-hover)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 bg-[var(--bg-hover)] rounded-md" />
              <Skeleton className="h-10 bg-[var(--bg-hover)] rounded-md" />
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-5 w-40 bg-[var(--bg-hover)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 bg-[var(--bg-hover)] rounded-md" />
              <Skeleton className="h-10 bg-[var(--bg-hover)] rounded-md" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Cấu Hình Tài Khoản Admin</h1>
        <p className="text-secondary text-body-md">Quản lý các thiết lập cá nhân, thông tin hiển thị và cập nhật hồ sơ quản trị viên.</p>
      </div>

      {error && (
        <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card className="glass-panel border-none shadow-none">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6" style={{ padding: '24px' }}>
            <div>
              <h2 className="text-base font-semibold text-on-surface border-b border-[var(--border-color)] pb-2 mb-4">Thông Tin Tài Khoản</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="username" className="text-xs font-semibold text-secondary">Tên Đăng Nhập</label>
                  <Input 
                    type="text" 
                    id="username" 
                    value={username}
                    disabled
                    className="bg-surface border-[var(--border-color)] text-on-surface/60 cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-secondary">Địa Chỉ Email</label>
                  <Input 
                    type="email" 
                    id="email" 
                    value={email}
                    disabled
                    className="bg-surface border-[var(--border-color)] text-on-surface/60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-on-surface border-b border-[var(--border-color)] pb-2 mb-4">Thông Tin Cá Nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-semibold text-secondary">Họ và Tên</label>
                  <Input 
                    type="text" 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên hiển thị..."
                    required
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="avatarUrl" className="text-xs font-semibold text-secondary">Đường Dẫn Ảnh Đại Diện</label>
                  <Input 
                    type="url" 
                    id="avatarUrl" 
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-4 border-t border-[var(--border-color)]">
              {isSaved && (
                <span className="text-green-500 text-sm font-medium mr-2">
                  ✓ Đã lưu cấu hình thành công!
                </span>
              )}
              <Button 
                type="button" 
                variant="outline"
                className="border-[var(--border-color)] text-secondary hover:bg-[var(--bg-hover)] hover:text-on-surface cursor-pointer"
                onClick={() => window.location.reload()}
              >
                Hủy thay đổi
              </Button>
              <Button 
                type="submit" 
                className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-semibold shadow-md shadow-primary-container/20"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu Thiết Lập
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
