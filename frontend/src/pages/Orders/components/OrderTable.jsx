import PropTypes from 'prop-types';
import { Eye } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { Pagination } from '../../../components/common';
import { formatCurrency, formatDate } from '../../../utils/format';
import { orderStatusColors, paymentStatusColors } from '../../../constants/statusColors';

export default function OrderTable({ orders, loading, page, totalPages, onPageChange, onView }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Order #</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Payment</th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={7} className="py-10 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></td></tr>
          )}
          {!loading && orders.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">
                No orders found
              </td>
            </tr>
          )}
          {!loading && orders.length > 0 && orders.map((o) => (
            <tr key={o.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{o.order_number}</td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{o.customer_name}</td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatDate(o.order_date)}</td>
              <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(o.total_amount)}</td>
              <td className="py-3 px-4"><Badge colorMap={orderStatusColors} value={o.status}>{o.status}</Badge></td>
              <td className="py-3 px-4"><Badge colorMap={paymentStatusColors} value={o.payment_status}>{o.payment_status}</Badge></td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => onView(o.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"><Eye className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPrev={() => onPageChange(page - 1)} onNext={() => onPageChange(page + 1)} />
    </div>
  );
}

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};