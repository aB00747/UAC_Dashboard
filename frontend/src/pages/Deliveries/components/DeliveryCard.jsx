import PropTypes from 'prop-types';
import { Truck, Edit2 } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { formatDate } from '../../../utils/format';
import { deliveryStatusColors } from '../../../constants/statusColors';

export default function DeliveryCard({ delivery, onEdit }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <span className="font-semibold text-gray-900 dark:text-white">
            {delivery.order_number || `Order #${delivery.order}`}
          </span>
        </div>
        <Badge colorMap={deliveryStatusColors} value={delivery.status}>
          {delivery.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        {delivery.tracking_number && (
          <p>Tracking: <span className="font-medium text-gray-900 dark:text-white">{delivery.tracking_number}</span></p>
        )}
        {delivery.driver_name && (
          <p>Driver: {delivery.driver_name} {delivery.driver_phone && `(${delivery.driver_phone})`}</p>
        )}
        {delivery.vehicle_number && <p>Vehicle: {delivery.vehicle_number}</p>}
        {delivery.delivery_date && <p>Date: {formatDate(delivery.delivery_date)}</p>}
      </div>

      <button
        onClick={onEdit}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
      >
        <Edit2 className="h-3.5 w-3.5" /> Edit
      </button>
    </div>
  );
}

DeliveryCard.propTypes = {
  delivery: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
};
