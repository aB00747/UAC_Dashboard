import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../../api/ai';
import { ordersAPI } from '../../api/orders';
import { customersAPI } from '../../api/customers';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Bot, Send, Plus, Trash2, MessageSquare, Loader2, WifiOff,
  ChevronDown, Sparkles, Database, ShoppingCart, Users, Package,
  Check, X, ExternalLink, AlertTriangle,
} from 'lucide-react';

const CONTEXT_TYPES = [
  { value: 'general', label: 'General', icon: Sparkles },
  { value: 'sales', label: 'Sales', icon: ShoppingCart },
  { value: 'inventory', label: 'Inventory', icon: Package },
  { value: 'customers', label: 'Customers', icon: Users },
  { value: 'orders', label: 'Orders', icon: Database },
];

const SUGGESTED_QUESTIONS = [
  'What is our current revenue summary?',
  'Which chemicals are running low on stock?',
  'Who are our top 5 customers by revenue?',
  'How many orders are pending right now?',
  'Place an order for 100kg HCL for customer John',
];

const ACTION_LABELS = {
  create_order: 'Create Order',
  create_customer: 'Create Customer',
};

// --- Action Confirmation Card ---
function ActionCard({ action, onConfirm, onCancel, executing }) {
  if (!action) return null;

  const isResolved = action.resolved;
  const hasErrors = action.errors?.length > 0;

  return (
    <div className="mt-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          {ACTION_LABELS[action.type] || action.type}
        </span>
      </div>

      {/* Display details */}
      {action.type === 'create_order' && action.display && (
        <div className="space-y-2 mb-3 text-sm">
          {action.display.customer && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Customer:</span>
              <span className="font-medium text-gray-900 dark:text-white">{action.display.customer}</span>
            </div>
          )}
          {action.display.items?.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                {item.name} x {item.quantity} {item.unit}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                INR {(item.quantity * item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {action.display.summary && (
            <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-700">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
              <span className="font-bold text-gray-900 dark:text-white">{action.display.summary}</span>
            </div>
          )}
        </div>
      )}

      {action.type === 'create_customer' && action.display && (
        <div className="space-y-1 mb-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Name:</span>
            <span className="font-medium text-gray-900 dark:text-white">{action.display.name}</span>
          </div>
        </div>
      )}

      {/* Errors */}
      {hasErrors && (
        <div className="mb-3 space-y-1">
          {action.errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {isResolved && !hasErrors ? (
          <>
            <button
              onClick={onConfirm}
              disabled={executing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {executing ? 'Processing...' : 'Confirm'}
            </button>
            <button
              onClick={onCancel}
              disabled={executing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please clarify the details above so I can prepare the action.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Success Banner ---
function ActionSuccessBanner({ result }) {
  const navigate = useNavigate();
  if (!result) return null;

  return (
    <div className="mt-3 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-300">{result.message}</span>
        </div>
        {result.link && (
          <button
            onClick={() => navigate(result.link)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {result.linkLabel || 'View'}
          </button>
        )}
      </div>
    </div>
  );
}


export default function AIAssistant() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [contextType, setContextType] = useState('general');
  const [isOnline, setIsOnline] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingAction, setPendingAction] = useState(null); // { messageIndex, action }
  const [executingAction, setExecutingAction] = useState(false);
  const [actionResults, setActionResults] = useState({}); // { messageIndex: result }
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check AI service health
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkHealth() {
    try {
      const { data } = await aiAPI.health();
      setIsOnline(data.status === 'healthy' || data.status === 'degraded');
    } catch {
      setIsOnline(false);
    }
  }

  async function loadConversations() {
    try {
      const { data } = await aiAPI.listConversations();
      setConversations(data.conversations || []);
    } catch {
      // Silently fail
    }
  }

  async function loadConversationMessages(conversationId) {
    setLoading(true);
    setPendingAction(null);
    setActionResults({});
    try {
      const { data } = await aiAPI.getConversationMessages(conversationId);
      setMessages(data.messages || []);
      setActiveConversation(conversationId);
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(messageText) {
    const text = messageText || input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);
    setPendingAction(null);

    // Add user message optimistically
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data } = await aiAPI.chat({
        message: text,
        conversation_id: activeConversation,
        context_type: contextType,
      });

      // Add assistant response
      const assistantMsg = { role: 'assistant', content: data.response, timestamp: new Date().toISOString() };
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];

        // If there's an action, set it as pending
        if (data.action && data.action.type) {
          setPendingAction({ messageIndex: updated.length - 1, action: data.action });
        }

        return updated;
      });

      // Update active conversation
      if (!activeConversation) {
        setActiveConversation(data.conversation_id);
      }

      // Refresh conversation list
      loadConversations();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to get AI response';
      toast.error(detail);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;
    const { messageIndex, action } = pendingAction;

    setExecutingAction(true);
    try {
      let result = null;

      if (action.type === 'create_order') {
        const { data } = await ordersAPI.create(action.params);
        result = {
          message: `Order ${data.order_number || '#' + data.id} created successfully!`,
          link: '/orders',
          linkLabel: 'View Orders',
        };
      } else if (action.type === 'create_customer') {
        const { data } = await customersAPI.create(action.params);
        result = {
          message: `Customer "${data.first_name} ${data.last_name}" created successfully!`,
          link: '/customers',
          linkLabel: 'View Customers',
        };
      }

      if (result) {
        setActionResults((prev) => ({ ...prev, [messageIndex]: result }));
        toast.success(result.message);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data || 'Action failed';
      const errorMsg = typeof detail === 'object' ? JSON.stringify(detail) : detail;
      toast.error(errorMsg);
    } finally {
      setExecutingAction(false);
      setPendingAction(null);
    }
  }

  function handleCancelAction() {
    setPendingAction(null);
    toast('Action cancelled', { icon: 'x' });
  }

  function handleNewConversation() {
    setActiveConversation(null);
    setMessages([]);
    setPendingAction(null);
    setActionResults({});
    inputRef.current?.focus();
  }

  async function handleDeleteConversation(e, conversationId) {
    e.stopPropagation();
    try {
      await aiAPI.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.conversation_id !== conversationId));
      if (activeConversation === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        setPendingAction(null);
        setActionResults({});
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const activeTitle = conversations.find((c) => c.conversation_id === activeConversation)?.title || 'New Conversation';

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-200 flex-shrink-0 overflow-hidden`}>
        <div className="w-72 h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-3">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.conversation_id}
                onClick={() => loadConversationMessages(conv.conversation_id)}
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
                  onClick={(e) => handleDeleteConversation(e, conv.conversation_id)}
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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <ChevronDown className={`h-5 w-5 transition-transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
            </button>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{activeTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {CONTEXT_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() => setContextType(ct.value)}
                  title={ct.label}
                  className={`p-1.5 rounded-md transition-colors ${
                    contextType === ct.value
                      ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <ct.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            {isOnline !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {isOnline ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3.5 w-3.5" />
                    Offline
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {isOnline === false && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30 text-red-700 dark:text-red-400 text-sm text-center">
            AI service is offline. Please ensure Ollama and the AI service are running.
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-16 w-16 text-indigo-200 dark:text-indigo-800 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Umiya AI Assistant</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                Ask me anything about your business - sales, inventory, customers, orders, and more. I can also place orders and create customers for you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={sending || isOnline === false}
                    className="text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i}>
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

                      {/* Action card for this message */}
                      {pendingAction?.messageIndex === i && (
                        <ActionCard
                          action={pendingAction.action}
                          onConfirm={handleConfirmAction}
                          onCancel={handleCancelAction}
                          executing={executingAction}
                        />
                      )}

                      {/* Success banner for this message */}
                      {actionResults[i] && <ActionSuccessBanner result={actionResults[i]} />}
                    </div>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isOnline === false ? 'AI service is offline...' : 'Ask about your business or request an action...'}
                disabled={sending || isOnline === false}
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending || isOnline === false}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
            AI can view data and perform actions with your confirmation. Verify details before confirming.
          </p>
        </div>
      </div>
    </div>
  );
}
