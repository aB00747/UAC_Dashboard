import PropTypes from 'prop-types';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';

export default function ChatSidebar({ conversations, activeConversation, onSelect, onNew, onDelete }) {
  return (
    <div className="w-72 h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-3">
        <button onClick={onNew}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.conversation_id}
            onClick={() => onSelect(conv.conversation_id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors group flex items-center justify-between ${
              activeConversation === conv.conversation_id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{conv.title || 'Untitled'}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(conv.conversation_id); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </button>
        ))}
        {conversations.length === 0 && (
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-6">No conversations yet</p>
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