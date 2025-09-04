import { useEffect, useState, useMemo } from 'react';

export const useTheme = () => {
  const [themeOption, setThemeOption] = useState('system');

  const mediaQuery = useMemo(
    () =>
      typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null,
    [],
  );

  const applyTheme = (option) => {
    const root = document.documentElement;
    const systemPrefersDark = mediaQuery ? mediaQuery.matches : false;
    const isDark = option === 'dark' || (option === 'system' && systemPrefersDark);
    root.classList.toggle('dark', isDark);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setThemeOption(saved);
      applyTheme(saved);
    } else {
      setThemeOption('system');
      applyTheme('system');
    }
  }, []);

  useEffect(() => {
    if (!mediaQuery) return;
    const handleChange = () => {
      if (themeOption === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener?.('change', handleChange);
    mediaQuery.addListener?.(handleChange);
    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
      mediaQuery.removeListener?.(handleChange);
    };
  }, [mediaQuery, themeOption]);

  const setTheme = (option) => {
    setThemeOption(option);
    localStorage.setItem('theme', option === 'system' ? 'system' : option);
    applyTheme(option);
  };

  return {
    themeOption,
    setTheme,
    applyTheme,
  };
};
