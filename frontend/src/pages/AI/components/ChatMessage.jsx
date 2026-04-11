import PropTypes from 'prop-types';
import { Bot } from 'lucide-react';
import ActionCard from './ActionCard';
import ActionPlanCard from './ActionPlanCard';
import ActionSuccessBanner from './ActionSuccessBanner';
import './ChatMessage.css';

export default function ChatMessage({
  msg, index, pendingAction, pendingPlan, actionResult, planResult,
  onConfirm, onCancel, executingAction,
  onExecutePlan, onCancelPlan, executingPlan, currentPlanStep,
  planStepStatuses, waitingForApproval, onApproveStep,
}) {
  const hasPendingAction = pendingAction?.messageIndex === index;
  const hasPendingPlan = pendingPlan?.messageIndex === index;

  return (
    <div className={`chat-msg ${msg.role === 'user' ? 'chat-msg--user' : 'chat-msg--assistant'}`}>
      <div className={`chat-msg__bubble ${msg.role === 'user' ? 'chat-msg__bubble--user' : 'chat-msg__bubble--assistant'}`}>
        {msg.role === 'assistant' && (
          <div className="chat-msg__ai-badge">
            <Bot className="chat-msg__ai-icon" />
            <span className="chat-msg__ai-label">AI</span>
          </div>
        )}
        <div className="chat-msg__content">{msg.content}</div>

        {hasPendingAction && (
          <ActionCard
            action={pendingAction.action}
            onConfirm={onConfirm}
            onCancel={onCancel}
            executing={executingAction}
          />
        )}

        {hasPendingPlan && (
          <ActionPlanCard
            plan={pendingPlan.plan}
            stepStatuses={planStepStatuses || {}}
            onExecute={onExecutePlan}
            onCancel={onCancelPlan}
            executing={executingPlan}
            currentStep={currentPlanStep}
            waitingForApproval={waitingForApproval}
            onApproveStep={onApproveStep}
          />
        )}

        {actionResult && <ActionSuccessBanner result={actionResult} />}
        {planResult && <ActionSuccessBanner result={planResult} />}
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  msg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  pendingAction: PropTypes.object,
  pendingPlan: PropTypes.object,
  actionResult: PropTypes.object,
  planResult: PropTypes.object,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  executingAction: PropTypes.bool,
  onExecutePlan: PropTypes.func,
  onCancelPlan: PropTypes.func,
  executingPlan: PropTypes.bool,
  currentPlanStep: PropTypes.number,
  planStepStatuses: PropTypes.object,
  waitingForApproval: PropTypes.number,
  onApproveStep: PropTypes.func,
};
