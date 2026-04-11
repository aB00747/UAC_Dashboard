import PropTypes from 'prop-types';
import { classNames } from '../../utils/format';

const builtInVariants = {
  green:  'u-badge--green',
  red:    'u-badge--red',
  yellow: 'u-badge--yellow',
  blue:   'u-badge--blue',
  indigo: 'u-badge--brand',
  purple: 'u-badge--purple',
  gray:   'u-badge--gray',
};

export default function Badge({ children, variant = 'gray', colorMap, value, className }) {
  const colorClass = colorMap?.[value] || builtInVariants[variant] || builtInVariants.gray;
  return (
    <span
      className={classNames(
        'u-badge',
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
