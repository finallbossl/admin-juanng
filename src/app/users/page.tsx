'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check
} from 'lucide-react';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('User');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'inactive'>('active');

  const mapBackendUserToFrontend = (bu: any): User => {
    const roles: string[] = bu.roles || [];
    let role = 'User';
    if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) {
      role = 'Super Admin';
    } else if (roles.includes('EDITOR') || roles.includes('ROLE_EDITOR')) {
      role = 'Editor';
    }

    const isActive = bu.active ?? bu.isActive ?? true;

    return {
      id: bu.id,
      name: bu.fullName || bu.username,
      email: bu.email,
      role: role,
      status: isActive ? 'active' : 'inactive',
      joinedDate: bu.createdAt ? new Date(bu.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ',
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any[]>('/users');
      const mapped = (res.result || []).map(mapBackendUserToFrontend);
      setUsers(mapped);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    setError('');
    try {
      const username = newUserEmail.split('@')[0] + Math.floor(Math.random() * 100);
      await api.post('/auth/register', {
        username,
        email: newUserEmail,
        password: 'Password123!',
        fullName: newUserName
      });

      await fetchUsers();
      setIsModalOpen(false);

      // Reset Form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('User');
      setNewUserStatus('active');
    } catch (err: any) {
      setError(err.message || 'Không thể tạo tài khoản mới.');
    }
  };

  const handleToggleStatus = async (id: string | number, currentStatus: 'active' | 'inactive') => {
    const newActive = currentStatus === 'inactive';
    const confirmMsg = newActive 
      ? 'Bạn có chắc chắn muốn mở khóa tài khoản này?' 
      : 'Bạn có chắc chắn muốn tạm khóa tài khoản này?';

    if (confirm(confirmMsg)) {
      try {
        await api.put(`/users/${id}/status?isActive=${newActive}`);
        setUsers(users.map(u => u.id === id ? { ...u, status: newActive ? 'active' : 'inactive' } : u));
      } catch (err: any) {
        alert(err.message || 'Không thể cập nhật trạng thái người dùng.');
      }
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-[var(--bg-hover)]" />
            <Skeleton className="h-4 w-96 bg-[var(--bg-hover)]" />
          </div>
          <Skeleton className="h-10 w-36 bg-[var(--bg-hover)] rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Skeleton className="h-10 w-80 bg-[var(--bg-hover)] rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-36 bg-[var(--bg-hover)] rounded-md" />
            <Skeleton className="h-10 w-36 bg-[var(--bg-hover)] rounded-md" />
          </div>
        </div>
        <Card className="glass-panel border-none shadow-none space-y-4" style={{ padding: '24px' }}>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                <div className="flex gap-3 items-center flex-1">
                  <Skeleton className="h-10 w-10 bg-[var(--bg-hover)] rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4 bg-[var(--bg-hover)]" />
                    <Skeleton className="h-3 w-1/3 bg-[var(--bg-hover)]" />
                  </div>
                </div>
                <div className="flex gap-16 items-center">
                  <Skeleton className="h-6 w-20 bg-[var(--bg-hover)] rounded-full" />
                  <Skeleton className="h-4 w-24 bg-[var(--bg-hover)]" />
                  <Skeleton className="h-6 w-16 bg-[var(--bg-hover)] rounded-full" />
                  <Skeleton className="h-8 w-16 bg-[var(--bg-hover)]" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: '24px' }}>
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản Lý Tài Khoản</h1>
          <p className="text-secondary text-body-md">Hiển thị danh sách người dùng toàn hệ thống và phân quyền truy cập.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-semibold shadow-md shadow-primary-container/20"
        >
          <Plus size={18} className="mr-1.5" />
          Thêm Tài Khoản
        </Button>
      </div>

      {error && (
        <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 max-w-sm w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '42px', paddingRight: '16px', height: '40px' }}
            className="bg-surface-container text-on-surface border-none rounded-full text-body-md focus-visible:ring-2 focus-visible:ring-primary-container w-full transition-all focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-surface-container text-on-surface border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
          >
            <option value="All">Tất cả Vai trò</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Editor">Editor</option>
            <option value="User">User</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container text-on-surface border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
          >
            <option value="All">Tất cả Trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <Card className="glass-panel border-none shadow-none">
        <CardContent className="overflow-x-auto" style={{ padding: '0px' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Họ Tên</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Vai Trò</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Ngày Tham Gia</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Trạng Thái</th>
                <th className="text-secondary font-semibold text-right" style={{ padding: '18px 24px' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td style={{ padding: '18px 24px' }}>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-[var(--border-color)] flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-tr from-primary-container to-on-primary-fixed-variant text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-on-surface truncate">{user.name}</span>
                          <span className="text-xs text-secondary truncate">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold 
                        ${user.role === 'Super Admin' 
                          ? 'bg-primary-container/20 text-primary-container' 
                          : 'bg-[var(--bg-hover)] text-secondary'
                        }
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-secondary" style={{ padding: '18px 24px' }}>{user.joinedDate}</td>
                    <td style={{ padding: '18px 24px' }}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full 
                          ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
                        `} />
                        <span className="text-xs text-secondary">
                          {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </div>
                    </td>
                    <td className="text-right" style={{ padding: '18px 24px' }}>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-secondary hover:text-on-surface cursor-pointer h-8 w-8 hover:bg-[var(--bg-hover)]" 
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`cursor-pointer h-8 w-8 hover:bg-[var(--bg-hover)]
                            ${user.status === 'active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
                          `}
                          title={user.status === 'active' ? 'Tạm khóa' : 'Mở khóa'}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-secondary" style={{ padding: '32px' }}>
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create User Side Sheet */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent className="glass-panel border-[var(--border-color)] text-on-background sm:max-w-md">
          <SheetHeader className="border-b border-[var(--border-color)] pb-4 mb-4">
            <SheetTitle className="font-headline-sm text-headline-sm text-on-surface">Thêm Tài Khoản Mới</SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-secondary">Họ và Tên</label>
              <Input 
                type="text" 
                id="fullName" 
                placeholder="Nhập họ và tên..."
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
                className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-secondary">Email</label>
              <Input 
                type="email" 
                id="email" 
                placeholder="Nhập email..."
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="role" className="text-xs font-semibold text-secondary">Vai Trò</label>
              <select 
                id="role" 
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full bg-surface-container text-on-surface border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
              >
                <option value="User">User</option>
                <option value="Editor">Editor</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-semibold text-secondary">Trạng Thái</label>
              <select 
                id="status" 
                value={newUserStatus}
                onChange={(e) => setNewUserStatus(e.target.value as 'active' | 'inactive')}
                className="w-full bg-surface-container text-on-surface border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
              <Button 
                type="button" 
                variant="outline" 
                className="border-[var(--border-color)] text-secondary hover:bg-[var(--bg-hover)] hover:text-on-surface cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-semibold shadow-md shadow-primary-container/20"
              >
                Lưu Lại
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
