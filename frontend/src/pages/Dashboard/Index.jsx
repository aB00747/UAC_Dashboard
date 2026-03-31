import { useState, useEffect } from 'react';
import { reportsAPI } from '../../api/reports';
import { formatCurrency, formatDate } from '../../utils/format';
import { useTheme } from '../../contexts/ThemeContext';
import { useBranding } from '../../contexts/BrandingContext';
import { Users, ShoppingCart, IndianRupee, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import AIInsightsWidget from '../../components/AIInsightsWidget';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Dashboard() {
  const { isDark } = useTheme();
  const { systemName } = useBranding();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.dashboard().then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  }

  if (!data) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-20">Failed to load dashboard data</p>;
  }

  const { stats, recent_orders, low_stock_items, monthly_data } = data;

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'bg-indigo-500' },
    { label: 'Total Customers', value: stats.total_customers, icon: Users, color: 'bg-blue-500' },
    { label: 'Low Stock Items', value: stats.low_stock_chemicals, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const pieData = [
    { name: 'Paid', value: stats.total_orders - stats.pending_orders },
    { name: 'Pending', value: stats.pending_orders },
  ];

  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }
    : {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{systemName}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome to your operational overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
            <div className={`${s.color} p-3 rounded-lg`}>
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly orders chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
              <YAxis yAxisId="left" tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#4f46e5" name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders & low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Order</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-white">{o.order_number}</td>
                    <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400">{o.customer_name}</td>
                    <td className="py-2.5 px-2 text-gray-900 dark:text-white">{formatCurrency(o.total_amount)}</td>
                    <td className="py-2.5 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recent_orders.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Alerts</h2>
          <div className="space-y-3">
            {low_stock_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.chemical_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Min: {item.min_quantity} {item.unit}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{item.quantity} {item.unit}</span>
              </div>
            ))}
            {low_stock_items.length === 0 && (
              <div className="flex items-center gap-2 py-6 justify-center text-gray-500 dark:text-gray-400">
                <TrendingUp className="h-5 w-5" />
                <p className="text-sm">All stock levels are healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsightsWidget />
    </div>
  );
}
