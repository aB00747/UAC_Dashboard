import PropTypes from 'prop-types';
import { ShoppingCart, UserPlus, FlaskConical, Package, AlertTriangle, Check, X, Loader2 } from 'lucide-react';

const ENTRY_TYPE_LABELS = { purchase: 'Adding', sale: 'Removing' };

const ACTION_CONFIG = {
  create_order: { label: 'Create Order', icon: ShoppingCart },
  create_customer: { label: 'Create Customer', icon: UserPlus },
  create_chemical: { label: 'Add Chemical', icon: FlaskConical },
  update_inventory: { label: 'Update Inventory', icon: Package },
};

export default function ActionCard({ action, onConfirm, onCancel, executing }) {
  if (!action) return null;

  const isResolved = action.resolved;
  const hasErrors = action.errors?.length > 0;
  const config = ACTION_CONFIG[action.type] || { label: action.type, icon: ShoppingCart };
  const Icon = config.icon;

  return (
    <div className="mt-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          {config.label}
        </span>
      </div>

      {/* Create Order display */}
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

      {/* Create Customer display */}
      {action.type === 'create_customer' && action.display && (
        <div className="space-y-1 mb-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Name:</span>
            <span className="font-medium text-gray-900 dark:text-white">{action.display.name}</span>
          </div>
        </div>
      )}

      {/* Create Chemical display */}
      {action.type === 'create_chemical' && action.display && (
        <div className="space-y-1 mb-3 text-sm">
          {action.display.name && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Chemical:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.name}</span>
            </div>
          )}
          {action.display.code && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Code:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.code}</span>
            </div>
          )}
          {action.display.unit && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Unit:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.unit}</span>
            </div>
          )}
          {action.display.selling_price > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Selling Price:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                INR {action.display.selling_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {action.display.gst > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">GST:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.gst}%</span>
            </div>
          )}
          {action.display.category && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Category:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.category}</span>
            </div>
          )}
        </div>
      )}

      {/* Update Inventory display */}
      {action.type === 'update_inventory' && action.display && (
        <div className="space-y-1 mb-3 text-sm">
          {action.display.chemical && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Chemical:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.chemical}</span>
            </div>
          )}
          {action.display.current_stock !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Current Stock:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {action.display.current_stock} {action.display.unit || 'KG'}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gFray-500 dark:text-gray-400">
              {ENTRY_TYPE_LABELS[action.display.entry_type] || 'Adjusting'}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {action.display.quantity} {action.display.unit || 'KG'}
            </span>
          </div>
          {action.display.rate > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Rate:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                INR {action.display.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
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

      {/* Buttons */}
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
};
