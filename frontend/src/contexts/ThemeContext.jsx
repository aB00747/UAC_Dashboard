import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useBranding } from './BrandingContext';

const STORAGE_KEY = 'vardhan-theme';
const ThemeContext = createContext();

function resolveTheme(stored, companyDefault) {
  if (stored === 'dark' || stored === 'light') return stored;
  if (companyDefault === 'dark') return 'dark';
  if (companyDefault === 'light') return 'light';
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const { darkModeDefault } = useBranding();
  const stored = localStorage.getItem(STORAGE_KEY);
  const [theme, setTheme] = useState(() => resolveTheme(stored, darkModeDefault));

  useEffect(() => {
    const currentStored = localStorage.getItem(STORAGE_KEY);
    setTheme(resolveTheme(currentStored, darkModeDefault));
  }, [darkModeDefault]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function resetToCompanyDefault() {
    localStorage.removeItem(STORAGE_KEY);
    setTheme(resolveTheme(null, darkModeDefault));
  }

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme, resetToCompanyDefault }),
    [theme] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
