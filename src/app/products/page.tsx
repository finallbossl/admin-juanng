'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Film, Trash2, Shield, ShieldAlert, Search, Plus, Save, Database, Upload, Globe, Users, Tv, Play, Image, Layers, Sparkles, Check, ArrowLeft, Eye } from 'lucide-react';
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

// Helper to slugify Vietnamese text
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w\-]+/g, '') // remove non-word chars
    .replace(/\-\-+/g, '-'); // replace multiple - with single -
}

const AVAILABLE_GENRES = [
  'Hành động', 'Viễn tưởng', 'Kinh dị', 'Tình cảm', 'Hài hước', 
  'Hoạt hình', 'Cổ trang', 'Tài liệu', 'Phiêu lưu', 'Hình sự', 
  'Chiến tranh', 'Tâm lý', 'Bí ẩn', 'Võ thuật', 'Giật gân'
];

const AVAILABLE_COUNTRIES = [
  'Trung Quốc', 'Hàn Quốc', 'Mỹ', 'Nhật Bản', 'Việt Nam', 
  'Thái Lan', 'Hồng Kông', 'Đài Loan', 'Ấn Độ', 'Anh', 'Pháp'
];

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

  // Dual tab state
  const [activeAddTab, setActiveAddTab] = useState<'sync' | 'manual'>('sync');

  // API Sync States
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [syncMethod, setSyncMethod] = useState<'page' | 'preview'>('page');
  const [pageNumber, setPageNumber] = useState('1');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);

  // Manual Add Form States
  const [name, setName] = useState('');
  const [originName, setOriginName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [thumbUrl, setThumbUrl] = useState('');
  
  // Categorization
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [type, setType] = useState('single'); // single | series | chieurap
  const [actorInput, setActorInput] = useState('');
  const [actors, setActors] = useState<string[]>([]);
  const [directorInput, setDirectorInput] = useState('');
  const [directors, setDirectors] = useState<string[]>([]);

  // Specs & Release
  const [episodeTotal, setEpisodeTotal] = useState('1');
  const [time, setTime] = useState('');
  const [quality, setQuality] = useState('HD');
  const [lang, setLang] = useState('Vietsub');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [premiumOnly, setPremiumOnly] = useState(false);

  // Dynamic Episodes
  const [episodes, setEpisodes] = useState<Array<{
    name: string;
    slug: string;
    serverName: string;
    linkEmbed: string;
    linkM3u8: string;
  }>>([]);

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

  const fetchSources = async () => {
    try {
      const res = await api.get<any[]>('/catalog/sync/sources');
      const list = res.result || [];
      setSources(list);
      if (list.length > 0) {
        setSelectedSourceId(list[0].id.toString());
      }
    } catch (err) {
      console.error('Không thể lấy nguồn phim:', err);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchSources();
  }, []);

  // Update searchQuery if there is a 'search' param in the URL
  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Handle Slug Auto Generation from Name
  useEffect(() => {
    if (name) {
      setSlug(slugify(name));
    } else {
      setSlug('');
    }
  }, [name]);

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

  // Sync Log Sequential Crawler
  const startCrawl = async (slugsToCrawl: string[]) => {
    if (!selectedSourceId) {
      alert('Vui lòng chọn nguồn phim.');
      return;
    }
    setSyncing(true);
    setProgressCurrent(0);
    setProgressTotal(slugsToCrawl.length);
    setProgressLogs([`[Hệ thống] Bắt đầu đồng bộ danh sách gồm ${slugsToCrawl.length} phim...`]);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < slugsToCrawl.length; i++) {
      const currentSlug = slugsToCrawl[i];
      setProgressLogs(prev => [...prev, `[Đang tải] Tiến hành cào chi tiết: ${currentSlug}...`]);
      try {
        const res = await api.post<string[]>(`/catalog/sync/sources/${selectedSourceId}/crawl-selected`, {
          slugs: [currentSlug]
        });
        const isSuccess = res.result && res.result.includes(currentSlug);
        if (isSuccess) {
          successCount++;
          setProgressLogs(prev => [...prev, `[Thành công] Phim (slug: ${currentSlug}) - Đã lưu thành công.`]);
        } else {
          failCount++;
          setProgressLogs(prev => [...prev, `[Thất bại] Phim (slug: ${currentSlug}) - Server bỏ qua hoặc không lưu được.`]);
        }
      } catch (err: any) {
        failCount++;
        setProgressLogs(prev => [...prev, `[Thất bại] Phim (slug: ${currentSlug}) - Lỗi: ${err.message || 'Mất kết nối.'}`]);
      }
      setProgressCurrent(i + 1);
    }

    setProgressLogs(prev => [
      ...prev,
      `[Hoàn tất] Kết thúc quá trình đồng bộ. Thành công: ${successCount}, Thất bại: ${failCount}.`
    ]);
    setSyncing(false);
    fetchMovies();
  };

  // Crawl Page Option A
  const handleCrawlPage = async () => {
    if (!selectedSourceId) {
      alert('Vui lòng cấu hình nguồn.');
      return;
    }
    setSyncing(true);
    setProgressCurrent(0);
    setProgressTotal(1);
    setProgressLogs([`[Hệ thống] Đang tải danh sách phim của trang ${pageNumber}...`]);

    try {
      const res = await api.get<any>(`/catalog/sync/sources/${selectedSourceId}/fetch-list?page=${pageNumber}`);
      const items = res.result?.items || [];
      if (items.length === 0) {
        setProgressLogs(prev => [...prev, `[Cảnh báo] Không tìm thấy phim nào trên trang ${pageNumber}.`]);
        setSyncing(false);
        return;
      }
      const slugs = items.map((x: any) => x.slug);
      await startCrawl(slugs);
    } catch (err: any) {
      setProgressLogs(prev => [...prev, `[Lỗi] Không tải được danh sách phim trang ${pageNumber}: ${err.message}`]);
      setSyncing(false);
    }
  };

  // Fetch Preview Option B
  const handleFetchPreview = async () => {
    if (!selectedSourceId) {
      alert('Vui lòng chọn nguồn phim trước.');
      return;
    }
    setPreviewLoading(true);
    setPreviewItems([]);
    setSelectedSlugs([]);
    try {
      const res = await api.get<any>(`/catalog/sync/sources/${selectedSourceId}/fetch-list?page=${pageNumber}`);
      const items = res.result?.items || [];
      setPreviewItems(items);
    } catch (err: any) {
      alert(err.message || 'Không thể tải danh sách xem trước.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Manual Add Form Submit Handler
  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    const slugValue = slug || slugify(name);

    // Group episodes by server_name
    const groupedEpisodes = episodes.reduce((acc: any[], ep) => {
      const serverName = ep.serverName || 'Vietsub #1';
      let server = acc.find(s => s.server_name === serverName);
      if (!server) {
        server = { server_name: serverName, server_data: [] };
        acc.push(server);
      }
      server.server_data.push({
        name: ep.name,
        slug: ep.slug || slugify(ep.name),
        filename: ep.name,
        link_embed: ep.linkEmbed,
        link_m3u8: ep.linkM3u8
      });
      return acc;
    }, []);

    try {
      await api.post('/catalog/sync/movie', {
        status: true,
        msg: 'success',
        movie: {
          name,
          origin_name: originName,
          slug: slugValue,
          content: description,
          type: type === 'chieurap' ? 'single' : type,
          chieurap: type === 'chieurap',
          poster_url: posterUrl,
          thumb_url: thumbUrl,
          time: time ? (time.includes('phút') ? time : `${time} phút`) : 'Chưa rõ',
          quality,
          lang,
          year: parseInt(year) || new Date().getFullYear(),
          episode_current: episodes.length > 0 ? episodes[episodes.length - 1].name : 'Hoàn tất',
          episode_total: episodeTotal || (episodes.length > 0 ? episodes.length.toString() : '1'),
          is_premium_only: premiumOnly,
          actor: actors,
          director: directors,
          category: selectedGenres.map(g => ({ name: g, slug: slugify(g) })),
          country: selectedCountries.map(c => ({ name: c, slug: slugify(c) }))
        },
        episodes: groupedEpisodes
      });

      setFormSuccess('Thêm phim thủ công thành công!');
      
      // Reset form
      setName('');
      setOriginName('');
      setSlug('');
      setDescription('');
      setPosterUrl('');
      setThumbUrl('');
      setSelectedGenres([]);
      setSelectedCountries([]);
      setActors([]);
      setDirectors([]);
      setEpisodeTotal('1');
      setTime('');
      setPremiumOnly(false);
      setEpisodes([]);

      fetchMovies();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi thêm phim thủ công.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleActorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (actorInput.trim() && !actors.includes(actorInput.trim())) {
        setActors([...actors, actorInput.trim()]);
        setActorInput('');
      }
    }
  };

  const handleDirectorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (directorInput.trim() && !directors.includes(directorInput.trim())) {
        setDirectors([...directors, directorInput.trim()]);
        setDirectorInput('');
      }
    }
  };

  const addEpisodeField = () => {
    const nextNum = episodes.length + 1;
    const nameStr = `Tập ${nextNum < 10 ? '0' + nextNum : nextNum}`;
    setEpisodes([...episodes, {
      name: nameStr,
      slug: slugify(nameStr),
      serverName: 'Vietsub #1',
      linkEmbed: '',
      linkM3u8: ''
    }]);
  };

  const updateEpisode = (index: number, field: string, value: string) => {
    setEpisodes(prev => prev.map((ep, i) => {
      if (i === index) {
        const updated = { ...ep, [field]: value };
        if (field === 'name') {
          updated.slug = slugify(value);
        }
        return updated;
      }
      return ep;
    }));
  };

  const removeEpisode = (index: number) => {
    setEpisodes(prev => prev.filter((_, i) => i !== index));
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

  // View 1: Advanced Add Movie View Selector (Dual-Mode UI)
  if (isAddMode) {
    const progressPercent = progressTotal > 0 ? Math.round((progressCurrent / progressTotal) * 100) : 0;

    return (
      <div className="mx-auto w-full max-w-[1400px] px-2 sm:px-4 md:px-6 flex flex-col pb-12" style={{ gap: '28px' }}>
        {/* Dynamic header row with navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-secondary)]/50 backdrop-blur-md p-6 rounded-2xl border border-[var(--border-color)]">
          <div className="flex flex-col" style={{ gap: '6px' }}>
            <h1 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
              Thêm Phim Vào Hệ Thống
            </h1>
            <p className="text-secondary text-xs">Cấu hình đồng bộ thông minh từ nguồn API hoặc xây dựng nội dung phim độc quyền.</p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/products')}
            className="border-[var(--border-color)] text-secondary hover:bg-[var(--bg-hover)] hover:text-on-surface cursor-pointer text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all duration-200"
          >
            <ArrowLeft size={14} />
            Quay lại danh sách
          </Button>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[var(--bg-secondary)]/30 p-1.5 rounded-xl border border-[var(--border-color)] max-w-md">
          <button
            type="button"
            onClick={() => {
              setActiveAddTab('sync');
              setFormSuccess('');
              setFormError('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center gap-2
              ${activeAddTab === 'sync' 
                ? 'bg-primary-container text-white shadow-sm shadow-primary-container/20' 
                : 'text-secondary hover:text-on-surface'
              }`}
          >
            <Database size={13} />
            Đồng bộ tự động (API Sync)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveAddTab('manual');
              setFormSuccess('');
              setFormError('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all duration-200 cursor-pointer select-none text-center flex items-center justify-center gap-2
              ${activeAddTab === 'manual' 
                ? 'bg-primary-container text-white shadow-sm shadow-primary-container/20' 
                : 'text-secondary hover:text-on-surface'
              }`}
          >
            <Upload size={13} />
            Thêm thủ công (Manual Add)
          </button>
        </div>

        {/* TAB 1: AUTOMATED API SYNC */}
        {activeAddTab === 'sync' && (
          <div className="flex flex-col gap-6">
            {/* API Sync Card — plain div, no Shadcn Card */}
            <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
              {/* Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="font-semibold text-on-surface text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-[var(--accent)]" />
                  Cấu hình đồng bộ API
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: '32px' }} className="space-y-8">
                
                {/* 1. Interactive Sync Source Selector Cards */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider">Bước 1: Chọn nguồn phim (Sync Source)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sources.map(src => {
                      const isSelected = selectedSourceId === src.id.toString();
                      let domain = 'unknown';
                      try {
                        domain = new URL(src.detailUrlBase).hostname;
                      } catch (e) {}
                      
                      return (
                        <div
                          key={src.id}
                          onClick={() => setSelectedSourceId(src.id.toString())}
                          className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-4
                            ${isSelected 
                              ? 'bg-[var(--accent-dim)]/20 border-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]' 
                              : 'bg-[var(--bg-hover)]/30 border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-hover)]'
                            }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm font-semibold
                              ${isSelected ? 'bg-primary-container text-white' : 'bg-[var(--bg-hover)] text-secondary'}`}>
                              🌐
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-on-surface truncate">{src.name}</div>
                              <div className="text-[10px] text-secondary truncate mt-1">{domain}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${src.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-[8.5px] font-bold text-secondary uppercase">{src.active ? 'ACTIVE' : 'INACTIVE'}</span>
                          </div>
                        </div>
                      );
                    })}
                    {sources.length === 0 && (
                      <div className="col-span-3 text-center py-10 text-xs text-secondary border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-hover)]/10">
                        Không có cấu hình nguồn cào nào khả dụng.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Side-by-Side Sync Method Panel Cards */}
                <div className="space-y-6" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider" style={{ display: 'block' }}>Bước 2: Lựa chọn phương thức & Thực hiện</label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    
                    {/* Method A Selector Card */}
                    <div 
                      onClick={() => setSyncMethod('page')}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        border: syncMethod === 'page' ? '1px solid var(--border-accent)' : '1px solid var(--border-color)',
                        background: syncMethod === 'page' ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: syncMethod === 'page' ? '0 0 15px var(--accent-glow)' : 'none',
                      }}
                      className="hover:border-[var(--border-hover)]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Layers size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-sm text-on-surface">Đồng bộ tự động (Crawl Page)</span>
                          {syncMethod === 'page' && (
                            <span className="text-[9px] font-bold bg-[var(--accent)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Chọn</span>
                          )}
                        </div>
                        <p className="text-xs text-secondary leading-relaxed">Cào & lưu toàn bộ phim của trang.</p>
                      </div>
                    </div>

                    {/* Method B Selector Card */}
                    <div 
                      onClick={() => setSyncMethod('preview')}
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        border: syncMethod === 'preview' ? '1px solid var(--border-accent)' : '1px solid var(--border-color)',
                        background: syncMethod === 'preview' ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: syncMethod === 'preview' ? '0 0 15px var(--accent-glow)' : 'none',
                      }}
                      className="hover:border-[var(--border-hover)]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Eye size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-sm text-on-surface">Xem trước & Chọn phim</span>
                          {syncMethod === 'preview' && (
                            <span className="text-[9px] font-bold bg-[var(--accent)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Chọn</span>
                          )}
                        </div>
                        <p className="text-xs text-secondary leading-relaxed">Tải danh sách xem trước rồi lọc phim.</p>
                      </div>
                    </div>

                  </div>

                  {/* Active Sync Method Action Form Panel */}
                  <div 
                    style={{ 
                      padding: '24px', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border-color)', 
                      background: 'rgba(255, 255, 255, 0.015)' 
                    }}
                    className="space-y-4"
                  >
                    {syncMethod === 'page' ? (
                      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                        <div style={{ flex: 1 }}>
                          <h5 className="font-bold text-xs text-on-surface mb-1">Cấu hình trang đồng bộ</h5>
                          <p className="text-[11px] text-secondary mb-3">Nhập số trang từ nguồn API cần cào và đồng bộ tự động toàn bộ.</p>
                          <input
                            type="number"
                            min="1"
                            value={pageNumber}
                            onChange={(e) => setPageNumber(e.target.value)}
                            disabled={syncing}
                            style={{ padding: '0 16px', height: '44px', width: '100%', boxSizing: 'border-box' }}
                            className="bg-surface text-on-surface text-xs rounded-xl border border-[var(--border-color)] focus:ring-2 focus:ring-primary-container outline-none"
                            placeholder="Ví dụ: 1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCrawlPage}
                          disabled={syncing}
                          style={{ padding: '0 24px', height: '44px' }}
                          className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-bold shadow-md text-xs rounded-xl transition-all whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {syncing ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Đang đồng bộ...</span>
                            </>
                          ) : (
                            <>
                              <Layers size={14} />
                              <span>Đồng bộ trang này</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                        <div style={{ flex: 1 }}>
                          <h5 className="font-bold text-xs text-on-surface mb-1">Tải danh sách trang xem trước</h5>
                          <p className="text-[11px] text-secondary mb-3">Nhập số trang cần hiển thị trước danh sách phim để lọc chọn.</p>
                          <input
                            type="number"
                            min="1"
                            value={pageNumber}
                            onChange={(e) => setPageNumber(e.target.value)}
                            disabled={previewLoading || syncing}
                            style={{ padding: '0 16px', height: '44px', width: '100%', boxSizing: 'border-box' }}
                            className="bg-surface text-on-surface text-xs rounded-xl border border-[var(--border-color)] focus:ring-2 focus:ring-primary-container outline-none"
                            placeholder="Ví dụ: 1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleFetchPreview}
                          disabled={previewLoading || syncing}
                          style={{ padding: '0 24px', height: '44px' }}
                          className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-bold shadow-md text-xs rounded-xl transition-all whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {previewLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Đang tải...</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              <span>Tải xem trước</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* 3. Items Selection Table (For Method B Preview) */}
                {syncMethod === 'preview' && (
                  <div className="space-y-4">
                    {previewItems.length > 0 && (
                      <div className="space-y-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                        <div className="flex justify-between items-center bg-[var(--bg-secondary)]/50 rounded-xl border border-[var(--border-color)]" style={{ padding: '16px' }}>
                          <span className="text-xs font-semibold text-on-surface">Tìm thấy {previewItems.length} tác phẩm trên trang {pageNumber}</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs text-secondary hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] cursor-pointer rounded-xl transition-all"
                              style={{ padding: '6px 12px' }}
                              onClick={() => setSelectedSlugs(previewItems.map(x => x.slug))}
                            >
                              Chọn tất cả
                            </button>
                            <button
                              type="button"
                              className="text-xs text-secondary hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer rounded-xl transition-all"
                              style={{ padding: '6px 12px' }}
                              onClick={() => setSelectedSlugs([])}
                            >
                              Bỏ chọn tất cả
                            </button>
                          </div>
                        </div>

                        {/* Beautiful Preview Grid/List Layout */}
                        <div className="max-h-[380px] overflow-y-auto border border-[var(--border-color)] rounded-2xl divide-y divide-[var(--border-color)] bg-surface shadow-inner">
                          {previewItems.map((item, idx) => {
                            const isChecked = selectedSlugs.includes(item.slug);
                            return (
                              <div 
                                key={idx} 
                                onClick={() => {
                                  setSelectedSlugs(prev =>
                                    prev.includes(item.slug)
                                      ? prev.filter(s => s !== item.slug)
                                      : [...prev, item.slug]
                                  );
                                }}
                                className={`flex items-center gap-4 hover:bg-[var(--bg-hover)] transition-all cursor-pointer select-none
                                  ${isChecked ? 'bg-[var(--accent-dim)]/20' : ''}`}
                                style={{ padding: '16px' }}
                              >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="w-4 h-4 rounded text-primary border-[var(--border-color)] cursor-pointer"
                                  />
                                  
                                  {/* Thumbnail Poster */}
                                  <div className="w-12 h-16 rounded-xl bg-[var(--bg-hover)] overflow-hidden flex-shrink-0 border border-[var(--border-color)] flex items-center justify-center">
                                    {item.posterUrl || item.thumbUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={item.posterUrl || item.thumbUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      />
                                    ) : (
                                      <Film className="h-5 w-5 text-secondary" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-xs text-on-surface truncate flex items-center gap-1.5">
                                      {item.name}
                                      {isChecked && <Check size={12} className="text-[var(--accent)]" />}
                                    </div>
                                    <div className="text-[10px] text-secondary truncate mt-1">{item.originName || item.slug}</div>
                                  </div>

                                  <div className="flex items-center gap-4 text-right" style={{ paddingRight: '8px' }}>
                                    <span className="text-[10px] bg-[var(--bg-hover)] text-secondary border border-[var(--border-color)] rounded-full font-semibold" style={{ padding: '4px 12px' }}>
                                      {item.year || '2026'}
                                    </span>
                                    <span className="text-[10px] text-[var(--accent)] font-bold bg-[var(--accent-dim)] border border-[var(--accent-accent)] rounded-xl" style={{ padding: '4px 10px' }}>
                                      {item.episodeCurrent || 'Full'}
                                    </span>
                                  </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-end" style={{ paddingTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => startCrawl(selectedSlugs)}
                            disabled={selectedSlugs.length === 0 || syncing}
                            style={{ padding: '10px 24px' }}
                            className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-bold shadow-md shadow-primary-container/20 rounded-xl text-xs transition-colors disabled:opacity-50"
                          >
                            Bắt đầu đồng bộ {selectedSlugs.length} phim đã chọn
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL ADD FORM - ADVANCED 2-COLUMN LAYOUT */}
        {activeAddTab === 'manual' && (
          <form onSubmit={handleManualAddSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {formSuccess && (
              <div className="lg:col-span-3 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-5 py-4 rounded-2xl text-xs flex items-center gap-2">
                <Check size={16} />
                {formSuccess}
              </div>
            )}
            {formError && (
              <div className="lg:col-span-3 text-red-300 bg-red-500/10 border border-red-500/20 px-5 py-4 rounded-2xl text-xs flex items-center gap-2">
                <ShieldAlert size={16} />
                {formError}
              </div>
            )}
            
            {/* Left 2 Columns: Main Details + Episode List */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Card 1: Basic Info */}
              <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="font-semibold text-on-surface text-base flex items-center gap-2">
                    <Film className="h-5 w-5 text-[var(--accent)]" />
                    Thông tin cơ bản (Basic Info)
                  </div>
                </div>
                <div style={{ padding: '32px' }} className="space-y-6">
                  
                  {/* Name inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-xs font-semibold text-secondary">Tên Phim (Tiếng Việt) *</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Ví dụ: Người Sắt 3" 
                        required
                        style={{ padding: '0 16px', height: '44px' }}
                        className="w-full bg-surface border border-[var(--border-color)] text-on-surface focus:ring-2 focus:ring-primary-container outline-none rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-xs font-semibold text-secondary">Tên Gốc (Tiếng Anh/Gốc) *</label>
                      <input 
                        type="text" 
                        value={originName} 
                        onChange={(e) => setOriginName(e.target.value)} 
                        placeholder="Ví dụ: Iron Man 3" 
                        required
                        style={{ padding: '0 16px', height: '44px' }}
                        className="w-full bg-surface border border-[var(--border-color)] text-on-surface focus:ring-2 focus:ring-primary-container outline-none rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Slug Auto Generate */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-secondary">Slug phát trực tuyến (Tự động cập nhật)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">/movie/</span>
                      <input 
                        type="text" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)} 
                        placeholder="nguoi-sat-3" 
                        style={{ paddingLeft: '68px', paddingRight: '16px', height: '44px' }}
                        className="w-full bg-surface border border-[var(--border-color)] text-on-surface font-mono rounded-xl outline-none focus:ring-2 focus:ring-primary-container text-sm"
                      />
                    </div>
                  </div>

                  {/* Description Synopsis */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-secondary">Tóm tắt nội dung kịch bản *</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập tóm tắt cốt truyện của phim..."
                      rows={5}
                      required
                      className="w-full bg-surface text-on-surface border border-[var(--border-color)] rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-container outline-none transition-all min-h-[140px] leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Dynamic Episodes Manager */}
              <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <div className="flex flex-row items-center justify-between gap-4" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="font-semibold text-on-surface text-base flex items-center gap-2">
                    <Play className="h-5 w-5 text-[var(--accent)]" />
                    Danh sách tập phim phát sóng
                  </div>
                  <button
                    type="button"
                    onClick={addEpisodeField}
                    style={{ padding: '8px 16px' }}
                    className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-bold shadow-sm text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    Thêm tập phim
                  </button>
                </div>
                <div style={{ padding: '32px' }} className="space-y-6">
                  {episodes.length === 0 ? (
                    <div className="text-center py-12 text-xs text-secondary border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-hover)]/25 flex flex-col items-center gap-3">
                      <Play className="h-9 w-9 text-slate-600 animate-pulse" />
                      <span className="font-medium">Chưa cấu hình tập phim. Nhấn "+ Thêm tập phim" để nhập dữ liệu streaming.</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {episodes.map((ep, idx) => (
                        <div key={idx} className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-hover)]/30 space-y-4 relative group/ep transition-all hover:border-[var(--border-hover)]">
                          <div className="absolute top-5 right-5">
                            <button
                              type="button"
                              onClick={() => removeEpisode(idx)}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                              title="Xóa tập"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pr-10">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Tên tập phim</label>
                              <input
                                type="text"
                                value={ep.name}
                                onChange={(e) => updateEpisode(idx, 'name', e.target.value)}
                                placeholder="Ví dụ: Tập 01"
                                style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface rounded-xl outline-none focus:ring-2 focus:ring-primary-container text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Đường dẫn slug</label>
                              <input
                                type="text"
                                value={ep.slug}
                                onChange={(e) => updateEpisode(idx, 'slug', e.target.value)}
                                placeholder="tap-01"
                                style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface font-mono rounded-xl outline-none focus:ring-2 focus:ring-primary-container text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Tên Server phát</label>
                              <input
                                type="text"
                                value={ep.serverName}
                                onChange={(e) => updateEpisode(idx, 'serverName', e.target.value)}
                                placeholder="Vietsub #1"
                                style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface rounded-xl outline-none focus:ring-2 focus:ring-primary-container text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Link nhúng Iframe (Embed) *</label>
                              <input
                                type="url"
                                value={ep.linkEmbed}
                                onChange={(e) => updateEpisode(idx, 'linkEmbed', e.target.value)}
                                placeholder="https://example.com/embed/ep1"
                                style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Link HLS Streaming (M3U8)</label>
                              <input
                                type="url"
                                value={ep.linkM3u8}
                                onChange={(e) => updateEpisode(idx, 'linkM3u8', e.target.value)}
                                placeholder="https://example.com/hls/ep1.m3u8"
                                style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-container"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Media, Specifications, and Categories */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              
              {/* Card 3: Images & Previews */}
              <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="font-semibold text-on-surface text-sm flex items-center gap-2">
                    <Image className="h-4 w-4 text-[var(--accent)]" />
                    Tài nguyên hình ảnh (Assets)
                  </div>
                </div>
                <div style={{ padding: '24px' }} className="space-y-5">
                  
                  {/* Poster Link */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-secondary">Ảnh Poster (Đứng - 3:4)</label>
                    <input 
                      type="url" 
                      value={posterUrl} 
                      onChange={(e) => setPosterUrl(e.target.value)} 
                      placeholder="Nhập đường dẫn URL poster..." 
                      style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary-container"
                    />
                    {posterUrl && (
                      <div className="mt-3 w-full h-44 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-hover)] relative flex items-center justify-center p-2 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={posterUrl} 
                          alt="Poster preview" 
                          className="w-full h-full object-contain rounded-lg" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Link */}
                  <div className="space-y-2 border-t border-[var(--border-color)] pt-5">
                    <label className="text-xs font-semibold text-secondary">Ảnh Thumbnail (Ngang - 16:9)</label>
                    <input 
                      type="url" 
                      value={thumbUrl} 
                      onChange={(e) => setThumbUrl(e.target.value)} 
                      placeholder="Nhập đường dẫn URL thumbnail..." 
                      style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary-container"
                    />
                    {thumbUrl && (
                      <div className="mt-3 w-full h-32 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-hover)] relative flex items-center justify-center p-2 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={thumbUrl} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-contain rounded-lg" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 4: Specs & Pricing */}
              <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="font-semibold text-on-surface text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[var(--accent)]" />
                    Thông số & Phát hành
                  </div>
                </div>
                <div style={{ padding: '24px' }} className="space-y-5">
                  
                  {/* Quality & Lang */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Chất lượng</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full bg-surface text-on-surface border border-[var(--border-color)] rounded-xl px-3 h-11 text-xs focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
                      >
                        <option value="HD">HD</option>
                        <option value="FHD">Full HD</option>
                        <option value="2K">2K</option>
                        <option value="4K">4K</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Ngôn ngữ</label>
                      <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="w-full bg-surface text-on-surface border border-[var(--border-color)] rounded-xl px-3 h-11 text-xs focus:ring-2 focus:ring-primary-container outline-none cursor-pointer"
                      >
                        <option value="Vietsub">Vietsub</option>
                        <option value="Thuyết Minh">Thuyết Minh</option>
                        <option value="Lồng Tiếng">Lồng Tiếng</option>
                        <option value="Vietsub + TM">Vietsub + Thuyết Minh</option>
                      </select>
                    </div>
                  </div>

                  {/* Year & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Năm phát hành</label>
                      <input 
                        type="number" 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)} 
                        style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary-container"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Thời lượng (phút)</label>
                      <input 
                        type="text" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                        placeholder="120"
                        style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary-container"
                      />
                    </div>
                  </div>

                  {/* Total Episodes count */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Tổng số tập (Dự kiến)</label>
                    <input 
                      type="text" 
                      value={episodeTotal} 
                      onChange={(e) => setEpisodeTotal(e.target.value)} 
                      placeholder="1"
                      style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>

                  {/* VIP Access Toggle Switch */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-hover)]/30 mt-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-on-surface">Premium Only (VIP)</span>
                      <span className="text-[10px] text-secondary">Chỉ thành viên gói Premium</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={premiumOnly}
                        onChange={(e) => setPremiumOnly(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]" style={{ transition: 'background-color 0.2s' }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 5: Classification Tags & Credits */}
              <div className="glass-panel rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="font-semibold text-on-surface text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[var(--accent)]" />
                    Phân loại & Đội ngũ (Credits)
                  </div>
                </div>
                <div style={{ padding: '32px' }} className="space-y-8">
                  
                  {/* Genres Multi-select tag manager */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Thể loại phim</label>
                    <div className="flex flex-wrap gap-2.5 py-1">
                      {AVAILABLE_GENRES.map((g) => {
                        const isSelected = selectedGenres.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setSelectedGenres(prev =>
                                prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer select-none
                              ${isSelected 
                                ? 'bg-primary-container text-white border-primary-container' 
                                : 'bg-surface text-secondary border-[var(--border-color)] hover:text-on-surface'
                              }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Countries Multi-select */}
                  <div className="space-y-3 border-t border-[var(--border-color)] pt-6">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Quốc gia sản xuất</label>
                    <div className="flex flex-wrap gap-2.5 py-1">
                      {AVAILABLE_COUNTRIES.map((c) => {
                        const isSelected = selectedCountries.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setSelectedCountries(prev =>
                                prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer select-none
                              ${isSelected 
                                ? 'bg-primary-container text-white border-primary-container' 
                                : 'bg-surface text-secondary border-[var(--border-color)] hover:text-on-surface'
                              }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actors Input */}
                  <div className="space-y-3 border-t border-[var(--border-color)] pt-6">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={12} />
                      Diễn viên (Nhấn Enter)
                    </label>
                    <input
                      type="text"
                      value={actorInput}
                      onChange={(e) => setActorInput(e.target.value)}
                      onKeyDown={handleActorKeyDown}
                      placeholder="Gõ tên rồi nhấn Enter..."
                      style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary-container"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {actors.map((act, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-[var(--accent-dim)] border border-[var(--border-accent)] text-[var(--accent)] text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {act}
                          <button 
                            type="button" 
                            onClick={() => setActors(actors.filter(x => x !== act))}
                            className="hover:text-rose-500 cursor-pointer text-[8px]"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Directors Input */}
                  <div className="space-y-3 border-t border-[var(--border-color)] pt-6">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={12} />
                      Đạo diễn (Nhấn Enter)
                    </label>
                    <input
                      type="text"
                      value={directorInput}
                      onChange={(e) => setDirectorInput(e.target.value)}
                      onKeyDown={handleDirectorKeyDown}
                      placeholder="Gõ tên rồi nhấn Enter..."
                      style={{ padding: "0 16px", height: "44px" }} className="w-full bg-surface border border-[var(--border-color)] text-on-surface text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary-container"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {directors.map((dir, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-[var(--accent-dim)] border border-[var(--border-accent)] text-[var(--accent)] text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {dir}
                          <button 
                            type="button" 
                            onClick={() => setDirectors(directors.filter(x => x !== dir))}
                            className="hover:text-rose-500 cursor-pointer text-[8px]"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Floating/Bottom Action Rows */}
            <div className="lg:col-span-3 flex justify-end gap-3 rounded-2xl bg-[var(--bg-secondary)]/50 backdrop-blur-md mt-6" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
              <button 
                type="button" 
                onClick={() => router.push('/products')}
                style={{ padding: '0 20px', height: '44px' }}
                className="border border-[var(--border-color)] text-secondary hover:bg-[var(--bg-hover)] hover:text-on-surface cursor-pointer rounded-xl text-xs"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={formLoading}
                style={{ padding: '0 24px', height: '44px' }}
                className="bg-primary-container hover:bg-primary-container/90 text-white cursor-pointer font-semibold shadow-md shadow-primary-container/20 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save size={14} />
                {formLoading ? 'Đang xử lý...' : 'Lưu lại & Thêm Phim'}
              </button>
            </div>

          </form>
        )}
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
