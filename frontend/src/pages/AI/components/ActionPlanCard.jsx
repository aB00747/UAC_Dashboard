import PropTypes from 'prop-types';
import {
  ListOrdered, UserPlus, FlaskConical, Package, ShoppingCart,
  AlertTriangle, Check, X, Loader2, ChevronRight, Shield, Zap,
} from 'lucide-react';

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
  if (status === 'done') return <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium"><Check className="h-3 w-3" /> Done</span>;
  if (status === 'executing') return <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium"><Loader2 className="h-3 w-3 animate-spin" /> Running</span>;
  if (status === 'failed') return <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium"><X className="h-3 w-3" /> Failed</span>;
  if (status === 'waiting') return <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium"><Shield className="h-3 w-3" /> Needs Approval</span>;
  return <span className="text-xs text-gray-400 dark:text-gray-500">Pending</span>;
}

function StepDetails({ step }) {
  if (step.type === 'create_customer' && step.display) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {step.display.name && <span>Name: <strong className="text-gray-700 dark:text-gray-300">{step.display.name}</strong></span>}
      </div>
    );
  }

  if (step.type === 'create_chemical' && step.display) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
        {step.display.name && <div>Chemical: <strong className="text-gray-700 dark:text-gray-300">{step.display.name}</strong></div>}
        {step.display.code && <div>Code: {step.display.code}</div>}
        {step.display.selling_price > 0 && <div>Price: INR {step.display.selling_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>}
      </div>
    );
  }

  if (step.type === 'create_order' && step.display) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
        {step.display.customer && <div>Customer: <strong className="text-gray-700 dark:text-gray-300">{step.display.customer}</strong></div>}
        {step.display.items?.map((item) => (
          <div key={`${item.name}-${item.quantity}`}>
            {item.name} x {item.quantity} {item.unit || ''} @ INR {(item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        ))}
        {step.display.summary && <div className="font-medium text-gray-700 dark:text-gray-300 pt-1">{step.display.summary}</div>}
      </div>
    );
  }

  if (step.type === 'update_inventory' && step.display) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
    <div className="mt-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ListOrdered className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          Action Plan
        </span>
        {plan.has_high_risk && (
          <span className="ml-auto flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <Shield className="h-3 w-3" /> Requires confirmation
          </span>
        )}
      </div>

      {/* Summary */}
      {plan.summary && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{plan.summary}</p>
      )}

      {/* Progress bar */}
      {executing && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{completedCount}/{plan.steps.length} steps</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2 mb-3">
        {plan.steps.map((step, i) => {
          const Icon = STEP_ICONS[step.type] || Package;
          const status = stepStatuses[i] || 'pending';
          const isAutoStep = step.auto_execute;
          const isCurrent = currentStep === i;

          return (
            <div
              key={step.step_id}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-100 dark:bg-indigo-900/40'
                  : status === 'done'
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                    : status === 'failed'
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Step number */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                status === 'done'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : isCurrent
                    ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {status === 'done' ? <Check className="h-3 w-3" /> : i + 1}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {STEP_LABELS[step.type] || step.type}
                  </span>
                  {isAutoStep && status === 'pending' && (
                    <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                      <Zap className="h-2.5 w-2.5" /> Auto
                    </span>
                  )}
                  <div className="ml-auto">
                    <StepStatusBadge status={status} />
                  </div>
                </div>

                <StepDetails step={step} />

                {/* Step errors */}
                {step.errors?.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {step.errors.map((err) => (
                      <div key={err} className="flex items-start gap-1 text-[11px] text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dependencies */}
                {step.depends_on?.length > 0 && status === 'pending' && (
                  <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <ChevronRight className="h-2.5 w-2.5" />
                    After step{step.depends_on.length > 1 ? 's' : ''}: {step.depends_on.map(d => {
                      const idx = plan.steps.findIndex(s => s.step_id === d);
                      return idx >= 0 ? `#${idx + 1}` : d;
                    }).join(', ')}
                  </div>
                )}

                {/* Approval button for waiting steps */}
                {status === 'waiting' && waitingForApproval === i && (
                  <button
                    onClick={onApproveStep}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
                  >
                    <Check className="h-3 w-3" /> Approve & Continue
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      {!allDone && !executing && (
        <div className="flex items-center gap-2">
          {allResolved && !hasErrors ? (
            <>
              <button
                onClick={onExecute}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <Zap className="h-4 w-4" /> Execute Plan
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please clarify the details above so I can prepare the plan.
            </p>
          )}
        </div>
      )}

      {/* All done */}
      {allDone && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
          <Check className="h-4 w-4" /> All steps completed successfully!
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
