'use client';

import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Loader2 
} from 'lucide-react';
import { api } from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Parallax coordinates
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 60;
      const y = (e.clientY - window.innerHeight / 2) / 60;
      setParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Call login endpoint
      const loginRes = await api.post<{ accessToken: string; username: string }>('/auth/login', {
        email,
        password
      });

      const token = loginRes.result.accessToken;
      
      // Save token temporarily to make the next request
      localStorage.setItem('token', token);

      // 2. Call my-info endpoint to verify role
      const infoRes = await api.get<{ roles: string[] }>('/users/my-info');
      const roles = infoRes.result.roles || [];
      const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

      if (!isAdmin) {
        localStorage.removeItem('token');
        setError('Tài khoản này không có quyền quản trị viên.');
        setIsLoading(false);
        return;
      }

      // 3. Save details and redirect
      localStorage.setItem('user', JSON.stringify(infoRes.result));
      window.location.href = '/';
    } catch (err: any) {
      localStorage.removeItem('token');
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container relative flex items-center justify-center min-h-screen w-screen overflow-hidden p-[20px] bg-[#0c0c0c] text-[#e5e2e1]">
      
      {/* Cinematic Background Image */}
      <div className="cinematic-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          alt="Cinema Backdrop" 
          className="w-full h-full object-cover transition-transform duration-700 ease-out" 
          src="/cinema_backdrop.png"
          style={{ transform: `scale(1.1) translate(${parallax.x}px, ${parallax.y}px)` }}
        />
        {/* Ambient lighting overlays */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, #e50914 0%, transparent 40%), radial-gradient(circle at 80% 70%, #1c1b1b 0%, transparent 50%)',
            mixBlendMode: 'color-dodge'
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAD0lEQVQImWNgGAWjYBQMBgAFAAHf98N6AAAAAElFTkSuQmCC")`
          }}
        />
      </div>

      {/* Main Layout Container */}
      <div className="relative w-full max-w-5xl flex items-center justify-center gap-16 z-10">
        
        {/* Left Side: Artistic Quote (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col items-center gap-8 self-center animate-[fadeIn_0.8s_ease-out]">
          <div className="artistic-line" />
          <p className="quote-text uppercase text-2xl font-light text-center">
            Cinema is the most beautiful fraud in the world.
          </p>
          <div className="artistic-line" />
        </div>

        {/* Login Card Container */}
        <main className="w-full max-w-[460px] relative">
          
          {/* Outer Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t border-l border-[#e50914]/40 rounded-tl-lg pointer-events-none z-20" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t border-r border-[#e50914]/40 rounded-tr-lg pointer-events-none z-20" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b border-l border-[#e50914]/40 rounded-bl-lg pointer-events-none z-20" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b border-r border-[#e50914]/40 rounded-br-lg pointer-events-none z-20" />

          {/* Coordinate Markers */}
          <div className="absolute -top-6 -left-6 text-[8px] text-white/20 select-none hidden md:block tracking-widest font-mono">
            LAT 34.0522 N
          </div>
          <div className="absolute -bottom-6 -right-6 text-[8px] text-white/20 select-none hidden md:block tracking-widest font-mono">
            LNG 118.2437 W
          </div>

          {/* Actual Card Panel */}
          <div className="glass-card rounded-2xl p-10 md:p-14 flex flex-col items-stretch relative overflow-hidden">
            
            {/* Scanning Line Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-10">
              <div className="w-full h-[1px] bg-white/40 absolute top-0 animate-scan" />
            </div>

            {/* Branding Section */}
            <div className="mb-8 z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#e50914] rounded flex items-center justify-center">
                  <Film className="text-white w-6 h-6" />
                </div>
                <h1 className="text-3xl text-slate-100 tracking-tight font-extrabold uppercase italic">
                  Cine<span className="text-[#e50914]">Admin</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-[0.3em] font-semibold border-l-2 border-[#e50914] pl-3">
                Executive Management
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold z-10">
                {error}
              </div>
            )}

            {/* Form Section */}
            <form className="space-y-8 z-10" onSubmit={handleLogin}>
              
              {/* Access ID */}
              <div className="space-y-3 group">
                <label className="text-[11px] uppercase tracking-widest text-slate-400 ml-1 font-bold block" htmlFor="email">
                  Access ID
                </label>
                <div className="relative border-b border-white/10 transition-colors duration-200 focus-within:border-[#e50914] flex items-center pb-1">
                  <Mail className="absolute left-0 text-slate-500 w-5 h-5 transition-colors duration-200 group-focus-within:text-[#e50914]" />
                  <input 
                    required
                    className="w-full h-10 pl-8 bg-transparent border-none text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-0 text-sm" 
                    id="email" 
                    placeholder="email@cineadmin.pro" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Security Key */}
              <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] uppercase tracking-widest text-slate-400 ml-1 font-bold block" htmlFor="password">
                    Security Key
                  </label>
                  <a 
                    className="text-[10px] uppercase tracking-wider text-[#e50914]/80 hover:text-[#e50914] transition-colors duration-200 font-bold" 
                    href="#reset"
                    onClick={(e) => e.preventDefault()}
                  >
                    Reset Access
                  </a>
                </div>
                <div className="relative border-b border-white/10 transition-colors duration-200 focus-within:border-[#e50914] flex items-center pb-1">
                  <Lock className="absolute left-0 text-slate-500 w-5 h-5 transition-colors duration-200 group-focus-within:text-[#e50914]" />
                  <input 
                    required
                    className="w-full h-10 pl-8 pr-10 bg-transparent border-none text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-0 text-sm" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-0 text-slate-500 hover:text-[#e50914] transition-colors duration-200 cursor-pointer focus:outline-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Keep active session checkbox */}
              <div className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  className="w-4 h-4 rounded-sm border-white/10 bg-white/5 text-[#e50914] focus:ring-[#e50914] focus:ring-offset-0 cursor-pointer" 
                  id="remember" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label 
                  className="text-[11px] uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors duration-200 cursor-pointer select-none" 
                  htmlFor="remember"
                >
                  Keep session active
                </label>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <button 
                  disabled={isLoading}
                  className="glow-button w-full h-[56px] bg-[#e50914] text-white text-xs uppercase tracking-widest font-bold rounded flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group" 
                  type="submit"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Authorize Access</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Section */}
            <div className="mt-14 pt-8 border-t border-white/5 flex justify-between items-center opacity-40 z-10 text-slate-400">
              <p className="text-[9px] uppercase tracking-wider">
                © 2026 CineAdmin Professional
              </p>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4" />
                <Zap className="w-4 h-4" />
              </div>
            </div>

          </div>
        </main>

        {/* Right Side Background Text detail */}
        <div className="hidden xl:block absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none z-0">
          <span className="text-[200px] font-black leading-none tracking-widest text-slate-100">
            FILM
          </span>
        </div>

      </div>
    </div>
  );
}
