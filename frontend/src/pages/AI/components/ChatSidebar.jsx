import PropTypes from 'prop-types';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import './ChatSidebar.css';

export default function ChatSidebar({ conversations, activeConversation, onSelect, onNew, onDelete }) {
  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar__header">
        <button type="button" onClick={onNew} className="chat-sidebar__new-btn">
          <Plus className="chat-sidebar__new-btn-icon" /> New Chat
        </button>
      </div>

      <div className="chat-sidebar__label">Conversations</div>

      <div className="chat-sidebar__list">
        {conversations.map((conv) => (
          <div
            key={conv.conversation_id}
            className={`chat-sidebar__item ${activeConversation === conv.conversation_id ? 'chat-sidebar__item--active' : ''}`}
          >
            <button
              type="button"
              onClick={() => onSelect(conv.conversation_id)}
              className="chat-sidebar__item-btn"
            >
              <MessageSquare className="chat-sidebar__item-icon" />
              <span className="chat-sidebar__item-title">{conv.title || 'Untitled'}</span>
            </button>
            <button
              type="button"
              aria-label={`Delete conversation ${conv.title || 'Untitled'}`}
              onClick={() => onDelete(conv.conversation_id)}
              className="chat-sidebar__delete-btn"
            >
              <Trash2 className="chat-sidebar__delete-icon" />
            </button>
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="chat-sidebar__empty">No conversations yet</p>
        )}
      </div>
    </div>
  );
}

ChatSidebar.propTypes = {
  conversations: PropTypes.array.isRequired,
  activeConversation: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
