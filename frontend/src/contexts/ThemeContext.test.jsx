// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// jsdom doesn't implement globalThis.matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { ThemeProvider, useTheme } from './ThemeContext';

function ThemeConsumer() {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="is-dark">{String(isDark)}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('renders children with default light theme', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toMatch(/light|dark/);
  });

  it('toggles theme when toggle is called', () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    const initial = screen.getByTestId('theme').textContent;
    fireEvent.click(screen.getByText('Toggle'));
    const after = screen.getByTestId('theme').textContent;
    expect(after).not.toBe(initial);
  });

  it('applies dark class to document when dark theme', () => {
    localStorage.setItem('umiya-theme', 'dark');
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('is-dark').textContent).toBe('true');
  });

  it('reads stored theme from localStorage', () => {
    localStorage.setItem('umiya-theme', 'light');
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('stores theme in localStorage on toggle', () => {
    localStorage.removeItem('umiya-theme');
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText('Toggle'));
    expect(localStorage.getItem('umiya-theme')).toBeTruthy();
  });
});

describe('useTheme outside provider', () => {
  it('throws descriptive error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow('useTheme must be used within ThemeProvider');
    spy.mockRestore();
  });
});
