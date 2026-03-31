
import PropTypes from 'prop-types';
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );
}

export function InlineSpinner({ className = 'h-6 w-6' }) {
  return (
    <div className={`inline-block animate-spin rounded-full border-b-2 border-indigo-600 ${className}`} />
  );
}

PageSpinner.propTypes = {
  className: PropTypes.string,
};