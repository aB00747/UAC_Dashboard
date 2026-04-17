import PropTypes from 'prop-types';
import Input from '../ui/Input';

export default function FormField({ label, value, onChange, type = 'text', required = false, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium u-text mb-1">{label}</label>
      <Input
        type={type}
        required={required}
        step={type === 'number' ? 'any' : undefined}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  type: PropTypes.string,
  required: PropTypes.bool,
};