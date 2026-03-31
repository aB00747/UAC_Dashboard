import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { aiAPI } from '../api/ai';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, ShoppingCart, Users, Package, Info } from 'lucide-react';

const categoryIcons = {
  sales: ShoppingCart,
  inventory: Package,
  customers: Users,
  operations: TrendingUp,
};

const priorityStyles = {
  critical: 'border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20',
  warning: 'border-yellow-200 dark:border-yellow-800/40 bg-yellow-50 dark:bg-yellow-900/20',
  info: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
};

const priorityIcons = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const priorityIconColors = {
  critical: 'text-red-500 dark:text-red-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
  info: 'text-indigo-500 dark:text-indigo-400',
};

export default function AIInsightsWidget() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    setLoading(true);
    setError(false);
    try {
      const { data } = await aiAPI.quickInsights();
      setInsights(data.insights || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
          </div>
          <button onClick={fetchInsights} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          AI service unavailable. Start the AI service to see insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((id) => (
            <div key={`skeleton-${id}`} className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const CategoryIcon = categoryIcons[insight.category] || TrendingUp;
            const PriorityIcon = priorityIcons[insight.priority] || Info;
            const style = priorityStyles[insight.priority] || priorityStyles.info;
            const iconColor = priorityIconColors[insight.priority] || priorityIconColors.info;

            return (
              <div key={`insight-${insight.title}`} className={`rounded-lg border p-3 ${style}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${iconColor}`}>
                    <PriorityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</h3>
                      <CategoryIcon className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{insight.summary}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {insights.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No insights available</p>
          )}
        </div>
      )}
    </div>
  );
}

AIInsightsWidget.prototype = {
  className: PropTypes.string,
};