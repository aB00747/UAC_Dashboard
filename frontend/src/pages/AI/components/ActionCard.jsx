import PropTypes from 'prop-types';
import { ShoppingCart, UserPlus, FlaskConical, Package, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import './ActionCard.css';

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
    <div className="action-card">
      <div className="action-card__header">
        <Icon className="action-card__header-icon" />
        <span className="action-card__header-label">{config.label}</span>
      </div>

      {/* Create Order display */}
      {action.type === 'create_order' && action.display && (
        <div className="action-card__details">
          {action.display.customer && (
            <div className="action-card__row">
              <span className="action-card__label">Customer:</span>
              <span className="action-card__value">{action.display.customer}</span>
            </div>
          )}
          {action.display.items?.map((item) => (
            <div key={`${item.name}-${item.quantity}`} className="action-card__row">
              <span className="action-card__label">
                {item.name} x {item.quantity} {item.unit}
              </span>
              <span className="action-card__value">
                INR {(item.quantity * item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {action.display.summary && (
            <div className="action-card__total">
              <span className="action-card__total-label">Total:</span>
              <span className="action-card__total-value">{action.display.summary}</span>
            </div>
          )}
        </div>
      )}

      {/* Create Customer display */}
      {action.type === 'create_customer' && action.display && (
        <div className="action-card__details">
          <div className="action-card__row">
            <span className="action-card__label">Name:</span>
            <span className="action-card__value">{action.display.name}</span>
          </div>
        </div>
      )}

      {/* Create Chemical display */}
      {action.type === 'create_chemical' && action.display && (
        <div className="action-card__details">
          {action.display.name && (
            <div className="action-card__row">
              <span className="action-card__label">Chemical:</span>
              <span className="action-card__value">{action.display.name}</span>
            </div>
          )}
          {action.display.code && (
            <div className="action-card__row">
              <span className="action-card__label">Code:</span>
              <span className="action-card__value">{action.display.code}</span>
            </div>
          )}
          {action.display.unit && (
            <div className="action-card__row">
              <span className="action-card__label">Unit:</span>
              <span className="action-card__value">{action.display.unit}</span>
            </div>
          )}
          {action.display.selling_price > 0 && (
            <div className="action-card__row">
              <span className="action-card__label">Selling Price:</span>
              <span className="action-card__value">
                INR {action.display.selling_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {action.display.gst > 0 && (
            <div className="action-card__row">
              <span className="action-card__label">GST:</span>
              <span className="action-card__value">{action.display.gst}%</span>
            </div>
          )}
          {action.display.category && (
            <div className="action-card__row">
              <span className="action-card__label">Category:</span>
              <span className="action-card__value">{action.display.category}</span>
            </div>
          )}
        </div>
      )}

      {/* Update Inventory display */}
      {action.type === 'update_inventory' && action.display && (
        <div className="action-card__details">
          {action.display.chemical && (
            <div className="action-card__row">
              <span className="action-card__label">Chemical:</span>
              <span className="action-card__value">{action.display.chemical}</span>
            </div>
          )}
          {action.display.current_stock !== undefined && (
            <div className="action-card__row">
              <span className="action-card__label">Current Stock:</span>
              <span className="action-card__value">
                {action.display.current_stock} {action.display.unit || 'KG'}
              </span>
            </div>
          )}
          <div className="action-card__row">
            <span className="action-card__label">
              {ENTRY_TYPE_LABELS[action.display.entry_type] || 'Adjusting'}:
            </span>
            <span className="action-card__value">
              {action.display.quantity} {action.display.unit || 'KG'}
            </span>
          </div>
          {action.display.rate > 0 && (
            <div className="action-card__row">
              <span className="action-card__label">Rate:</span>
              <span className="action-card__value">
                INR {action.display.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {hasErrors && (
        <div className="action-card__errors">
          {action.errors.map((err) => (
            <div key={err} className="action-card__error">
              <AlertTriangle className="action-card__error-icon" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="action-card__actions">
        {isResolved && !hasErrors ? (
          <>
            <button onClick={onConfirm} disabled={executing} className="action-card__btn action-card__btn--confirm">
              {executing ? <Loader2 className="action-card__btn-spinner" /> : <Check className="action-card__btn-icon" />}
              {executing ? 'Processing...' : 'Confirm'}
            </button>
            <button onClick={onCancel} disabled={executing} className="action-card__btn action-card__btn--cancel">
              <X className="action-card__btn-icon" /> Cancel
            </button>
          </>
        ) : (
          <p className="action-card__clarify">
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
