import { useState, useEffect } from 'react';
import { reportsAPI } from '../../api/reports';
import { formatCurrency, classNames } from '../../utils/format';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { BarChart2, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts';
import { StatCard } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const TABS = ['sales', 'inventory'];

export default function Reports() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('sales');
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [salesRes, invRes] = await Promise.all([
          reportsAPI.sales(),
          reportsAPI.inventory(),
        ]);
        setSalesData(salesRes.data);
        setInventoryData(invRes.data);
      } catch { toast.error('Failed to load reports'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <PageSpinner />;

  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }
    : {};

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={classNames(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize',
              tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {t === 'sales' ? <ShoppingCart className="h-4 w-4" /> : <Package className="h-4 w-4" />}
            {t}
          </button>
        ))}
      </div>

      {tab === 'sales' && salesData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Revenue" value={formatCurrency(salesData.total_revenue)} icon={TrendingUp} color="bg-green-500" />
            <StatCard label="Total Orders" value={salesData.total_orders} icon={ShoppingCart} color="bg-indigo-500" />
            <StatCard label="Avg Order Value" value={formatCurrency(salesData.avg_order_value)} icon={BarChart2} color="bg-blue-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Orders by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.by_status}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="status" tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={salesData.by_payment} cx="50%" cy="50%" outerRadius={100} dataKey="count" label={({ payment_status, count }) => `${payment_status}: ${count}`}>
                    {(salesData.by_payment || []).map((item, i) => <Pie key={item.payment_status || i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Customers</h3>
              <div className="space-y-2">
                {(salesData.top_customers || []).map((c, i) => (
                  <div key={c.id || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{c.customer__first_name} {c.customer__last_name}</span>
                      {c.customer__company_name && <span className="text-gray-500 dark:text-gray-400 ml-1">({c.customer__company_name})</span>}
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(c.total)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({c.order_count} orders)</span>
                    </div>
                  </div>
                ))}
                {(!salesData.top_customers || salesData.top_customers.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data yet</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products</h3>
              <div className="space-y-2">
                {(salesData.top_products || []).map((p, i) => (
                  <div key={p.id || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{p.chemical__chemical_name}</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.total_value)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Qty: {p.total_qty})</span>
                    </div>
                  </div>
                ))}
                {(!salesData.top_products || salesData.top_products.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'inventory' && inventoryData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard label="Total Chemicals" value={inventoryData.total_chemicals} icon={Package} color="bg-indigo-500" />
            <StatCard label="Categories" value={inventoryData.total_categories} icon={BarChart2} color="bg-blue-500" />
            <StatCard label="Low Stock" value={inventoryData.low_stock_count} icon={TrendingUp} color="bg-red-500" />
            <StatCard label="Inventory Value" value={formatCurrency(inventoryData.total_inventory_value)} icon={TrendingUp} color="bg-green-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryData.by_category}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="category__name" tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#4f46e5" name="Items" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_quantity" fill="#10b981" name="Total Qty" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Items</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {(inventoryData.low_stock_items || []).map((item, i) => (
                  <div key={item.id || i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm border border-red-100 dark:border-red-800/30">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.chemical_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.chemical_code} - Min: {item.min_quantity} {item.unit}</p>
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400">{item.quantity} {item.unit}</span>
                  </div>
                ))}
                {(!inventoryData.low_stock_items || inventoryData.low_stock_items.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">All stock levels healthy</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
