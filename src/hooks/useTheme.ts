'use client';

import { useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cineadmin-theme') as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const initial = saved ?? preferred;
    applyTheme(initial);
    setTheme(initial);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('cineadmin-theme', next);
      return next;
    });
  }, []);

  return { theme, toggle, mounted };
}
