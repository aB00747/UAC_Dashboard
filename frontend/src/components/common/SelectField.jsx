import PropTypes from 'prop-types';
import Select from '../ui/Select';

export default function SelectField({ label, options = [], placeholder, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <Select options={options} placeholder={placeholder} required={required} {...props} />
    </div>
  );
}

SelectField.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
}