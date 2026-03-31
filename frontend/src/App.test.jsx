// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, logout: vi.fn() }),
}));
vi.mock('./contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));
vi.mock('./contexts/BrandingContext', () => ({
  useBranding: () => ({ systemName: 'Umiya', logoUrl: null, settings: [], loading: false }),
}));
vi.mock('./api/core', () => ({
  searchAPI: { search: vi.fn() },
  notificationsAPI: { list: vi.fn().mockResolvedValue({ data: { results: [] } }) },
  brandingAPI: { getSettings: vi.fn().mockResolvedValue({ data: [] }) },
  coreAPI: { systemInfo: vi.fn().mockResolvedValue({ data: {} }) },
}));
vi.mock('./components/SidebarContent', () => ({
  SidebarContent: () => <div data-testid="sidebar" />,
}));

import App from './App';

describe('App routing', () => {
  it('renders login page at /login', async () => {
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument());
  });

  it('renders register page at /register', async () => {
    render(<MemoryRouter initialEntries={['/register']}><App /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument());
  });
});
