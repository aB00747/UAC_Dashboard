// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../api/auth', () => ({
  authAPI: { updateProfile: vi.fn(), deleteProfile: vi.fn() },
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, useNavigate: () => mockNavigate };
});

import Profile from './Index';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

const MOCK_USER = {
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice@ex.com',
  phone: '1234567890',
  address: '123 Main St',
  role: { name: 'admin', label: 'Admin', level: 30 },
};

function setup(user = MOCK_USER) {
  const logout = vi.fn().mockResolvedValue({});
  const updateUser = vi.fn();
  useAuth.mockReturnValue({ user, logout, updateUser });
  return { logout, updateUser };
}

function render$() {
  return render(<MemoryRouter><Profile /></MemoryRouter>);
}

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile heading', () => {
    setup();
    render$();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders user name', () => {
    setup();
    render$();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders role badge', () => {
    setup();
    render$();
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
  });

  it('pre-fills form with user data', () => {
    setup();
    render$();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice@ex.com')).toBeInTheDocument();
  });

  it('renders Save Changes button', () => {
    setup();
    render$();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('calls authAPI.updateProfile on form submit', async () => {
    const { updateUser } = setup();
    authAPI.updateProfile.mockResolvedValue({ data: { ...MOCK_USER, first_name: 'Bob' } });
    render$();
    const form = document.querySelector('form');
    fireEvent.submit(form);
    await waitFor(() => expect(authAPI.updateProfile).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Profile updated');
    expect(updateUser).toHaveBeenCalled();
  });

  it('shows error on profile update failure', async () => {
    setup();
    authAPI.updateProfile.mockRejectedValue({ response: { data: { email: ['Invalid'] } } });
    render$();
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invalid'));
  });

  it('shows fallback error on network failure', async () => {
    setup();
    authAPI.updateProfile.mockRejectedValue(new Error('fail'));
    render$();
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Update failed'));
  });

  it('calls deleteProfile after confirm', async () => {
    const { logout } = setup();
    authAPI.deleteProfile.mockResolvedValue({});
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    render$();
    fireEvent.click(screen.getByText('Delete Account'));
    await waitFor(() => expect(authAPI.deleteProfile).toHaveBeenCalled());
    expect(logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    globalThis.confirm.mockRestore();
  });

  it('does not delete when confirm is cancelled', async () => {
    setup();
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    render$();
    fireEvent.click(screen.getByText('Delete Account'));
    expect(authAPI.deleteProfile).not.toHaveBeenCalled();
    globalThis.confirm.mockRestore();
  });
});
