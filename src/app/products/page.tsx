'use client';

import React, { useState, useEffect } from 'react';
import { Film, Trash2, Shield, ShieldAlert, Loader2, Search } from 'lucide-react';
import styles from '../analytics/page.module.css'; // Re-use general card styles
import { api } from '@/utils/api';

interface Movie {
  id: string;
  name: string;
  originName: string;
  type: string;
  quality: string;
  lang: string;
  year: number;
  premiumOnly: boolean;
  status: string;
}

export default function Products() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any[]>('/catalog/movies');
      const mappedMovies = (res.result || []).map(m => ({
        id: m.id,
        name: m.name,
        originName: m.originName || '',
        type: m.type === 'single' ? 'Phim Lẻ' : m.type === 'series' ? 'Phim Bộ' : m.type || 'Chưa rõ',
        quality: m.quality || 'HD',
        lang: m.lang || 'Vietsub',
        year: m.year || 2026,
        premiumOnly: m.premiumOnly || false,
        status: m.status || 'completed'
      }));
      setMovies(mappedMovies);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phim.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDeleteMovie = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ phim này khỏi hệ thống không?')) {
      try {
        await api.delete(`/catalog/movies/${id}`);
        setMovies(movies.filter(m => m.id !== id));
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa phim.');
      }
    }
  };

  const handleTogglePremium = async (id: string, currentPremium: boolean) => {
    const nextPremium = !currentPremium;
    const confirmMsg = nextPremium 
      ? 'Chuyển bộ phim này sang chế độ chỉ dành cho VIP/Premium?' 
      : 'Hủy bỏ chế độ chỉ dành cho VIP/Premium của phim?';

    if (confirm(confirmMsg)) {
      try {
        await api.put(`/catalog/movies/${id}/premium?isPremium=${nextPremium}`);
        setMovies(movies.map(m => m.id === id ? { ...m, premiumOnly: nextPremium } : m));
      } catch (err: any) {
        alert(err.message || 'Không thể cập nhật gói VIP phim.');
      }
    }
  };

  const filteredMovies = movies.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.originName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleGroup}>
        <h1>Quản Lý Danh Sách Phim</h1>
        <p>Xem danh sách phim hiện có trong cơ sở dữ liệu, quản lý quyền VIP phim và xóa phim.</p>
      </div>

      {error && (
        <div style={{ color: '#ffb4ab', backgroundColor: 'rgba(255, 180, 171, 0.1)', border: '1px solid rgba(255, 180, 171, 0.2)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm phim theo tên..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 12px 10px 40px', 
              borderRadius: '9999px', 
              border: '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div className={styles.analyticsGrid} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Film size={20} style={{ color: 'var(--accent)' }} />
            <h2 className={styles.cardTitle}>Danh Sách Phim</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Tên Phim</th>
                  <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Định Dạng</th>
                  <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Chất Lượng</th>
                  <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Năm</th>
                  <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Phân Hạng VIP</th>
                  <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Loader2 className="animate-spin" size={18} />
                        Đang tải danh sách phim...
                      </div>
                    </td>
                  </tr>
                ) : filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <tr key={movie.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{movie.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{movie.originName}</div>
                      </td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{movie.type}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ backgroundColor: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{movie.quality}</span>
                      </td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{movie.year}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <button 
                          onClick={() => handleTogglePremium(movie.id, movie.premiumOnly)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '4px 10px', 
                            borderRadius: '9999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            border: 'none',
                            color: movie.premiumOnly ? '#fff' : 'var(--text-secondary)',
                            backgroundColor: movie.premiumOnly ? 'var(--accent)' : 'var(--bg-hover)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {movie.premiumOnly ? <ShieldAlert size={12} /> : <Shield size={12} />}
                          {movie.premiumOnly ? 'VIP/Premium' : 'Miễn Phí'}
                        </button>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteMovie(movie.id)}
                          style={{ 
                            color: 'var(--danger)', 
                            backgroundColor: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: '6px', 
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          className="hover:bg-red-500/10"
                          title="Xóa phim"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Không tìm thấy bộ phim nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
