import PropTypes from 'prop-types';
import { Bot } from 'lucide-react';
import ActionCard from './ActionCard';
import ActionSuccessBanner from './ActionSuccessBanner';

export default function ChatMessage({ msg, index, pendingAction, actionResult, onConfirm, onCancel, executingAction }) {
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          msg.role === 'user'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}
      >
        {msg.role === 'assistant' && (
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">AI</span>
          </div>
        )}
        <div className="whitespace-pre-wrap">{msg.content}</div>

        {pendingAction?.messageIndex === index && (
          <ActionCard
            action={pendingAction.action}
            onConfirm={onConfirm}
            onCancel={onCancel}
            executing={executingAction}
          />
        )}

        {actionResult && <ActionSuccessBanner result={actionResult} />}
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  msg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  pendingAction: PropTypes.object,
  actionResult: PropTypes.object,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  executingAction: PropTypes.bool,
};
