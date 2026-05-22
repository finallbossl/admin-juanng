'use client';

import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

export default function Settings() {
  const [siteName, setSiteName] = useState('AdminPro Dashboard');
  const [siteUrl, setSiteUrl] = useState('https://adminpro.vn');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleGroup}>
        <h1>Cấu Hình Hệ Thống</h1>
        <p>Quản lý các thiết lập vận hành, thông tin trang web và cấu hình bảo mật chung.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.settingsCard}>
        <div>
          <h2 className={styles.sectionTitle}>Thông Tin Dự Án</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="siteName">Tên Dự Án</label>
              <input 
                type="text" 
                id="siteName" 
                className={styles.textInput}
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="siteUrl">Địa Chỉ Website</label>
              <input 
                type="url" 
                id="siteUrl" 
                className={styles.textInput}
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>Thông Báo & Vận Hành</h2>
          <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.checkboxGroup}>
              <input 
                type="checkbox" 
                id="emailAlerts" 
                className={styles.checkboxInput}
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              <label htmlFor="emailAlerts" className={styles.checkboxLabel}>
                Nhận cảnh báo qua email khi có lỗi hệ thống phát sinh hoặc đăng nhập bất thường.
              </label>
            </div>

            <div className={styles.checkboxGroup}>
              <input 
                type="checkbox" 
                id="maintenanceMode" 
                className={styles.checkboxInput}
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
              />
              <label htmlFor="maintenanceMode" className={styles.checkboxLabel}>
                Kích hoạt Chế độ Bảo trì (Bảo trì định kỳ - sẽ hiển thị trang thông báo cho người dùng bên ngoài).
              </label>
            </div>
          </div>
        </div>

        <div className={styles.actionSection}>
          {isSaved && (
            <span style={{ color: 'var(--accent)', alignSelf: 'center', fontSize: '0.875rem', fontWeight: 500, marginRight: '10px' }}>
              ✓ Đã lưu cấu hình thành công!
            </span>
          )}
          <button type="button" className={styles.cancelBtn}>
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
