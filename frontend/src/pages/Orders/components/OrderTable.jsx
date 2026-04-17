import PropTypes from 'prop-types';
import { Eye } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { Pagination } from '../../../components/common';
import { formatCurrency, formatDate } from '../../../utils/format';
import { orderStatusColors, paymentStatusColors } from '../../../constants/statusColors';

export default function OrderTable({ orders, loading, page, totalPages, onPageChange, onView }) {
  return (
    <div className="u-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="u-bg-subtle border-b u-border-b">
          <tr>
            <th className="text-left py-3 px-4 font-medium u-text-3">Order #</th>
            <th className="text-left py-3 px-4 font-medium u-text-3">Customer</th>
            <th className="text-left py-3 px-4 font-medium u-text-3">Date</th>
            <th className="text-right py-3 px-4 font-medium u-text-3">Amount</th>
            <th className="text-left py-3 px-4 font-medium u-text-3">Status</th>
            <th className="text-left py-3 px-4 font-medium u-text-3">Payment</th>
            <th className="text-right py-3 px-4 font-medium u-text-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={7} className="py-10 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} /></td></tr>
          )}
          {!loading && orders.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center u-text-3">
                No orders found
              </td>
            </tr>
          )}
          {!loading && orders.length > 0 && orders.map((o) => (
            <tr key={o.id} className="border-b u-border-b hover:u-bg-subtle">
              <td className="py-3 px-4 font-medium u-text">{o.order_number}</td>
              <td className="py-3 px-4 u-text-2">{o.customer_name}</td>
              <td className="py-3 px-4 u-text-2">{formatDate(o.order_date)}</td>
              <td className="py-3 px-4 text-right font-medium u-text">{formatCurrency(o.total_amount)}</td>
              <td className="py-3 px-4"><Badge colorMap={orderStatusColors} value={o.status}>{o.status}</Badge></td>
              <td className="py-3 px-4"><Badge colorMap={paymentStatusColors} value={o.payment_status}>{o.payment_status}</Badge></td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => onView(o.id)} className="p-1.5 u-text-3 hover:u-text-brand rounded"><Eye className="h-4 w-4" /></button>
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
