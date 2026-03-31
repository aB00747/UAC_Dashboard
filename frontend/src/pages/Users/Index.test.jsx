// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';


vi.mock('../../api/auth', () => ({
  usersAPI: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  rolesAPI: { list: vi.fn() },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('../../utils/format', () => ({
  formatDate: (d) => d || '',
  classNames: (...args) => args.filter(Boolean).join(' '),
}));

import UsersPage from './Index';
import { usersAPI, rolesAPI } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 1, name: 'staff', label: 'Staff', level: 10 },
  { id: 2, name: 'member', label: 'Member', level: 20 },
  { id: 3, name: 'admin', label: 'Admin', level: 30 },
];

const USERS = [
  { id: 1, username: 'alice', email: 'alice@ex.com', first_name: 'Alice', last_name: 'Smith', is_active: true, date_joined: '2024-01-01', role_detail: { id: 2, name: 'member', label: 'Member' } },
  { id: 2, username: 'bob', email: 'bob@ex.com', first_name: '', last_name: '', is_active: false, date_joined: '2024-02-01', role_detail: { id: 1, name: 'staff', label: 'Staff' } },
];

function setup(userRole = { id: 3, name: 'admin', label: 'Admin', level: 30 }) {
  useAuth.mockReturnValue({ user: { role: userRole } });
  rolesAPI.list.mockResolvedValue({ data: ROLES });
  usersAPI.list.mockResolvedValue({ data: USERS });
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    setup();
    usersAPI.list.mockReturnValue(new Promise(() => {}));
    render(<UsersPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders Users heading', async () => {
    setup();
    render(<UsersPage />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders user rows after load', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => expect(screen.getByText('alice@ex.com')).toBeInTheDocument());
    expect(screen.getByText('bob@ex.com')).toBeInTheDocument();
  });

  it('shows username when no name provided', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => expect(screen.getByText('@bob')).toBeInTheDocument());
  });

  it('shows empty state when no users', async () => {
    setup();
    usersAPI.list.mockResolvedValue({ data: [] });
    render(<UsersPage />);
    await waitFor(() => expect(screen.getByText('No users found')).toBeInTheDocument());
  });

  it('shows error toast when list fails', async () => {
    setup();
    usersAPI.list.mockRejectedValue(new Error('fail'));
    render(<UsersPage />);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to load users'));
  });

  it('opens create dialog on Add User click', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => screen.getByText('Add User'));
    fireEvent.click(screen.getByText('Add User'));
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('closes dialog on Cancel click', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => screen.getByText('Add User'));
    fireEvent.click(screen.getByText('Add User'));
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(screen.queryByText('Create User')).not.toBeInTheDocument());
  });

  it('shows validation error when username/email empty', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => screen.getByText('Add User'));
    fireEvent.click(screen.getByText('Add User'));
    fireEvent.click(screen.getByText('Create'));
    expect(toast.error).toHaveBeenCalledWith('Username and email are required');
  });

  it('shows validation error when password missing for new user', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => screen.getByText('Add User'));
    fireEvent.click(screen.getByText('Add User'));
    await waitFor(() => screen.getByText('Create User'));
    // page text inputs: [0]=search, dialog: [1]=first_name, [2]=last_name, [3]=username, [4]=phone
    const allTextInputs = document.querySelectorAll('input[type="text"]');
    const usernameEl = Array.from(allTextInputs)[3];
    const emailEl = document.querySelector('input[type="email"]');
    if (usernameEl) fireEvent.change(usernameEl, { target: { value: 'newuser' } });
    if (emailEl) fireEvent.change(emailEl, { target: { value: 'x@x.com' } });
    fireEvent.click(screen.getByText('Create'));
    expect(toast.error).toHaveBeenCalledWith('Password is required for new users');
  });

  it('calls usersAPI.create on save with valid data', async () => {
    setup();
    usersAPI.create.mockResolvedValue({ data: {} });
    render(<UsersPage />);
    await waitFor(() => screen.getByText('Add User'));
    fireEvent.click(screen.getByText('Add User'));
    await waitFor(() => screen.getByText('Create User'));

    // page text inputs: [0]=search, dialog: [1]=first_name, [2]=last_name, [3]=username, [4]=phone
    const allTextInputs = document.querySelectorAll('input[type="text"]');
    const usernameInput = Array.from(allTextInputs)[3]; // username
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@ex.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(usersAPI.create).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('User created');
  });

  it('opens edit dialog with user data', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => screen.getByText('alice@ex.com'));
    const editBtns = document.querySelectorAll('button[class*="hover:text-indigo"]');
    fireEvent.click(editBtns[0]);
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('calls usersAPI.update on edit save', async () => {
    setup();
    usersAPI.update.mockResolvedValue({ data: {} });
    render(<UsersPage />);
    await waitFor(() => screen.getByText('alice@ex.com'));
    const editBtns = document.querySelectorAll('button[class*="hover:text-indigo"]');
    fireEvent.click(editBtns[0]);
    fireEvent.click(screen.getByText('Update'));
    await waitFor(() => expect(usersAPI.update).toHaveBeenCalledWith(1, expect.any(Object)));
    expect(toast.success).toHaveBeenCalledWith('User updated');
  });

  it('calls usersAPI.delete after confirm', async () => {
    setup();
    usersAPI.delete.mockResolvedValue({});
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    render(<UsersPage />);
    await waitFor(() => screen.getByText('alice@ex.com'));
    const deleteBtns = document.querySelectorAll('button[class*="hover:text-red"]');
    fireEvent.click(deleteBtns[0]);
    await waitFor(() => expect(usersAPI.delete).toHaveBeenCalledWith(1));
    expect(toast.success).toHaveBeenCalledWith('User deleted');
    globalThis.confirm.mockRestore();
  });

  it('does not delete when confirm is cancelled', async () => {
    setup();
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    render(<UsersPage />);
    await waitFor(() => screen.getByText('alice@ex.com'));
    const deleteBtns = document.querySelectorAll('button[class*="hover:text-red"]');
    fireEvent.click(deleteBtns[0]);
    expect(usersAPI.delete).not.toHaveBeenCalled();
    globalThis.confirm.mockRestore();
  });

  it('renders role badges for users', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => expect(screen.getAllByText('Member').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Staff').length).toBeGreaterThan(0);
  });

  it('renders active/inactive status badges', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders role filter select with All Roles option', async () => {
    setup();
    render(<UsersPage />);
    await waitFor(() => screen.getByText('All Roles'));
    expect(screen.getByText('All Roles')).toBeInTheDocument();
  });
});
