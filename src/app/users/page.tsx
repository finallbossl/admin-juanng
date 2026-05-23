'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ShieldCheck,
  Check,
  Loader2
} from 'lucide-react';
import styles from './page.module.css';
import { api } from '@/utils/api';

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

  return (
    <div className={styles.pageContainer}>
      {/* Title section */}
      <div className={styles.headerSection}>
        <div className={styles.titleGroup}>
          <h1>Quản Lý Tài Khoản</h1>
          <p>Hiển thị danh sách người dùng toàn hệ thống và phân quyền truy cập.</p>
        </div>
        <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Thêm Tài Khoản
        </button>
      </div>

      {error && (
        <div style={{ color: '#ffb4ab', backgroundColor: 'rgba(255, 180, 171, 0.1)', border: '1px solid rgba(255, 180, 171, 0.2)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select 
            className={styles.selectInput}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">Tất cả Vai trò</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Editor">Editor</option>
            <option value="User">User</option>
          </select>

          <select 
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tất cả Trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Họ Tên</th>
                <th className={styles.th}>Vai Trò</th>
                <th className={styles.th}>Ngày Tham Gia</th>
                <th className={styles.th}>Trạng Thái</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className={styles.td} colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Loader2 className="animate-spin" size={18} />
                      Đang tải danh sách người dùng...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {user.name.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.roleBadge} ${
                        user.role === 'Super Admin' ? styles.roleAdmin : ''
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>
                      {user.joinedDate}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.statusDot}>
                        <span className={user.status === 'active' ? styles.dotActive : styles.dotInactive} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <div className={styles.actionCell} style={{ justifyContent: 'flex-end' }}>
                        <button className={styles.actionBtn} title="Chỉnh sửa">
                          <Edit2 size={15} />
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${user.status === 'active' ? styles.actionBtnDelete : ''}`} 
                          title={user.status === 'active' ? 'Tạm khóa' : 'Mở khóa'}
                          onClick={() => handleToggleStatus(user.id, user.status)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={styles.td} colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm Tài Khoản Mới</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Họ và Tên</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    className={styles.textInput}
                    placeholder="Nhập họ và tên..."
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className={styles.textInput}
                    placeholder="Nhập email..."
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="role">Vai Trò</label>
                  <select 
                    id="role" 
                    className={styles.selectInput}
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="User">User</option>
                    <option value="Editor">Editor</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status">Trạng Thái</label>
                  <select 
                    id="status" 
                    className={styles.selectInput}
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as 'active' | 'inactive')}
                    style={{ width: '100%' }}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm khóa</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Lưu Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
