import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const msg = Object.values(errors).flat().join(', ');
        toast.error(msg);
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  const field = (label, name, type = 'text') => (
    <div>
      <label className="block text-sm font-medium u-text-2 mb-1">{label}</label>
      <input
        type={type}
        required
        className="u-input w-full px-3 py-2 text-sm rounded-lg"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="u-card p-8 space-y-4" style={{ borderRadius: 'var(--r-xl)' }}>
      <h2 className="u-heading u-heading-md u-text text-center">Create an account</h2>
      <div className="grid grid-cols-2 gap-4">
        {field('First Name', 'first_name')}
        {field('Last Name', 'last_name')}
      </div>
      {field('Username', 'username')}
      {field('Email', 'email', 'email')}
      {field('Password', 'password', 'password')}
      {field('Confirm Password', 'password_confirmation', 'password')}
      <button
        type="submit"
        disabled={loading}
        className="u-btn u-btn--primary w-full py-2.5 text-sm"
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
      <p className="text-center text-sm u-text-3">
        Already have an account?{' '}
        <Link to="/login" className="u-text-brand font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
