import PropTypes from 'prop-types';
import { classNames } from '../../utils/format';

export default function Input({ className, ...props }) {
  return (
    <input
      className={classNames(
        'w-full px-3 py-2 rounded-lg text-sm u-input',
        className
      )}
      {...props}
    />
  );
}

Input.propTypes = {
  className: PropTypes.string,
};
