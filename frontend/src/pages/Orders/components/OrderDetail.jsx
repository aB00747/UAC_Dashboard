import PropTypes from 'prop-types';
import { SlidePanel } from '../../../components/common';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function OrderDetail({ order, onClose, onUpdateStatus }) {
  return (
    <SlidePanel title={order.order_number} onClose={onClose} width="w-[480px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500 dark:text-gray-400">Customer:</span> <span className="font-medium text-gray-900 dark:text-white">{order.customer_name}</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">Date:</span> <span className="font-medium text-gray-900 dark:text-white">{formatDate(order.order_date)}</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">Total:</span> <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</span></div>
          <div><span className="text-gray-500 dark:text-gray-400">Tax:</span> <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.tax_amount)}</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Update Status</label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={order.status} onChange={(e) => onUpdateStatus(order.id, e.target.value)}>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Items</h4>
          <div className="space-y-2">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.chemical_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity} x {formatCurrency(item.unit_price)}</p>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.total_price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}

OrderDetail.propTypes = {
  order: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
};