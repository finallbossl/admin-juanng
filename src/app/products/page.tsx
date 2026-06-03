'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Film, Trash2, Shield, ShieldAlert, Search, Plus, Save } from 'lucide-react';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';

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
  return (
    <Suspense fallback={
      <div className="flex flex-col" style={{ gap: '24px' }}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[var(--bg-hover)]" />
          <Skeleton className="h-4 w-96 bg-[var(--bg-hover)]" />
        </div>
        <Card className="glass-panel border-none shadow-none" style={{ padding: '24px' }}>
          <Skeleton className="h-[300px] w-full bg-[var(--bg-hover)]" />
        </Card>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams.get('add') === 'true';
  const currentTab = searchParams.get('tab');
  const urlSearch = searchParams.get('search') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [originName, setOriginName] = useState('');
  const [type, setType] = useState('single'); // single | series
  const [quality, setQuality] = useState('HD');
  const [lang, setLang] = useState('Vietsub');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [time, setTime] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [thumbUrl, setThumbUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

  // Update searchQuery if there is a 'search' param in the URL
  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

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

  const handleAddMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      await api.post('/catalog/movies', {
        name,
        originName,
        type,
        quality,
        lang,
        year: parseInt(year) || new Date().getFullYear(),
        time: time ? (time.includes('phút') ? time : `${time} phút`) : 'Chưa rõ',
        premiumOnly,
        thumbUrl,
        posterUrl,
        description,
        status: 'completed'
      });

      setFormSuccess('Thêm bộ phim mới thành công!');
      // Reset Form fields
      setName('');
      setOriginName('');
      setType('single');
      setQuality('HD');
      setLang('Vietsub');
      setYear(new Date().getFullYear().toString());
      setTime('');
      setPremiumOnly(false);
      setThumbUrl('');
      setPosterUrl('');
      setDescription('');
      
      // Reload list in background
      fetchMovies();
    } catch (err: any) {
      setFormError(err.message || 'Có lỗi xảy ra khi tạo bộ phim mới.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredMovies = movies.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.originName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mockGenres = [
    { name: 'Hành động', count: 1420, icon: '💥', desc: 'Phim bắn súng, võ thuật, rượt đuổi kịch tính.' },
    { name: 'Viễn tưởng', count: 850, icon: '🚀', desc: 'Du hành vũ trụ, công nghệ tương lai, người ngoài hành tinh.' },
    { name: 'Kinh dị', count: 540, icon: '👻', desc: 'Phim ma, tâm linh, rùng rợn, giật gân.' },
    { name: 'Tình cảm', count: 980, icon: '💖', desc: 'Lãng mạn, gia đình, tâm lý xã hội nhẹ nhàng.' },
    { name: 'Hài hước', count: 1100, icon: '😂', desc: 'Hài kịch giải trí, đem lại tiếng cười vui nhộn.' },
    { name: 'Hoạt hình', count: 670, icon: '🎨', desc: 'Anime Nhật Bản, phim hoạt hình 3D đỉnh cao.' },
    { name: 'Cổ trang', count: 430, icon: '⚔️', desc: 'Phim dã sử, kiếm hiệp hoàng cung kỳ ảo.' },
    { name: 'Tài liệu', count: 210, icon: '📚', desc: 'Khám phá tự nhiên, lịch sử, nhân vật đời thực.' },
  ];

  if (loading && !isAddMode && currentTab !== 'genres') {
    return (
      <div className="flex flex-col" style={{ gap: '24px' }}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[var(--bg-hover)]" />
          <Skeleton className="h-4 w-96 bg-[var(--bg-hover)]" />
        </div>
        <div className="flex gap-4 max-w-sm">
          <Skeleton className="h-10 w-full bg-[var(--bg-hover)] rounded-full" />
        </div>
        <Card className="glass-panel border-none shadow-none space-y-4" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 bg-[var(--bg-hover)] rounded-full" />
            <Skeleton className="h-5 w-40 bg-[var(--bg-hover)]" />
          </div>
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3 bg-[var(--bg-hover)]" />
                  <Skeleton className="h-3 w-1/4 bg-[var(--bg-hover)]" />
                </div>
                <div className="flex gap-12 items-center">
                  <Skeleton className="h-4 w-16 bg-[var(--bg-hover)]" />
                  <Skeleton className="h-6 w-20 bg-[var(--bg-hover)] rounded-full" />
                  <Skeleton className="h-8 w-8 bg-[var(--bg-hover)] rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // View 1: Add Movie Form Mode
  if (isAddMode) {
    return (
      <div className="flex flex-col" style={{ gap: '24px' }}>
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Thêm Phim Mới</h1>
          <p className="text-secondary text-body-md">Thêm thông tin và đường dẫn phát trực tuyến cho phim mới.</p>
        </div>

        <Card className="glass-panel border-none shadow-none">
          <CardHeader className="border-b border-[var(--border-color)] flex flex-row items-center justify-between gap-2" style={{ padding: '24px 24px 16px 24px' }}>
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-[var(--accent)]" />
              <CardTitle className="font-headline-sm text-headline-sm text-on-surface">Thông Tin Phim</CardTitle>
            </div>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => router.push('/products')}
              className="border-[var(--border-color)] text-secondary hover:bg-[var(--bg-hover)] hover:text-on-surface cursor-pointer text-xs"
            >
              Quay lại danh sách
            </Button>
          </CardHeader>
          
          <form onSubmit={handleAddMovieSubmit}>
            <CardContent className="space-y-6" style={{ padding: '24px' }}>
              {formSuccess && (
                <div className="text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-lg text-sm font-semibold">
                  ✓ {formSuccess}
                </div>
              )}
              {formError && (
                <div className="text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-sm font-semibold">
                  ⚠ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Tên Phim (Tiếng Việt)</label>
                  <Input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ví dụ: Người Sắt..." 
                    required
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Tên Gốc (Tiếng Anh/Gốc)</label>
                  <Input 
                    type="text" 
                    value={originName} 
                    onChange={(e) => setOriginName(e.target.value)} 
                    placeholder="Ví dụ: Iron Man..." 
                    required
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Định Dạng Phim</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-surface text-on-surface border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
                  >
                    <option value="single">Phim Lẻ (Single)</option>
                    <option value="series">Phim Bộ (Series)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Chất Lượng</label>
                  <select 
                    value={quality} 
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-surface text-on-surface border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
                  >
                    <option value="HD">HD</option>
                    <option value="FHD">Full HD</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Ngôn Ngữ</label>
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full bg-surface text-on-surface border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
                  >
                    <option value="Vietsub">Vietsub</option>
                    <option value="Thuyết Minh">Thuyết Minh</option>
                    <option value="Lồng Tiếng">Lồng Tiếng</option>
                    <option value="Vietsub + Thuyết Minh">Vietsub + Thuyết Minh</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Năm Sản Xuất</label>
                  <Input 
                    type="number" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    placeholder="2026" 
                    required
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Thời Lượng (Phút)</label>
                  <Input 
                    type="text" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    placeholder="Ví dụ: 120 (hoặc 120 phút)..." 
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-center">
                  <label className="text-xs font-semibold text-secondary mb-2">Phân Hạng Quyền Truy Cập</label>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={premiumOnly} 
                      onChange={(e) => setPremiumOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-primary border-[var(--border-color)] focus:ring-primary-container cursor-pointer"
                    />
                    <span className="text-sm text-on-surface font-semibold">Chỉ dành riêng cho thành viên VIP/Premium</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Đường Dẫn Ảnh Bìa (Thumbnail URL)</label>
                  <Input 
                    type="url" 
                    value={thumbUrl} 
                    onChange={(e) => setThumbUrl(e.target.value)} 
                    placeholder="https://example.com/movie-poster.jpg" 
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Đường Dẫn Ảnh Nền (Poster URL)</label>
                  <Input 
                    type="url" 
                    value={posterUrl} 
                    onChange={(e) => setPosterUrl(e.target.value)} 
                    placeholder="https://example.com/movie-backdrop.jpg" 
                    className="bg-surface border-[var(--border-color)] text-on-surface focus-visible:ring-primary-container"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary">Mô Tả Nội Dung Phim</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập tóm tắt kịch bản, cốt truyện..."
                  rows={4}
                  className="w-full bg-surface text-on-surface border border-[var(--border-color)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/products')}
                  className="border-[var(--border-color)] text-secondary hover:bg-[var(--bg-hover)] hover:text-on-surface cursor-pointer"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading}
                  className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-semibold shadow-md shadow-primary-container/20"
                >
                  {formLoading ? 'Đang xử lý...' : 'Lưu lại & Thêm Phim'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    );
  }

  // View 2: Genres View Mode
  if (currentTab === 'genres') {
    return (
      <div className="flex flex-col" style={{ gap: '24px' }}>
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Thể Loại Phim</h1>
          <p className="text-secondary text-body-md">Quản lý danh sách các thể loại phim hiện hành và phân chia lưu lượng.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockGenres.map((g, idx) => (
            <Card key={idx} className="glass-panel border-none shadow-none hover:translate-y-[-2px] transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-3" style={{ padding: '24px 24px 12px 24px' }}>
                <span className="text-3xl select-none">{g.icon}</span>
                <div className="flex flex-col">
                  <CardTitle className="font-semibold text-on-surface text-base">{g.name}</CardTitle>
                  <span className="text-xs text-secondary">{g.count} tác phẩm</span>
                </div>
              </CardHeader>
              <CardContent style={{ padding: '0px 24px 24px 24px' }}>
                <p className="text-xs text-secondary leading-relaxed mb-4">{g.desc}</p>
                <Button 
                  type="button"
                  className="w-full text-xs bg-[var(--bg-hover)] text-secondary hover:text-on-surface border border-[var(--border-color)] rounded-lg py-1.5 h-auto cursor-pointer"
                  onClick={() => router.push(`/products?search=${g.name}`)}
                >
                  Xem danh sách phim
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // View 3: Default Movie Table List Mode
  return (
    <div className="flex flex-col" style={{ gap: '24px' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản Lý Danh Sách Phim</h1>
          <p className="text-secondary text-body-md">Xem danh sách phim hiện có trong cơ sở dữ liệu, quản lý quyền VIP phim và xóa phim.</p>
        </div>
        <Button 
          onClick={() => router.push('/products?add=true')}
          className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-semibold shadow-md shadow-primary-container/20"
        >
          <Plus size={18} className="mr-1.5" />
          Thêm Phim Mới
        </Button>
      </div>

      {error && (
        <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input 
            type="text" 
            placeholder="Tìm phim theo tên..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '42px', paddingRight: '16px', height: '40px' }}
            className="bg-surface-container text-on-surface border-none rounded-full text-body-md focus-visible:ring-2 focus-visible:ring-primary-container w-full transition-all focus-visible:outline-none"
          />
        </div>
      </div>

      <Card className="glass-panel border-none shadow-none">
        <CardHeader className="border-b border-[var(--border-color)] flex flex-row items-center gap-2 space-y-0" style={{ padding: '24px 24px 16px 24px' }}>
          <Film className="h-5 w-5 text-[var(--accent)]" />
          <CardTitle className="font-headline-sm text-headline-sm text-on-surface">Danh Sách Phim</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto" style={{ padding: '0px' }}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Tên Phim</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Định Dạng</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Chất Lượng</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Năm</th>
                <th className="text-secondary font-semibold" style={{ padding: '18px 24px' }}>Phân Hạng VIP</th>
                <th className="text-secondary font-semibold text-right" style={{ padding: '18px 24px' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td style={{ padding: '18px 24px' }}>
                      <div className="font-semibold text-on-surface">{movie.name}</div>
                      <div className="text-xs text-secondary">{movie.originName}</div>
                    </td>
                    <td className="text-secondary" style={{ padding: '18px 24px' }}>{movie.type}</td>
                    <td style={{ padding: '18px 24px' }}>
                      <span className="bg-[var(--bg-hover)] text-on-surface px-2.5 py-1 rounded text-xs font-semibold">{movie.quality}</span>
                    </td>
                    <td className="text-secondary" style={{ padding: '18px 24px' }}>{movie.year}</td>
                    <td style={{ padding: '18px 24px' }}>
                      <Button 
                        variant="ghost"
                        onClick={() => handleTogglePremium(movie.id, movie.premiumOnly)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all h-auto
                          ${movie.premiumOnly 
                            ? 'bg-primary-container text-white hover:bg-primary-container/90' 
                            : 'bg-[var(--bg-hover)] text-secondary hover:bg-[var(--border-color)] hover:text-on-surface'
                          }
                        `}
                      >
                        {movie.premiumOnly ? <ShieldAlert size={12} /> : <Shield size={12} />}
                        {movie.premiumOnly ? 'VIP/Premium' : 'Miễn Phí'}
                      </Button>
                    </td>
                    <td className="text-right" style={{ padding: '18px 24px' }}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="text-[var(--danger)] hover:text-[var(--danger)]/80 hover:bg-[var(--bg-hover)] cursor-pointer h-8 w-8"
                        title="Xóa phim"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-secondary" style={{ padding: '32px' }}>
                    Không tìm thấy bộ phim nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
