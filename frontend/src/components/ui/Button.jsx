import PropTypes from 'prop-types';
import { classNames } from '../../utils/format';

const variantClass = {
  primary: 'u-btn--primary',
  secondary: 'u-btn--secondary',
  danger: 'u-btn--danger',
  ghost: 'u-btn--ghost',
};

const dangerClass = 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50';

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className,
  ...props
}) {
  const renderIcon = () => {
    if (loading) {
      return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
    }
    if (Icon) {
      return <Icon className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <button
      disabled={disabled || loading}
      className={classNames(
        'u-btn',
        variant === 'danger' ? dangerClass : variantClass[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.elementType,
  className: PropTypes.string,
};
