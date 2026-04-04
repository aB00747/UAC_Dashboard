import PropTypes from 'prop-types';
import { Bot } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What is our current revenue summary?',
  'Which chemicals are running low on stock?',
  'What is the current market price of Sulfuric Acid in India?',
  'Place an order for 100kg HCL for new customer Rajesh from Mumbai',
  'Add Sodium Hydroxide to inventory and place an order for it',
  'Who are our top 5 customers by revenue?',
];

export default function EmptyChat({ onSend, disabled }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Bot className="h-16 w-16 text-indigo-200 dark:text-indigo-800 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Umiya AI Assistant</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        I can autonomously handle your business tasks - place orders, create customers, add chemicals, check market prices, and chain multiple actions together. Just tell me what you need.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            disabled={disabled}
            className="text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

EmptyChat.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
