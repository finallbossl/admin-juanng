'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Save, 
  Database, 
  History, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  X, 
  Check, 
  AlertTriangle,
  Link2,
  Calendar,
  Settings as SettingsIcon
} from 'lucide-react';
import { api } from '@/utils/api';

// Custom Skeleton for our plain HTML layouts
function CustomSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--bg-hover)]/30 rounded-xl ${className}`} />
  );
}

interface SyncSource {
  id?: number;
  name: string;
  listUrlPattern: string;
  detailUrlBase: string;
  active: boolean; // mapped from entity's isActive
  lastSyncedPage?: number | null;
  lastSyncedAt?: string | null;
}

const MOCK_HISTORY = [
  { id: 1, source: 'OPhim', type: 'Đồng bộ trang (Crawl Page)', detail: 'Trang 1', status: 'SUCCESS', count: 20, time: '34s', date: '03/06/2026 12:45' },
  { id: 2, source: 'KKPhim', type: 'Đồng bộ trang (Crawl Page)', detail: 'Trang 3', status: 'SUCCESS', count: 18, time: '29s', date: '03/06/2026 10:12' },
  { id: 3, source: 'OPhim', type: 'Xem trước & Chọn (Preview)', detail: 'Đã lưu 5 phim được chọn', status: 'SUCCESS', count: 5, time: '12s', date: '02/06/2026 18:30' },
  { id: 4, source: 'KKPhim', type: 'Đồng bộ trang (Crawl Page)', detail: 'Trang 1', status: 'SUCCESS', count: 20, time: '32s', date: '02/06/2026 14:05' },
  { id: 5, source: 'VSMov', type: 'Đồng bộ trang (Crawl Page)', detail: 'Trang 2', status: 'FAILED', error: 'Kết nối API máy chủ nguồn thất bại (Gateway Timeout)', count: 0, time: '15s', date: '01/06/2026 09:22' },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'crawler'; // crawler | history

  // Client Side Mount State
  const [isMounted, setIsMounted] = useState(false);

  // Crawler Tab States
  const [sources, setSources] = useState<SyncSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<SyncSource | null>(null);

  // Crawler Form fields
  const [sourceName, setSourceName] = useState('');
  const [listUrlPattern, setListUrlPattern] = useState('');
  const [detailUrlBase, setDetailUrlBase] = useState('');
  const [sourceActive, setSourceActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // UI Interactive States
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Fetch Crawler Sources
  const fetchSources = async () => {
    setSourcesLoading(true);
    setSourcesError('');
    try {
      const res = await api.get<any[]>('/catalog/sync/sources');
      setSources(res.result || []);
    } catch (err: any) {
      setSourcesError(err.message || 'Không thể tải danh sách nguồn phim.');
    } finally {
      setSourcesLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchSources();
  }, []);

  // Open Dialog for adding new source
  const handleOpenAddDialog = () => {
    setEditingSource(null);
    setSourceName('');
    setListUrlPattern('');
    setDetailUrlBase('');
    setSourceActive(true);
    setFormError('');
    setFormSuccess('');
    setIsDialogOpen(true);
  };

  // Open Dialog for editing source
  const handleOpenEditDialog = (src: SyncSource) => {
    setEditingSource(src);
    setSourceName(src.name);
    setListUrlPattern(src.listUrlPattern);
    setDetailUrlBase(src.detailUrlBase);
    setSourceActive(src.active);
    setFormError('');
    setFormSuccess('');
    setIsDialogOpen(true);
  };

  // Save / Update Source
  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    const payload = {
      name: sourceName,
      listUrlPattern,
      detailUrlBase,
      active: sourceActive
    };

    try {
      if (editingSource && editingSource.id) {
        // Update
        await api.put<any>(`/catalog/sync/sources/${editingSource.id}`, payload);
        setFormSuccess('Cập nhật cấu hình nguồn phim thành công!');
        fetchSources();
      } else {
        // Create
        await api.post<any>('/catalog/sync/sources', payload);
        setFormSuccess('Thêm cấu hình nguồn phim mới thành công!');
        fetchSources();
      }
      setTimeout(() => {
        setIsDialogOpen(false);
        setEditingSource(null);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu cấu hình nguồn phim.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Source
  const handleDeleteSource = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình nguồn phim này không? Hành động này không thể hoàn tác.')) {
      try {
        await api.delete(`/catalog/sync/sources/${id}`);
        fetchSources();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa nguồn phim.');
      }
    }
  };

  // Toggle Active State
  const handleToggleActive = async (src: SyncSource) => {
    try {
      const payload = {
        name: src.name,
        listUrlPattern: src.listUrlPattern,
        detailUrlBase: src.detailUrlBase,
        active: !src.active
      };
      await api.put(`/catalog/sync/sources/${src.id}`, payload);
      fetchSources();
    } catch (err: any) {
      alert(err.message || 'Không thể thay đổi trạng thái nguồn phim.');
    }
  };

  // Switch Tab helper
  const switchTab = (tabName: string) => {
    router.push(`/settings?tab=${tabName}`);
  };

  // Input styling generator for focus glows (combating resets from shadcn/tailwind)
  const getInputStyle = (fieldName: string) => ({
    padding: '0 16px',
    height: '44px',
    width: '100%',
    boxSizing: 'border-box' as const,
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    borderRadius: '12px',
    border: focusedField === fieldName ? '1px solid var(--border-accent)' : '1px solid var(--border-color)',
    boxShadow: focusedField === fieldName ? '0 0 10px var(--accent-glow)' : 'none',
    outline: 'none',
    fontSize: '13px',
    transition: 'all 0.2s ease-in-out',
  });

  return (
    <div className="flex flex-col pb-12 gap-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-secondary)]/50 backdrop-blur-md p-6 rounded-2xl border border-[var(--border-color)]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[var(--accent)] animate-pulse" />
            Thiết lập & Cấu hình hệ thống
          </h1>
          <p className="text-[var(--text-secondary)] text-xs">Quản lý và cấu hình các nguồn phim tự động, xem lịch sử đồng bộ chi tiết.</p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Tab Navigator (Plain divs with style, no Shadcn cards) */}
        <div 
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-glass-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className="lg:col-span-1 flex flex-col gap-2 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3 px-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block opacity-75">Danh mục cấu hình</span>
          </div>

          <button
            onClick={() => switchTab('crawler')}
            style={{ 
              border: activeTab === 'crawler' ? '1px solid var(--border-accent)' : '1px solid transparent',
              background: activeTab === 'crawler' ? 'var(--accent-dim)' : 'transparent',
              color: activeTab === 'crawler' ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left' as const
            }}
            className="hover:bg-[var(--bg-hover)]/30 hover:translate-x-1"
          >
            <Database size={15} />
            Cấu hình nguồn phim
          </button>

          <button
            onClick={() => switchTab('history')}
            style={{ 
              border: activeTab === 'history' ? '1px solid var(--border-accent)' : '1px solid transparent',
              background: activeTab === 'history' ? 'var(--accent-dim)' : 'transparent',
              color: activeTab === 'history' ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left' as const
            }}
            className="hover:bg-[var(--bg-hover)]/30 hover:translate-x-1"
          >
            <History size={15} />
            Lịch sử đồng bộ
          </button>
        </div>

        {/* Right Column: Tab Content */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* TAB 1: CRAWLER CONFIGURATION */}
          {activeTab === 'crawler' && (
            <div className="flex flex-col gap-6">
              
              {/* sources list card */}
              <div 
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-glass-card)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
                className="shadow-lg"
              >
                
                {/* Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }} className="flex justify-between items-center bg-[var(--bg-secondary)]/30">
                  <div className="font-semibold text-on-surface text-base flex items-center gap-2">
                    <Database className="h-5 w-5 text-[var(--accent)]" />
                    Quản lý nguồn phim (Sync Sources)
                  </div>
                  <button 
                    onClick={handleOpenAddDialog}
                    style={{ padding: '10px 20px' }}
                    className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-bold shadow-sm text-xs rounded-xl flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-primary-container/20"
                  >
                    <Plus size={14} />
                    Thêm nguồn mới
                  </button>
                </div>

                {/* Content */}
                <div style={{ padding: '32px' }}>
                  {sourcesLoading ? (
                    <div className="space-y-4">
                      <CustomSkeleton className="h-16 w-full" />
                      <CustomSkeleton className="h-16 w-full" />
                      <CustomSkeleton className="h-16 w-full" />
                    </div>
                  ) : sourcesError ? (
                    <div>
                      <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-5 py-4 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle size={15} />
                        {sourcesError}
                      </div>
                    </div>
                  ) : sources.length === 0 ? (
                    <div style={{ padding: '64px' }} className="text-center text-xs text-[var(--text-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-hover)]/10 flex flex-col items-center gap-3">
                      <Globe className="h-9 w-9 text-slate-400 dark:text-slate-600" />
                      <span>Không có cấu hình nguồn phim nào được tạo. Nhấp "+ Thêm nguồn mới" để bắt đầu.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sources.map((src) => {
                        let domain = 'unknown';
                        try {
                          domain = new URL(src.detailUrlBase).hostname;
                        } catch (e) {}

                        return (
                          <div 
                            key={src.id}
                            style={{
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-secondary)',
                              padding: '20px',
                              borderRadius: '16px',
                            }}
                            className="hover:bg-[var(--bg-hover)]/20 transition-all flex flex-col justify-between gap-4"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                                  🌐
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-on-surface truncate">{src.name}</h4>
                                  <span className="text-[10px] text-[var(--text-secondary)] truncate block mt-1">{domain}</span>
                                </div>
                              </div>
                              
                              {/* Toggle active switch */}
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleToggleActive(src)}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer
                                    ${src.active ? 'bg-[var(--accent)]' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                  <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                                      ${src.active ? 'translate-x-4.5' : 'translate-x-0.5'}`}
                                  />
                                </button>
                                <span className={`text-[8.5px] font-bold ${src.active ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'} uppercase select-none`}>
                                  {src.active ? 'Bật' : 'Tắt'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5 border-t border-[var(--border-color)] pt-3.5 text-[10.5px]">
                              <div className="flex items-center gap-1.5 text-[var(--text-secondary)] truncate">
                                <Link2 size={12} className="flex-shrink-0 text-slate-400 dark:text-slate-500" />
                                <span className="font-mono text-slate-600 dark:text-slate-400 truncate">{src.listUrlPattern}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[var(--text-secondary)] truncate">
                                <Link2 size={12} className="flex-shrink-0 text-slate-400 dark:text-slate-500" />
                                <span className="font-mono text-slate-600 dark:text-slate-400 truncate">{src.detailUrlBase}</span>
                              </div>
                              {src.lastSyncedAt && (
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-1">
                                  <Calendar size={12} />
                                  <span>Đồng bộ lần cuối: {new Date(src.lastSyncedAt).toLocaleString('vi-VN')}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-3.5 mt-1">
                              <button 
                                onClick={() => handleOpenEditDialog(src)}
                                className="p-2 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-on-surface hover:bg-[var(--bg-hover)]/30 rounded-xl transition-all cursor-pointer"
                                title="Sửa cấu hình"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={() => src.id && handleDeleteSource(src.id)}
                                className="p-2 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                                title="Xóa nguồn"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYNC HISTORY */}
          {activeTab === 'history' && (
            <div 
              style={{
                border: '1px solid var(--border-color)',
                background: 'var(--bg-glass-card)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
              className="shadow-lg"
            >
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }} className="bg-[var(--bg-secondary)]/30">
                <div className="font-semibold text-on-surface text-base flex items-center gap-2">
                  <History className="h-5 w-5 text-[var(--accent)]" />
                  Lịch sử đồng bộ phim (Sync History)
                </div>
              </div>
              
              <div style={{ padding: '32px' }} className="space-y-6">
                <div className="overflow-x-auto border border-[var(--border-color)] rounded-2xl bg-surface/50 shadow-inner">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-[var(--bg-hover)]/20 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9.5px]">
                        <th className="p-4">Nguồn phim</th>
                        <th className="p-4">Hình thức</th>
                        <th className="p-4">Chi tiết đồng bộ</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-center">Đã thêm</th>
                        <th className="p-4 text-center">Thời gian</th>
                        <th className="p-4 text-right">Ngày thực hiện</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {MOCK_HISTORY.map((hist) => (
                        <tr key={hist.id} className="hover:bg-[var(--bg-hover)]/10 transition-colors">
                          <td className="p-4 font-bold text-on-surface flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                            {hist.source}
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">{hist.type}</td>
                          <td className="p-4 text-slate-700 dark:text-slate-300">
                            {hist.detail}
                            {hist.error && (
                              <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                                <AlertTriangle size={11} />
                                {hist.error}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border
                              ${hist.status === 'SUCCESS' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                              }`}
                            >
                              {hist.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-on-surface">{hist.count} phim</td>
                          <td className="p-4 text-center text-slate-500 dark:text-slate-400">{hist.time}</td>
                          <td className="p-4 text-right text-slate-500 dark:text-slate-400 font-mono text-[10px]">{hist.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DIALOG DIAL / MODAL FOR ADD & EDIT SYNC SOURCE */}
      {/* Mounted via createPortal to body to completely bypass DashboardLayout component mount transforms bug */}
      {isDialogOpen && isMounted && typeof window !== 'undefined' && createPortal(
        <div 
          style={{
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'stretch',
          }}
          className="fixed inset-0 animate-backdrop-custom"
          onClick={() => { setIsDialogOpen(false); setEditingSource(null); }}
        >
          <style>{`
            @keyframes dialogBackdropFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes drawerSlideLeft {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-backdrop-custom {
              animation: dialogBackdropFade 0.2s ease-out forwards;
            }
            .animate-drawer-custom {
              animation: drawerSlideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div 
            style={{ 
              borderLeft: '1px solid var(--border-color)', 
              width: '460px',
              maxWidth: '100%',
              background: 'var(--bg-surface)',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              height: '100%',
            }}
            className="animate-drawer-custom"
            onClick={e => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div 
              style={{ 
                borderBottom: '1px solid var(--border-color)',
                padding: '20px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
              }}
            >
              <h3 
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}
              >
                <Database size={16} className="text-[var(--accent)] animate-pulse" />
                {editingSource ? 'Chỉnh sửa nguồn phim' : 'Thêm cấu hình nguồn mới'}
              </h3>
              <button 
                onClick={() => { setIsDialogOpen(false); setEditingSource(null); }}
                style={{
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                className="hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Dialog Form */}
            <form 
              onSubmit={handleSaveSource} 
              style={{
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {formError && (
                <div 
                  style={{
                    color: '#fca5a5',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div 
                  style={{
                    color: '#86efac',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Check size={14} style={{ flexShrink: 0 }} />
                  {formSuccess}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label 
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    paddingLeft: '4px',
                    margin: 0,
                  }}
                >
                  Tên nguồn phim *
                </label>
                <input 
                  type="text"
                  required
                  value={sourceName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setSourceName(e.target.value)}
                  placeholder="Ví dụ: OPhim, KKPhim..."
                  style={getInputStyle('name')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label 
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    paddingLeft: '4px',
                    margin: 0,
                  }}
                >
                  Mẫu URL danh sách (List URL Pattern) *
                </label>
                <input 
                  type="text"
                  required
                  value={listUrlPattern}
                  onFocus={() => setFocusedField('pattern')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setListUrlPattern(e.target.value)}
                  placeholder="Ví dụ: https://ophim1.com/danh-sach/phim-moi-cap-nhat?page={page}"
                  style={getInputStyle('pattern')}
                  className="font-mono"
                />
                <p 
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.4',
                    paddingLeft: '4px',
                    marginTop: '2px',
                    marginBottom: 0,
                  }}
                >
                  Sử dụng <code style={{ background: 'var(--bg-hover)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>{"{page}"}</code> để hệ thống tự động thay số trang khi đồng bộ.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label 
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    paddingLeft: '4px',
                    margin: 0,
                  }}
                >
                  Đường dẫn chi tiết gốc (Detail URL Base) *
                </label>
                <input 
                  type="text"
                  required
                  value={detailUrlBase}
                  onFocus={() => setFocusedField('detail')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setDetailUrlBase(e.target.value)}
                  placeholder="Ví dụ: https://ophim1.com/phim/{slug}"
                  style={getInputStyle('detail')}
                  className="font-mono"
                />
              </div>

              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-hover)',
                  marginTop: '4px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Kích hoạt nguồn này</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Cho phép hiển thị và đồng bộ phim từ nguồn này.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={sourceActive}
                    onChange={e => setSourceActive(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]" style={{ transition: 'background-color 0.2s' }} />
                </label>
              </div>

              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border-color)',
                  marginTop: '12px',
                }}
              >
                <button 
                  type="button"
                  onClick={() => { setIsDialogOpen(false); setEditingSource(null); }}
                  style={{
                    padding: '10px 18px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  className="hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  className="hover:opacity-90 active:scale-95 shadow-sm"
                >
                  {formLoading ? (
                    <>
                      <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Lưu cấu hình</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={<div className="text-[var(--text-secondary)] text-sm p-8">Đang tải thiết lập...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
