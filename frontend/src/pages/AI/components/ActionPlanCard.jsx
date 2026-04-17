import PropTypes from 'prop-types';
import {
  ListOrdered, UserPlus, FlaskConical, Package, ShoppingCart,
  AlertTriangle, Check, X, Loader2, ChevronRight, Shield, Zap,
} from 'lucide-react';
import './ActionPlanCard.css';

const STEP_ICONS = {
  create_customer: UserPlus,
  create_chemical: FlaskConical,
  create_order: ShoppingCart,
  update_inventory: Package,
};

const STEP_LABELS = {
  create_customer: 'Create Customer',
  create_chemical: 'Add Chemical',
  create_order: 'Place Order',
  update_inventory: 'Update Stock',
};

function StepStatusBadge({ status }) {
  if (status === 'done') {
    return (
      <span className="plan-card__status-badge plan-card__status-badge--done">
        <Check className="plan-card__status-icon" /> Done
      </span>
    );
  }
  if (status === 'executing') {
    return (
      <span className="plan-card__status-badge plan-card__status-badge--executing">
        <Loader2 className="plan-card__status-spinner" /> Running
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="plan-card__status-badge plan-card__status-badge--failed">
        <X className="plan-card__status-icon" /> Failed
      </span>
    );
  }
  if (status === 'waiting') {
    return (
      <span className="plan-card__status-badge plan-card__status-badge--waiting">
        <Shield className="plan-card__status-icon" /> Needs Approval
      </span>
    );
  }
  return <span className="plan-card__status-badge plan-card__status-badge--pending">Pending</span>;
}

