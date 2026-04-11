import { forwardRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import './ChatInput.css';

const ChatInput = forwardRef(function ChatInput({ value, onChange, onSend, sending, disabled }, ref) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function handleAutoResize(e) {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  return (
    <div className="chat-input">
      <div className="chat-input__wrapper">
        <div className="chat-input__container">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleAutoResize}
            placeholder={disabled ? 'AI service is offline...' : 'Ask about your business or request an action...'}
            disabled={sending || disabled}
            rows={1}
            className="chat-input__textarea"
          />
          <button
            onClick={onSend}
            disabled={!value.trim() || sending || disabled}
            className="chat-input__send-btn"
          >
            {sending
              ? <Loader2 className="chat-input__send-spinner" />
              : <Send className="chat-input__send-icon" />
            }
          </button>
        </div>
        <p className="chat-input__disclaimer">
          AI can view data and perform actions with your confirmation. Verify details before confirming.
        </p>
      </div>
    </div>
  );
});

export default ChatInput;
