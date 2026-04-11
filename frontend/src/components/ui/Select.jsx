import PropTypes from 'prop-types';
import { classNames } from '../../utils/format';

export default function Select({ options = [], placeholder, className, ...props }) {
  return (
    <select
      className={classNames(
        'w-full px-3 py-2 rounded-lg text-sm u-input',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) =>
        typeof opt === 'object' ? (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ) : (
          <option key={opt} value={opt}>{opt}</option>
        )
      )}
    </select>
  );
}

Select.propTypes = {
  options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  placeholder: PropTypes.string,
  className: PropTypes.string,
};
