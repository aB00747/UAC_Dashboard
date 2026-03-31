import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { searchAPI, notificationsAPI } from '../api/core';
import { classNames } from '../utils/format';
import {
  Bell, Search, Menu, LogOut, User, ChevronDown, Sun, Moon,
} from 'lucide-react';

export default function Header({ onOpenSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    notificationsAPI.list()
      .then(({ data }) => setNotifications(data.results || data || []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const { data } = await searchAPI.search(q);
      setSearchResults(data.results || []);
      setShowSearch(true);
    } catch {
      setSearchResults([]);
    }
  }, []);

  async function markAllRead() {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      setNotifications((prev) => [...prev]);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <button
          type="button"
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-4" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search customers, chemicals, orders"
              placeholder="Search customers, chemicals, orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            />
            {showSearch && searchResults.length > 0 && (
              <nav aria-label="Search results">
                <ul className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto list-none m-0 p-0">
                  {searchResults.map((r) => (
                    <li key={`${r.type}-${r.id}`}>
                      <Link
                        to={`/${r.type}s/${r.id}`}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{r.type} {r.subtitle && ('- ' + r.subtitle)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label={unreadCount > 0 ? 'Notifications (' + unreadCount + ' unread)' : 'Notifications'}
              aria-expanded={showNotifications}
              aria-haspopup="true"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-hidden="true">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div role="menu" className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button type="button" onClick={markAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        role="menuitem"
                        className={classNames(
                          'px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0',
                          !n.is_read && 'bg-indigo-50 dark:bg-indigo-900/30'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {user.first_name || user.username}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showUserMenu && (
              <div role="menu" className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <Link
                  to="/profile"
                  role="menuitem"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-700"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onOpenSidebar: PropTypes.func.isRequired,
};