import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="u-card p-8 space-y-5" style={{ borderRadius: 'var(--r-xl)' }}>
      <h2 className="u-heading u-heading-md u-text text-center">Sign in to your account</h2>
      <div>
        <label htmlFor="username" className="block text-sm font-medium u-text-2 mb-1">Username</label>
        <input
          id="username"
          type="text"
          required
          className="u-input w-full px-3 py-2 text-sm rounded-lg"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium u-text-2 mb-1">Password</label>
        <input
          id="password"
          type="password"
          required
          className="u-input w-full px-3 py-2 text-sm rounded-lg"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="u-btn u-btn--primary w-full py-2.5 text-sm"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm u-text-3">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="u-text-brand font-medium hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
