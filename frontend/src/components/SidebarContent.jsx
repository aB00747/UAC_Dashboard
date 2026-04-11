import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { X } from 'lucide-react';
import { classNames } from '../utils/format';

export function SidebarContent({ currentPath, onClose, systemName, logoUrl, navItems }) {
  return (
    <>
      <div className="flex items-center justify-between h-16 px-4 u-border-b shrink-0">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          {logoUrl ? (
            <img src={logoUrl} alt={systemName} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">UC</span>
            </div>
          )}
          <span className="font-bold u-text truncate">{systemName || 'Umiya Chemical'}</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded u-btn u-btn--ghost">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? currentPath === '/'
            : currentPath.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium u-sidebar-item',
                isActive && 'u-sidebar-item--active'
              )}
            >
              <item.icon className={classNames(
                'h-5 w-5',
                isActive ? 'u-text-brand' : 'u-text-4'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

SidebarContent.propTypes = {
  currentPath: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  systemName: PropTypes.string,
  logoUrl: PropTypes.string,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
};
