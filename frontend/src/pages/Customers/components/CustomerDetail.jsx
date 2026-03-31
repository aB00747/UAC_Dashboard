import PropTypes from 'prop-types';
import { formatDate } from '../../../utils/format';
import { SlidePanel } from '../../../components/common';
import { Button } from '../../../components/ui';

export default function CustomerDetail({ customer, onClose, onEdit, onDelete, getTypeName }) {
  return (
    <SlidePanel title="Customer Details" onClose={onClose}>
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-2">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{customer.first_name?.[0]}{customer.last_name?.[0]}</span>
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{customer.full_name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.company_name}</p>
        </div>
        {[
          ['Email', customer.email],
          ['Phone', customer.phone],
          ['Type', getTypeName(customer)],
          ['City', customer.city],
          ['State', customer.state],
          ['GSTIN', customer.gstin],
          ['PAN', customer.pan],
          ['Created', formatDate(customer.created_at)],
        ].map(([label, val]) => val && (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-white font-medium">{val}</span>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => onEdit(customer)}>Edit</Button>
          <Button variant="danger" onClick={() => onDelete(customer.id)}>Delete</Button>
        </div>
      </div>
    </SlidePanel>
  );
}

CustomerDetail.propTypes = {
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  getTypeName: PropTypes.func.isRequired,
};