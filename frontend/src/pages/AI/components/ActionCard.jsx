import PropTypes from 'prop-types';
import { ShoppingCart, AlertTriangle, Check, X, Loader2 } from 'lucide-react';

const ACTION_LABELS = {
  create_order: 'Create Order',
  create_customer: 'Create Customer',
};

export default function ActionCard({ action, onConfirm, onCancel, executing }) {
  if (!action) return null;

  const isResolved = action.resolved;
  const hasErrors = action.errors?.length > 0;

  return (
    <div className="mt-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          {ACTION_LABELS[action.type] || action.type}
        </span>
      </div>

      {action.type === 'create_order' && action.display && (
        <div className="space-y-2 mb-3 text-sm">
          {action.display.customer && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Customer:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.customer}</span>
            </div>
          )}
          {action.display.items?.map((item) => (
            <div key={`${item.name}-${item.quantity}`} className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                {item.name} x {item.quantity} {item.unit}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                INR {(item.quantity * item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {action.display.summary && (
            <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-700">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
              <span className="font-bold text-gray-900 dark:text-white">{action.display.summary}</span>
            </div>
          )}
        </div>
      )}

      {action.type === 'create_customer' && action.display && (
        <div className="space-y-1 mb-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Name:</span>
            <span className="font-medium text-gray-900 dark:text-white">{action.display.name}</span>
          </div>
        </div>
      )}

      {hasErrors && (
        <div className="mb-3 space-y-1">
          {action.errors.map((err) => (
            <div key={err} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {isResolved && !hasErrors ? (
          <>
            <button onClick={onConfirm} disabled={executing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {executing ? 'Processing...' : 'Confirm'}
            </button>
            <button onClick={onCancel} disabled={executing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors disabled:opacity-50">
              <X className="h-4 w-4" /> Cancel
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please clarify the details above so I can prepare the action.
          </p>
        )}
      </div>
    </div>
  );
}

ActionCard.propTypes = {
  action: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  executing: PropTypes.bool,
}