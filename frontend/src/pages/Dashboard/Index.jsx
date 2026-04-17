import { useState, useEffect } from 'react';
import { reportsAPI } from '../../api/reports';
import { formatCurrency} from '../../utils/format';
import { useTheme } from '../../contexts/ThemeContext';
import { useBranding } from '../../contexts/BrandingContext';
import { Users, ShoppingCart, IndianRupee, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts';
import { Badge } from '../../components/ui';
import { StatCard } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';
import { orderStatusColors } from '../../constants/statusColors';
import AIInsightsWidget from '../../components/AIInsightsWidget';

const COLORS = ['#c96442', '#10b981', '#f59e0b', '#b53333', '#8b5cf6'];

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

  if (loading) return <PageSpinner />;

  if (!data) {
    return <p className="text-center u-text-3 py-20">Failed to load dashboard data</p>;
  }

  const { stats, recent_orders, low_stock_items, monthly_data } = data;

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), icon: IndianRupee, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'bg-[#d97757]' },
    { label: 'Total Customers', value: stats.total_customers, icon: Users, color: 'bg-[#c96442]' },
    { label: 'Low Stock Items', value: stats.low_stock_chemicals, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const pieData = [
    { name: 'Paid', value: stats.total_orders - stats.pending_orders },
    { name: 'Pending', value: stats.pending_orders },
  ];

  const tooltipStyle = isDark
    ? { backgroundColor: '#1e1e1c', border: '1px solid #30302e', color: '#faf9f5' }
    : {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="u-heading u-heading-lg u-text">{systemName}</h1>
        <p className="text-sm u-text-3 mt-1">Welcome to your operational overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 u-card p-5">
          <h2 className="u-heading u-heading-md u-text mb-4">Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#30302e' : '#f0eee6'} />
              <XAxis dataKey="month" tick={{ fill: isDark ? '#b0aea5' : '#5e5d59' }} />
              <YAxis yAxisId="left" tick={{ fill: isDark ? '#b0aea5' : '#5e5d59' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: isDark ? '#b0aea5' : '#5e5d59' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#c96442" name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="u-card p-5">
          <h2 className="u-heading u-heading-md u-text mb-4">Order Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                {pieData.map((item, i) => (
                  <Pie key={item.name} fill={COLORS[i % COLORS.length]} />
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
        <div className="u-card p-5">
          <h2 className="u-heading u-heading-md u-text mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="u-border-b">
                  <th className="text-left py-2 px-2 font-medium u-text-3">Order</th>
                  <th className="text-left py-2 px-2 font-medium u-text-3">Customer</th>
                  <th className="text-left py-2 px-2 font-medium u-text-3">Amount</th>
                  <th className="text-left py-2 px-2 font-medium u-text-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((o) => (
                  <tr key={o.id} className="u-border-b">
                    <td className="py-2.5 px-2 font-medium u-text">{o.order_number}</td>
                    <td className="py-2.5 px-2 u-text-2">{o.customer_name}</td>
                    <td className="py-2.5 px-2 u-text">{formatCurrency(o.total_amount)}</td>
                    <td className="py-2.5 px-2">
                      <Badge colorMap={orderStatusColors} value={o.status}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
                {recent_orders.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center u-text-3">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="u-card p-5">
          <h2 className="u-heading u-heading-md u-text mb-4">Low Stock Alerts</h2>
          <div className="space-y-3">
            {low_stock_items.map((item) => (
              <div key={item.id || item.chemical_name} className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: 'var(--red-bg)', borderColor: 'var(--red-border)' }}>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5" style={{ color: 'var(--red-solid)' }} />
                  <div>
                    <p className="text-sm font-medium u-text">{item.chemical_name}</p>
                    <p className="text-xs u-text-3">Min: {item.min_quantity} {item.unit}</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--red-text)' }}>{item.quantity} {item.unit}</span>
              </div>
            ))}
            {low_stock_items.length === 0 && (
              <div className="flex items-center gap-2 py-6 justify-center u-text-3">
                <TrendingUp className="h-5 w-5" />
                <p className="text-sm">All stock levels are healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AIInsightsWidget />
    </div>
  );
}
