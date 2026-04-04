import { useState, useEffect, useRef, useCallback } from 'react';
import { aiAPI } from '../../api/ai';
import { ordersAPI } from '../../api/orders';
import { customersAPI } from '../../api/customers';
import { chemicalsAPI, stockEntriesAPI } from '../../api/inventory';
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

  // Single action state
  const [pendingAction, setPendingAction] = useState(null);
  const [executingAction, setExecutingAction] = useState(false);
  const [actionResults, setActionResults] = useState({});

  // Multi-step plan state
  const [pendingPlan, setPendingPlan] = useState(null);
  const [executingPlan, setExecutingPlan] = useState(false);
  const [currentPlanStep, setCurrentPlanStep] = useState(null);
  const [planStepStatuses, setPlanStepStatuses] = useState({});
  const [planResults, setPlanResults] = useState({});
  const [waitingForApproval, setWaitingForApproval] = useState(null);
  const approvalResolverRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    void checkHealth();
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
    clearActionState();
    try {
      const { data } = await aiAPI.getConversationMessages(conversationId);
      setMessages(data.messages || []);
      setActiveConversation(conversationId);
    } catch { toast.error('Failed to load conversation'); }
    finally { setLoading(false); }
  }

  function clearActionState() {
    setPendingAction(null);
    setPendingPlan(null);
    setActionResults({});
    setPlanResults({});
    setPlanStepStatuses({});
    setPlanStepResults({});
    setCurrentPlanStep(null);
    setWaitingForApproval(null);
    setExecutingAction(false);
    setExecutingPlan(false);
  }

  async function handleSend(messageText) {
    const text = messageText || input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);
    clearActionState();

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
        const msgIndex = updated.length - 1;

        // Check for action plan (multi-step)
        if (data.action_plan?.steps?.length) {
          setPendingPlan({ messageIndex: msgIndex, plan: data.action_plan });
        }
        // Check for single action
        else if (data.action?.type) {
          setPendingAction({ messageIndex: msgIndex, action: data.action });
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

  // ── Single action execution (backward compatible) ──────────────

  async function handleConfirmAction() {
    if (!pendingAction) return;
    const { messageIndex, action } = pendingAction;

    setExecutingAction(true);
    try {
      const result = await executeAction(action.type, action.params);
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

  // ── Multi-step plan execution ──────────────────────────────────

  const handleExecutePlan = useCallback(async () => {
    if (!pendingPlan) return;
    const { messageIndex, plan } = pendingPlan;
    const steps = plan.steps;
    const stepResults = {};
    const statuses = {};

    setExecutingPlan(true);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setCurrentPlanStep(i);

      // For high-risk steps, wait for user approval
      if (!step.auto_execute && step.risk_level === 'high') {
        statuses[i] = 'waiting';
        setPlanStepStatuses({ ...statuses });
        setWaitingForApproval(i);

        // Wait for user to approve this step
        const approved = await new Promise((resolve) => {
          approvalResolverRef.current = resolve;
        });

        if (!approved) {
          statuses[i] = 'failed';
          setPlanStepStatuses({ ...statuses });
          toast('Plan execution cancelled at step ' + (i + 1), { icon: 'x' });
          break;
        }
      }

      statuses[i] = 'executing';
      setPlanStepStatuses({ ...statuses });

      try {
        // Substitute IDs from previous steps
        const params = substituteStepReferences(step, stepResults, steps);

        const result = await executeAction(step.type, params);
        stepResults[step.step_id] = result;

        statuses[i] = 'done';
        setPlanStepStatuses({ ...statuses });
        setPlanStepResults({ ...stepResults });

        if (result?.message) {
          toast.success(`Step ${i + 1}: ${result.message}`);
        }
      } catch (err) {
        statuses[i] = 'failed';
        setPlanStepStatuses({ ...statuses });

        const detail = err.response?.data?.detail || err.response?.data || 'Step failed';
        const errorMsg = typeof detail === 'object' ? JSON.stringify(detail) : String(detail);
        toast.error(`Step ${i + 1} failed: ${errorMsg}`);
        break; // Stop on failure
      }
    }

    const allDone = Object.values(statuses).every(s => s === 'done');
    if (allDone) {
      setPlanResults((prev) => ({
        ...prev,
        [messageIndex]: {
          message: `All ${steps.length} steps completed successfully!`,
          link: steps[steps.length - 1]?.type === 'create_order' ? '/orders' : '/inventory',
          linkLabel: 'View Results',
        },
      }));
    }

    setExecutingPlan(false);
    setCurrentPlanStep(null);
    setWaitingForApproval(null);
  }, [pendingPlan]);

  function handleApproveStep() {
    if (approvalResolverRef.current) {
      approvalResolverRef.current(true);
      approvalResolverRef.current = null;
    }
  }

  function handleCancelPlan() {
    if (approvalResolverRef.current) {
      approvalResolverRef.current(false);
      approvalResolverRef.current = null;
    }
    setPendingPlan(null);
    setExecutingPlan(false);
    setCurrentPlanStep(null);
    setWaitingForApproval(null);
    toast('Plan cancelled', { icon: 'x' });
  }

  // ── Shared action executor ─────────────────────────────────────

  async function executeAction(type, params) {
    if (type === 'create_order') {
      const { data } = await ordersAPI.create(params);
      return {
        message: `Order ${data.order_number || '#' + data.id} created successfully!`,
        link: '/orders',
        linkLabel: 'View Orders',
        id: data.id,
      };
    }
    if (type === 'create_customer') {
      const { data } = await customersAPI.create(params);
      return {
        message: `Customer "${data.first_name} ${data.last_name}" created successfully!`,
        link: '/customers',
        linkLabel: 'View Customers',
        id: data.id,
      };
    }
    if (type === 'create_chemical') {
      const { data } = await chemicalsAPI.create(params);
      return {
        message: `Chemical "${data.chemical_name}" added to inventory!`,
        link: '/inventory',
        linkLabel: 'View Inventory',
        id: data.id,
      };
    }
    if (type === 'update_inventory') {
      const { data } = await stockEntriesAPI.create(params);
      return {
        message: `Inventory updated successfully!`,
        link: '/inventory',
        linkLabel: 'View Inventory',
        id: data.id,
      };
    }
    return null;
  }

  /**
   * Substitute references from previous step results into current step params.
   * When a create_order step depends on a create_customer step, we replace
   * the customer_name lookup with the actual customer ID from the previous step.
   */
  function substituteStepReferences(step, stepResults, allSteps) {
    const params = { ...step.params };

    if (step.type === 'create_order' && step.depends_on?.length) {
      for (const depId of step.depends_on) {
        const depResult = stepResults[depId];
        if (!depResult) continue;

        const depStep = allSteps.find(s => s.step_id === depId);
        if (!depStep) continue;

        // If dependency was a create_customer, use its ID
        if (depStep.type === 'create_customer' && depResult.id) {
          params.customer = depResult.id;
          delete params.customer_name;
        }

        // If dependency was a create_chemical, update item references
        if (depStep.type === 'create_chemical' && depResult.id) {
          const chemName = depStep.params?.chemical_name?.toLowerCase();
          const items = params.items || [];
          params.items = items.map(item => {
            if (item.chemical_name?.toLowerCase() === chemName || item.chemical === undefined) {
              return { ...item, chemical: depResult.id, chemical_name: undefined };
            }
            return item;
          });
        }
      }

      // For items that still have chemical_name but no ID, try to resolve them
      if (params.items) {
        params.items = params.items.map(item => {
          const { chemical_name, ...rest } = item;
          if (chemical_name && !rest.chemical) {
            // Keep chemical_name - the backend should handle it or we let it fail
            return item;
          }
          return rest;
        });
      }
    }

    return params;
  }

  // ── UI handlers ────────────────────────────────────────────────

  function handleNewConversation() {
    setActiveConversation(null);
    setMessages([]);
    clearActionState();
    inputRef.current?.focus();
  }

  async function handleDeleteConversation(conversationId) {
    try {
      await aiAPI.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.conversation_id !== conversationId));
      if (activeConversation === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        clearActionState();
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
                  // Single action props
                  pendingAction={pendingAction}
                  actionResult={actionResults[i]}
                  onConfirm={handleConfirmAction}
                  onCancel={handleCancelAction}
                  executingAction={executingAction}
                  // Multi-step plan props
                  pendingPlan={pendingPlan}
                  planResult={planResults[i]}
                  onExecutePlan={handleExecutePlan}
                  onCancelPlan={handleCancelPlan}
                  executingPlan={executingPlan}
                  currentPlanStep={currentPlanStep}
                  planStepStatuses={planStepStatuses}
                  waitingForApproval={waitingForApproval}
                  onApproveStep={handleApproveStep}
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
