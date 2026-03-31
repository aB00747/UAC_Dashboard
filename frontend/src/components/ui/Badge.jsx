import PropTypes from 'prop-types';
import { classNames } from '../../utils/format';

const builtInVariants = {
  green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function Badge({ children, variant = 'gray', colorMap, value, className }) {
  const colorClass = colorMap?.[value] || builtInVariants[variant] || builtInVariants.gray;
  return (
    <span
      className={classNames(
        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['green', 'red', 'yellow', 'blue', 'indigo', 'purple', 'gray']),
  colorMap: PropTypes.object,
  value: PropTypes.any,
  className: PropTypes.string,
};

