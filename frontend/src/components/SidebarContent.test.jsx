// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import { SidebarContent } from './SidebarContent';
import { LayoutDashboard, Users } from 'lucide-react';

const nav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
];

function render$(props) {
  return render(
    <MemoryRouter>
      <SidebarContent currentPath="/" systemName="Test App" logoUrl="" navItems={nav} {...props} />
    </MemoryRouter>
  );
}

describe('SidebarContent', () => {
  it('renders system name', () => {
    render$();
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('renders UC fallback when no logo', () => {
    render$();
    expect(screen.getByText('UC')).toBeInTheDocument();
  });

  it('renders logo image when logoUrl provided', () => {
    render$({ logoUrl: 'https://example.com/logo.png' });
    expect(screen.getByAltText('Test App')).toBeInTheDocument();
  });

  it('renders all nav items', () => {
    render$();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
  });

  it('active link has active styling', () => {
    render$({ currentPath: '/' });
    const link = screen.getByText('Dashboard').closest('a');
    expect(link.className).toContain('u-sidebar-item--active');
  });

  it('inactive link has base sidebar-item styling', () => {
    render$({ currentPath: '/' });
    const link = screen.getByText('Customers').closest('a');
    expect(link.className).toContain('u-sidebar-item');
    expect(link.className).not.toContain('u-sidebar-item--active');
  });

  it('calls onClose when nav link clicked', () => {
    const onClose = vi.fn();
    render$({ onClose });
    fireEvent.click(screen.getByText('Customers'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render close button when onClose not provided', () => {
    render$();
    expect(screen.queryByLabelText('Close sidebar')).not.toBeInTheDocument();
  });
});
