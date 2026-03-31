import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../api/ai';
import { ordersAPI } from '../../api/orders';
import { customersAPI } from '../../api/customers';
import toast from 'react-hot-toast';
import {
  Bot, Loader2, WifiOff, ChevronDown, Sparkles, Database, ShoppingCart, Users, Package,
} from 'lucide-react';
import ChatSidebar from './components/ChatSidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import EmptyChat from './components/EmptyChat';

const CONTEXT_TYPES = [
  { value: 'general', label: 'General', icon: Sparkles },
  { value: 'sales', label: 'Sales', icon: ShoppingCart },
  { value: 'inventory', label: 'Inventory', icon: Package },
  { value: 'customers', label: 'Customers', icon: Users },
  { value: 'orders', label: 'Orders', icon: Database },
];

export default function AIAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [contextType, setContextType] = useState('general');
  const [isOnline, setIsOnline] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const [executingAction, setExecutingAction] = useState(false);
  const [actionResults, setActionResults] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function checkHealth() {
    try {
      const { data } = await aiAPI.health();
      setIsOnline(data.status === 'healthy' || data.status === 'degraded');
    } catch { setIsOnline(false); }
  }

  async function loadConversations() {
    try { const { data } = await aiAPI.listConversations(); setConversations(data.conversations || []); }
    catch { /* Silently fail */ }
  }

  async function loadConversationMessages(conversationId) {
    setLoading(true);
    setPendingAction(null);
    setActionResults({});
    try {
      const { data } = await aiAPI.getConversationMessages(conversationId);
      setMessages(data.messages || []);
      setActiveConversation(conversationId);
    } catch { toast.error('Failed to load conversation'); }
    finally { setLoading(false); }
  }

  async function handleSend(messageText) {
    const text = messageText || input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);
    setPendingAction(null);

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data } = await aiAPI.chat({
        message: text,
        conversation_id: activeConversation,
        context_type: contextType,
      });

      const assistantMsg = { role: 'assistant', content: data.response, timestamp: new Date().toISOString() };
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        if (data.action?.type) {
          setPendingAction({ messageIndex: updated.length - 1, action: data.action });
        }
        return updated;
      });

      if (!activeConversation) setActiveConversation(data.conversation_id);
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
        result = { message: `Order ${data.order_number || '#' + data.id} created successfully!`, link: '/orders', linkLabel: 'View Orders' };
      } else if (action.type === 'create_customer') {
        const { data } = await customersAPI.create(action.params);
        result = { message: `Customer "${data.first_name} ${data.last_name}" created successfully!`, link: '/customers', linkLabel: 'View Customers' };
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

  async function handleDeleteConversation(conversationId) {
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
    } catch { toast.error('Failed to delete conversation'); }
  }

  const activeTitle = conversations.find((c) => c.conversation_id === activeConversation)?.title || 'New Conversation';

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-200 flex-shrink-0 overflow-hidden`}>
        <ChatSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelect={loadConversationMessages}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
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
                <button key={ct.value} onClick={() => setContextType(ct.value)} title={ct.label}
                  className={`p-1.5 rounded-md transition-colors ${
                    contextType === ct.value
                      ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  <ct.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            {isOnline !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {isOnline ? (
                  <><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Online</>
                ) : (
                  <><WifiOff className="h-3.5 w-3.5" /> Offline</>
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
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <EmptyChat onSend={handleSend} disabled={sending || isOnline === false} />
          )}
          {!loading && messages.length > 0 && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={`${msg.id || i}-${msg.timestamp || i}`}
                  msg={msg}
                  index={i}
                  pendingAction={pendingAction}
                  actionResult={actionResults[i]}
                  onConfirm={handleConfirmAction}
                  onCancel={handleCancelAction}
                  executingAction={executingAction}
                />
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

        <ChatInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSend={() => handleSend()}
          sending={sending}
          disabled={isOnline === false}
        />
      </div>
    </div>
  );
}
