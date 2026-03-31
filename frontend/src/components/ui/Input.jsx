import PropTypes from 'prop-types';
import { classNames } from '../../utils/format';

export default function Input({ className, ...props }) {
  return (
    <input
      className={classNames(
        'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500',
        className
      )}
      {...props}
    />
  );
}

Input.propTypes = {
  className: PropTypes.string,
};