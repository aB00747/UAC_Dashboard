import PropTypes from 'prop-types';
import { Sparkles } from 'lucide-react';
import './EmptyChat.css';

const SUGGESTED_QUESTIONS = [
  { tag: 'Revenue', text: 'What is our current revenue summary?' },
  { tag: 'Inventory', text: 'Which chemicals are running low on stock?' },
  { tag: 'Market', text: 'What is the current market price of Sulfuric Acid in India?' },
  { tag: 'Order', text: 'Place an order for 100kg HCL for new customer Rajesh from Mumbai' },
  { tag: 'Multi-step', text: 'Add Sodium Hydroxide to inventory and place an order for it' },
  { tag: 'Analytics', text: 'Who are our top 5 customers by revenue?' },
];

export default function EmptyChat({ onSend, disabled }) {
  return (
    <div className="empty-chat">
      <div className="empty-chat__inner">
        <div className="empty-chat__icon-wrap">
          <Sparkles className="empty-chat__icon" />
        </div>

        <div className="empty-chat__text">
          <h2 className="empty-chat__title">Umiya AI Assistant</h2>
          <p className="empty-chat__desc">
            I can autonomously handle your business tasks - place orders, create customers, add chemicals, check market prices, and chain multiple actions together.
          </p>
        </div>

        <div className="empty-chat__suggestions">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q.text}
              onClick={() => onSend(q.text)}
              disabled={disabled}
              className="empty-chat__card"
            >
              <span className="empty-chat__card-tag">{q.tag}</span>
              <span className="empty-chat__card-text">{q.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

EmptyChat.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