function StepDetails({ step }) {
  if (step.type === 'create_customer' && step.display) {
    return (
      <div className="plan-card__step-details">
        {step.display.name && <span>Name: <strong className="plan-card__step-detail-strong">{step.display.name}</strong></span>}
      </div>
    );
  }

  if (step.type === 'create_chemical' && step.display) {
    return (
      <div className="plan-card__step-details">
        {step.display.name && <div>Chemical: <strong className="plan-card__step-detail-strong">{step.display.name}</strong></div>}
        {step.display.code && <div>Code: {step.display.code}</div>}
        {step.display.selling_price > 0 && <div>Price: INR {step.display.selling_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>}
      </div>
    );
  }

  if (step.type === 'create_order' && step.display) {
    return (
      <div className="plan-card__step-details">
        {step.display.customer && <div>Customer: <strong className="plan-card__step-detail-strong">{step.display.customer}</strong></div>}
        {step.display.items?.map((item) => (
          <div key={`${item.name}-${item.quantity}`}>
            {item.name} x {item.quantity} {item.unit || ''} @ INR {(item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        ))}
        {step.display.summary && <div className="plan-card__step-detail-strong">{step.display.summary}</div>}
      </div>
    );
  }

  if (step.type === 'update_inventory' && step.display) {
    return (
      <div className="plan-card__step-details">
        {step.display.chemical && <span>{step.display.chemical}: +{step.display.quantity} {step.display.unit || 'KG'}</span>}
      </div>
    );
  }

  return null;
}

export default function ActionPlanCard({
  plan,
  stepStatuses,
  onExecute,
  onCancel,
  executing,
  currentStep,
  waitingForApproval,
  onApproveStep,
}) {
  if (!plan || !plan.steps?.length) return null;

  const allDone = plan.steps.every((_, i) => stepStatuses[i] === 'done');
  const hasErrors = plan.steps.some(s => s.errors?.length > 0);
  const allResolved = plan.steps.every(s => s.resolved !== false);

  const completedCount = plan.steps.filter((_, i) => stepStatuses[i] === 'done').length;
  const progress = (completedCount / plan.steps.length) * 100;

  return (
    <div className="plan-card">
      {/* Header */}
      <div className="plan-card__header">
        <ListOrdered className="plan-card__header-icon" />
        <span className="plan-card__header-label">Action Plan</span>
        {plan.has_high_risk && (
          <span className="plan-card__risk-badge">
            <Shield className="plan-card__risk-icon" /> Requires confirmation
          </span>
        )}
      </div>

      {/* Summary */}
      {plan.summary && (
        <p className="plan-card__summary">{plan.summary}</p>
      )}

      {/* Progress bar */}
      {executing && (
        <div className="plan-card__progress">
          <div className="plan-card__progress-header">
            <span>Progress</span>
            <span>{completedCount}/{plan.steps.length} steps</span>
          </div>
          <div className="plan-card__progress-track">
            <div className="plan-card__progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="plan-card__steps">
        {plan.steps.map((step, i) => {
          const Icon = STEP_ICONS[step.type] || Package;
          const status = stepStatuses[i] || 'pending';
          const isAutoStep = step.auto_execute;
          const isCurrent = currentStep === i;

          let stepClass = 'plan-card__step';
          if (isCurrent) stepClass += ' plan-card__step--current';
          else if (status === 'done') stepClass += ' plan-card__step--done';
          else if (status === 'failed') stepClass += ' plan-card__step--failed';

          let numClass = 'plan-card__step-num';
          if (status === 'done') numClass += ' plan-card__step-num--done';
          else if (isCurrent) numClass += ' plan-card__step-num--current';
          else numClass += ' plan-card__step-num--pending';

          return (
            <div key={step.step_id} className={stepClass}>
              <div className={numClass}>
                {status === 'done' ? <Check className="plan-card__step-num-icon" /> : i + 1}
              </div>

              <div className="plan-card__step-content">
                <div className="plan-card__step-header">
                  <Icon className="plan-card__step-type-icon" />
                  <span className="plan-card__step-label">
                    {STEP_LABELS[step.type] || step.type}
                  </span>
                  {isAutoStep && status === 'pending' && (
                    <span className="plan-card__auto-badge">
                      <Zap className="plan-card__auto-badge-icon" /> Auto
                    </span>
                  )}
                  <div className="plan-card__step-status">
                    <StepStatusBadge status={status} />
                  </div>
                </div>

                <StepDetails step={step} />

                {step.errors?.length > 0 && (
                  <div className="plan-card__step-errors">
                    {step.errors.map((err) => (
                      <div key={err} className="plan-card__step-error">
                        <AlertTriangle className="plan-card__step-error-icon" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {step.depends_on?.length > 0 && status === 'pending' && (
                  <div className="plan-card__step-deps">
                    <ChevronRight className="plan-card__step-deps-icon" />
                    After step{step.depends_on.length > 1 ? 's' : ''}: {step.depends_on.map(d => {
                      const idx = plan.steps.findIndex(s => s.step_id === d);
                      return idx >= 0 ? `#${idx + 1}` : d;
                    }).join(', ')}
                  </div>
                )}

                {status === 'waiting' && waitingForApproval === i && (
                  <button onClick={onApproveStep} className="plan-card__approve-btn">
                    <Check className="plan-card__approve-icon" /> Approve & Continue
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      {!allDone && !executing && (
        <div className="plan-card__actions">
          {allResolved && !hasErrors ? (
            <>
              <button onClick={onExecute} className="plan-card__btn plan-card__btn--execute">
                <Zap className="plan-card__btn-icon" /> Execute Plan
              </button>
              <button onClick={onCancel} className="plan-card__btn plan-card__btn--cancel">
                <X className="plan-card__btn-icon" /> Cancel
              </button>
            </>
          ) : (
            <p className="plan-card__clarify">
              Please clarify the details above so I can prepare the plan.
            </p>
          )}
        </div>
      )}

      {/* All done */}
      {allDone && (
        <div className="plan-card__done">
          <Check className="plan-card__done-icon" /> All steps completed successfully!
        </div>
      )}
    </div>
  );
}

StepStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

StepDetails.propTypes = {
  step: PropTypes.object.isRequired,
};

ActionPlanCard.propTypes = {
  plan: PropTypes.object.isRequired,
  stepStatuses: PropTypes.object.isRequired,
  onExecute: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  executing: PropTypes.bool,
  currentStep: PropTypes.number,
  waitingForApproval: PropTypes.number,
  onApproveStep: PropTypes.func,
};
