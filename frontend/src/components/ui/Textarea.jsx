import PropTypes from 'prop-types';
import { classNames } from '../../utils/format';

export default function Textarea({ className, ...props }) {
  return (
    <textarea
      className={classNames(
        'w-full px-3 py-2 rounded-lg text-sm u-input',
        className
      )}
      {...props}
    />
  );
}

Textarea.propTypes = { className: PropTypes.string };
