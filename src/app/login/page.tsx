'use client';

import React, { useState, useRef } from 'react';
import {
  Film,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Star,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/utils/api';

const FEATURE_ITEMS = [
  { icon: Film, label: 'Quản lý phim', desc: '10,000+ tựa phim' },
  { icon: Users, label: 'Quản lý người dùng', desc: '500K+ tài khoản' },
  { icon: Star, label: 'Phân tích dữ liệu', desc: 'Real-time insights' },
  { icon: Zap, label: 'Hiệu suất cao', desc: '99.9% uptime' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  // emailRef kept for potential programmatic focus usage
  const emailRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginRes = await api.post<{ accessToken: string; username: string }>('/auth/login', {
        username: email,
        email,
        password,
      });

      const token = loginRes.result.accessToken;
      localStorage.setItem('token', token);

      const infoRes = await api.get<{ roles: string[] }>('/users/my-info');
      const roles = infoRes.result.roles || [];
      const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

      if (!isAdmin) {
        localStorage.removeItem('token');
        setError('Tài khoản này không có quyền quản trị viên.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(infoRes.result));
      window.location.href = '/';
    } catch (err: any) {
      localStorage.removeItem('token');
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── LEFT PANEL: Cinematic Brand Story ─────────────────── */}
      <aside className="login-left" aria-hidden="true">
        {/* Background image with cinematic overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cinema_backdrop.png"
          alt="Cinema"
          className="login-left__bg"
        />

        {/* Gradient overlay layers */}
        <div className="login-left__overlay" />
        <div className="login-left__vignette" />

        {/* Animated ambient lights */}
        <div className="login-left__ambient login-left__ambient--1" />
        <div className="login-left__ambient login-left__ambient--2" />

        {/* Content */}
        <div className="login-left__content">

          {/* Logo */}
          <div className="login-left__logo">
            <div className="login-left__logo-icon">
              <Film size={22} />
            </div>
            <span className="login-left__logo-text">
              Cine<span>Admin</span>
            </span>
          </div>

          {/* Main headline */}
          <div className="login-left__headline">
            <div className="login-left__rec">
              <span className="login-left__rec-dot" />
              <span>REC · 4K</span>
            </div>
            <h1 className="login-left__title">
              Nền tảng quản lý<br />
              <span className="login-left__title-accent">rạp chiếu phim</span><br />
              chuyên nghiệp
            </h1>
            <p className="login-left__subtitle">
              Kiểm soát toàn bộ nội dung, người dùng và hệ thống phát trực tuyến của bạn từ một nơi duy nhất.
            </p>
          </div>

          {/* Feature grid */}
          <div className="login-left__features">
            {FEATURE_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="login-left__feature">
                <div className="login-left__feature-icon">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="login-left__feature-label">{label}</p>
                  <p className="login-left__feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom quote */}
          <blockquote className="login-left__quote">
            <Play size={12} className="login-left__quote-icon" />
            &ldquo;Cinema is the most beautiful fraud in the world.&rdquo;
            <cite>— Jean-Luc Godard</cite>
          </blockquote>
        </div>
      </aside>

      {/* ── RIGHT PANEL: Login Form ─────────────────────────────── */}
      <main className="login-right">

        {/* Mobile logo (only visible on small screens) */}
        <div className="login-right__mobile-logo">
          <div className="login-right__mobile-logo-icon">
            <Film size={18} />
          </div>
          <span>Cine<strong>Admin</strong></span>
        </div>

        {/* Form card */}
        <div className="login-card">

          {/* Card header */}
          <div className="login-card__header">
            <div className="login-card__badge">
              <ShieldCheck size={12} />
              <span>Truy cập bảo mật</span>
            </div>
            <h2 className="login-card__title">Đăng nhập</h2>
            <p className="login-card__subtitle">
              Nhập thông tin tài khoản quản trị viên của bạn
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="login-alert login-alert--error" role="alert">
              <AlertCircle size={16} className="login-alert__icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form" noValidate>

            {/* Email field */}
            <div className={`login-field ${activeInput === 'email' ? 'login-field--active' : ''} ${email ? 'login-field--filled' : ''}`}>
              <label className="login-field__label" htmlFor="email">
                Tài khoản / Email
              </label>
              <div className="login-field__wrapper">
                <span className="login-field__icon login-field__icon--left">
                  <Mail size={16} />
                </span>
                <input
                  ref={emailRef}
                  autoFocus
                  id="email"
                  type="email"
                  autoComplete="username email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                  placeholder="admin@cineadmin.vn"
                  className="login-field__input"
                />
                {email && (
                  <span className="login-field__icon login-field__icon--right login-field__icon--check">
                    <CheckCircle2 size={14} />
                  </span>
                )}
              </div>
            </div>

            {/* Password field */}
            <div className={`login-field ${activeInput === 'password' ? 'login-field--active' : ''} ${password ? 'login-field--filled' : ''}`}>
              <div className="login-field__label-row">
                <label className="login-field__label" htmlFor="password">
                  Mật khẩu
                </label>
                <a href="#reset" className="login-field__forgot" onClick={(e) => e.preventDefault()}>
                  Quên mật khẩu?
                </a>
              </div>
              <div className="login-field__wrapper">
                <span className="login-field__icon login-field__icon--left">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveInput('password')}
                  onBlur={() => setActiveInput(null)}
                  placeholder="••••••••••"
                  className="login-field__input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-field__icon login-field__icon--right login-field__toggle"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="login-form__options">
              <label className="login-checkbox" htmlFor="remember">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-checkbox__input"
                />
                <span className="login-checkbox__box" aria-hidden="true" />
                <span className="login-checkbox__label">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-submit"
              aria-busy={isLoading}
            >
              <span className="login-submit__shine" aria-hidden="true" />
              {isLoading ? (
                <>
                  <Loader2 size={18} className="login-submit__spinner" />
                  <span>Đang xác thực…</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight size={18} className="login-submit__arrow" />
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <footer className="login-card__footer">
            <p className="login-card__footer-text">
              © 2026 CineAdmin Pro &nbsp;·&nbsp; v1.0.2
            </p>
            <div className="login-card__footer-icons">
              <ShieldCheck size={14} />
              <Zap size={14} />
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
