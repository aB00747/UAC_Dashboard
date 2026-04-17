
import PropTypes from 'prop-types';

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2"
        style={{ borderBottomColor: 'var(--brand)' }}
      />
    </div>
  );
}

export function InlineSpinner({ className = 'h-6 w-6' }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-b-2 ${className}`}
      style={{ borderBottomColor: 'var(--brand)' }}
    />
  );
}

PageSpinner.propTypes = {
  className: PropTypes.string,
};

InlineSpinner.propTypes = {
  className: PropTypes.string,
};
