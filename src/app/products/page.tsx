'use client';

import React, { useState, useEffect } from 'react';
import { Film, Trash2, Shield, ShieldAlert, Search } from 'lucide-react';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-white/5" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>
        <div className="flex gap-4 max-w-sm">
          <Skeleton className="h-10 w-full bg-white/5 rounded-full" />
        </div>
        <Card className="glass-panel border-none shadow-none p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 bg-white/5 rounded-full" />
            <Skeleton className="h-5 w-40 bg-white/5" />
          </div>
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3 bg-white/5" />
                  <Skeleton className="h-3 w-1/4 bg-white/5" />
                </div>
                <div className="flex gap-12 items-center">
                  <Skeleton className="h-4 w-16 bg-white/5" />
                  <Skeleton className="h-6 w-20 bg-white/5 rounded-full" />
                  <Skeleton className="h-8 w-8 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản Lý Danh Sách Phim</h1>
        <p className="text-secondary text-body-md">Xem danh sách phim hiện có trong cơ sở dữ liệu, quản lý quyền VIP phim và xóa phim.</p>
      </div>

      {error && (
        <div className="text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input 
            type="text" 
            placeholder="Tìm phim theo tên..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface-container text-on-surface border-none rounded-full pl-10 pr-4 h-10 text-body-md focus-visible:ring-2 focus-visible:ring-primary-container w-full transition-all focus-visible:outline-none"
          />
        </div>
      </div>

      <Card className="glass-panel border-none shadow-none">
        <CardHeader className="p-6 pb-4 border-b border-white/5 flex flex-row items-center gap-2 space-y-0">
          <Film className="h-5 w-5 text-primary" />
          <CardTitle className="font-headline-sm text-headline-sm">Danh Sách Phim</CardTitle>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-bottom border-white/5">
                <th className="p-4 text-secondary font-semibold">Tên Phim</th>
                <th className="p-4 text-secondary font-semibold">Định Dạng</th>
                <th className="p-4 text-secondary font-semibold">Chất Lượng</th>
                <th className="p-4 text-secondary font-semibold">Năm</th>
                <th className="p-4 text-secondary font-semibold">Phân Hạng VIP</th>
                <th className="p-4 text-secondary font-semibold text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-on-surface">{movie.name}</div>
                      <div className="text-xs text-secondary">{movie.originName}</div>
                    </td>
                    <td className="p-4 text-secondary">{movie.type}</td>
                    <td className="p-4">
                      <span className="bg-white/5 text-on-surface px-2 py-0.5 rounded text-xs font-semibold">{movie.quality}</span>
                    </td>
                    <td className="p-4 text-secondary">{movie.year}</td>
                    <td className="p-4">
                      <Button 
                        variant="ghost"
                        onClick={() => handleTogglePremium(movie.id, movie.premiumOnly)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all h-auto
                          ${movie.premiumOnly 
                            ? 'bg-primary-container text-white hover:bg-primary-container/90' 
                            : 'bg-white/5 text-secondary hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        {movie.premiumOnly ? <ShieldAlert size={12} /> : <Shield size={12} />}
                        {movie.premiumOnly ? 'VIP/Premium' : 'Miễn Phí'}
                      </Button>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer h-8 w-8"
                        title="Xóa phim"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-secondary">
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
