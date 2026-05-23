'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { api } from '@/utils/api';

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
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary-container" size={32} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleGroup}>
        <h1>Cấu Hình Tài Khoản Admin</h1>
        <p>Quản lý các thiết lập cá nhân, thông tin hiển thị và cập nhật hồ sơ quản trị viên.</p>
      </div>

      {error && (
        <div style={{ color: '#ffb4ab', backgroundColor: 'rgba(255, 180, 171, 0.1)', border: '1px solid rgba(255, 180, 171, 0.2)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.settingsCard}>
        <div>
          <h2 className={styles.sectionTitle}>Thông Tin Tài Khoản</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Tên Đăng Nhập</label>
              <input 
                type="text" 
                id="username" 
                className={styles.textInput}
                value={username}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Địa Chỉ Email</label>
              <input 
                type="email" 
                id="email" 
                className={styles.textInput}
                value={email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>Thông Tin Cá Nhân</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Họ và Tên</label>
              <input 
                type="text" 
                id="fullName" 
                className={styles.textInput}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên hiển thị..."
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="avatarUrl">Đường Dẫn Ảnh Đại Diện</label>
              <input 
                type="url" 
                id="avatarUrl" 
                className={styles.textInput}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </div>

        <div className={styles.actionSection}>
          {isSaved && (
            <span style={{ color: 'var(--accent)', alignSelf: 'center', fontSize: '0.875rem', fontWeight: 500, marginRight: '10px' }}>
              ✓ Đã lưu cấu hình thành công!
            </span>
          )}
          <button 
            type="button" 
            className={styles.cancelBtn}
            onClick={() => window.location.reload()}
          >
            Hủy thay đổi
          </button>
          <button type="submit" className={styles.saveBtn}>
            <Save size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Lưu Thiết Lập
          </button>
        </div>
      </form>
    </div>
  );
}
