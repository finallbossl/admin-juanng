'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

  return (
    <div className="flex flex-col pb-12 gap-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-secondary)]/50 backdrop-blur-md p-6 rounded-2xl border border-[var(--border-color)]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[var(--accent)]" />
            Thiết lập & Cấu hình hệ thống
          </h1>
          <p className="text-secondary text-xs">Quản lý và cấu hình các nguồn phim tự động, xem lịch sử đồng bộ chi tiết.</p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Tab Navigator (Plain divs with style, no Shadcn cards) */}
        <div className="lg:col-span-1 flex flex-col gap-2 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest px-3 mb-2 block opacity-60">Danh mục cấu hình</span>

          <button
            onClick={() => switchTab('crawler')}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer select-none text-left flex items-center gap-3
              ${activeTab === 'crawler' 
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-accent)] shadow-[0_0_10px_var(--accent-glow)]' 
                : 'text-secondary hover:text-on-surface hover:bg-[var(--bg-hover)]/30 border border-transparent'
              }`}
          >
            <Database size={15} />
            Cấu hình nguồn phim
          </button>

          <button
            onClick={() => switchTab('history')}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer select-none text-left flex items-center gap-3
              ${activeTab === 'history' 
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-accent)] shadow-[0_0_10px_var(--accent-glow)]' 
                : 'text-secondary hover:text-on-surface hover:bg-[var(--bg-hover)]/30 border border-transparent'
              }`}
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
              <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                
                {/* Header */}
                <div className="flex justify-between items-center" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="font-semibold text-on-surface text-base flex items-center gap-2">
                    <Database className="h-5 w-5 text-[var(--accent)]" />
                    Quản lý nguồn phim (Sync Sources)
                  </div>
                  <button 
                    onClick={handleOpenAddDialog}
                    style={{ padding: '8px 16px' }}
                    className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-bold shadow-sm text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    Thêm nguồn mới
                  </button>
                </div>

                {/* Content */}
                {sourcesLoading ? (
                  <div style={{ padding: '32px' }} className="space-y-4">
                    <CustomSkeleton className="h-16 w-full" />
                    <CustomSkeleton className="h-16 w-full" />
                    <CustomSkeleton className="h-16 w-full" />
                  </div>
                ) : sourcesError ? (
                  <div style={{ padding: '32px' }}>
                    <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-5 py-4 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle size={15} />
                      {sourcesError}
                    </div>
                  </div>
                ) : sources.length === 0 ? (
                  <div style={{ padding: '64px' }} className="text-center text-xs text-secondary border border-dashed border-[var(--border-color)] m-8 rounded-2xl bg-[var(--bg-hover)]/10 flex flex-col items-center gap-3">
                    <Globe className="h-9 w-9 text-slate-600" />
                    <span>Không có cấu hình nguồn phim nào được tạo. Nhấp "+ Thêm nguồn mới" để bắt đầu.</span>
                  </div>
                ) : (
                  <div style={{ padding: '32px' }} className="space-y-5">
                    
                    {/* Sources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sources.map((src) => {
                        let domain = 'unknown';
                        try {
                          domain = new URL(src.detailUrlBase).hostname;
                        } catch (e) {}

                        return (
                          <div 
                            key={src.id}
                            className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-hover)]/10 hover:bg-[var(--bg-hover)]/20 transition-all flex flex-col justify-between gap-4"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                                  🌐
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-on-surface truncate">{src.name}</h4>
                                  <span className="text-[10px] text-secondary truncate block mt-1">{domain}</span>
                                </div>
                              </div>
                              
                              {/* Toggle active switch */}
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleToggleActive(src)}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer
                                    ${src.active ? 'bg-[var(--accent)]' : 'bg-slate-700'}`}
                                >
                                  <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                                      ${src.active ? 'translate-x-4.5' : 'translate-x-0.5'}`}
                                  />
                                </button>
                                <span className={`text-[8.5px] font-bold ${src.active ? 'text-emerald-500' : 'text-slate-500'} uppercase select-none`}>
                                  {src.active ? 'Bật' : 'Tắt'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5 border-t border-[var(--border-color)] pt-3.5 text-[10.5px]">
                              <div className="flex items-center gap-1.5 text-secondary truncate">
                                <Link2 size={12} className="flex-shrink-0" />
                                <span className="font-mono text-slate-400 truncate">{src.listUrlPattern}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-secondary truncate">
                                <Link2 size={12} className="flex-shrink-0" />
                                <span className="font-mono text-slate-400 truncate">{src.detailUrlBase}</span>
                              </div>
                              {src.lastSyncedAt && (
                                <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                  <Calendar size={12} />
                                  <span>Đồng bộ lần cuối: {new Date(src.lastSyncedAt).toLocaleString('vi-VN')}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-3.5 mt-1">
                              <button 
                                onClick={() => handleOpenEditDialog(src)}
                                className="p-2 border border-[var(--border-color)] text-secondary hover:text-on-surface hover:bg-[var(--bg-hover)]/30 rounded-xl transition-all cursor-pointer"
                                title="Sửa cấu hình"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={() => src.id && handleDeleteSource(src.id)}
                                className="p-2 border border-[var(--border-color)] text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                                title="Xóa nguồn"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SYNC HISTORY */}
          {activeTab === 'history' && (
            <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="font-semibold text-on-surface text-base flex items-center gap-2">
                  <History className="h-5 w-5 text-[var(--accent)]" />
                  Lịch sử đồng bộ phim (Sync History)
                </div>
              </div>
              
              <div style={{ padding: '32px' }} className="space-y-6">
                <div className="overflow-x-auto border border-[var(--border-color)] rounded-2xl bg-surface/50 shadow-inner">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-[var(--bg-hover)]/20 text-slate-400 font-bold uppercase tracking-wider text-[9.5px]">
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
                          <td className="p-4 text-slate-400">{hist.type}</td>
                          <td className="p-4 text-slate-300">
                            {hist.detail}
                            {hist.error && (
                              <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                                <AlertTriangle size={11} />
                                {hist.error}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border
                              ${hist.status === 'SUCCESS' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {hist.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-on-surface">{hist.count} phim</td>
                          <td className="p-4 text-center text-slate-400">{hist.time}</td>
                          <td className="p-4 text-right text-slate-500 font-mono text-[10px]">{hist.date}</td>
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
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div 
            className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/50">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <Database size={15} className="text-[var(--accent)]" />
                {editingSource ? 'Chỉnh sửa cấu hình nguồn phim' : 'Thêm cấu hình nguồn phim mới'}
              </h3>
              <button 
                onClick={() => { setIsDialogOpen(false); setEditingSource(null); }}
                className="text-secondary hover:text-on-surface transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-[var(--bg-hover)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Dialog Form */}
            <form onSubmit={handleSaveSource} className="p-6 space-y-4">
              {formError && (
                <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <Check size={14} />
                  {formSuccess}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary">Tên nguồn phim *</label>
                <input 
                  type="text"
                  required
                  value={sourceName}
                  onChange={e => setSourceName(e.target.value)}
                  placeholder="Ví dụ: OPhim, KKPhim..."
                  style={{ padding: '0 16px', height: '42px' }}
                  className="w-full bg-surface border border-[var(--border-color)] text-on-surface rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary">Cấu hình URL danh sách (List URL Pattern) *</label>
                <input 
                  type="text"
                  required
                  value={listUrlPattern}
                  onChange={e => setListUrlPattern(e.target.value)}
                  placeholder="Ví dụ: https://ophim1.com/danh-sach/phim-moi-cap-nhat?page={page}"
                  style={{ padding: '0 16px', height: '42px' }}
                  className="w-full bg-surface border border-[var(--border-color)] text-on-surface rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Sử dụng tham số `{`page`}` để hệ thống tự động thay số trang khi đồng bộ.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary">Đường dẫn chi tiết gốc (Detail URL Base) *</label>
                <input 
                  type="text"
                  required
                  value={detailUrlBase}
                  onChange={e => setDetailUrlBase(e.target.value)}
                  placeholder="Ví dụ: https://ophim1.com/phim/{slug}"
                  style={{ padding: '0 16px', height: '42px' }}
                  className="w-full bg-surface border border-[var(--border-color)] text-on-surface rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-hover)]/30 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-on-surface">Kích hoạt nguồn này</span>
                  <span className="text-[10px] text-secondary">Cho phép hiển thị và đồng bộ phim từ nguồn này.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={sourceActive}
                    onChange={e => setSourceActive(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]" style={{ transition: 'background-color 0.2s' }} />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button 
                  type="button"
                  onClick={() => { setIsDialogOpen(false); setEditingSource(null); }}
                  className="px-4 py-2 border border-[var(--border-color)] text-secondary hover:text-on-surface rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-primary-container hover:bg-primary-container/90 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Lưu cấu hình</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={<div className="text-secondary text-sm p-8">Đang tải thiết lập...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
