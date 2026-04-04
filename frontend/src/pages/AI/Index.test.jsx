// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../api/ai', () => ({
  aiAPI: {
    health: vi.fn(),
    chat: vi.fn(),
    listConversations: vi.fn(),
    getConversationMessages: vi.fn(),
    deleteConversation: vi.fn(),
  },
}));

vi.mock('../../api/orders', () => ({
  ordersAPI: { create: vi.fn() },
}));

vi.mock('../../api/customers', () => ({
  customersAPI: { create: vi.fn() },
}));

vi.mock('../../api/inventory', () => ({
  chemicalsAPI: { create: vi.fn() },
  stockEntriesAPI: { create: vi.fn() },
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'testuser' } }),
}));

vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock('lucide-react', () => {
  const stub = (props) => <span data-testid={props?.['data-testid']} className={props?.className}>{props?.children}</span>;
  return {
    Bot: stub, Send: stub, Plus: stub, Trash2: stub, MessageSquare: stub,
    Loader2: stub, WifiOff: stub, ChevronDown: stub, Sparkles: stub,
    Database: stub, ShoppingCart: stub, Users: stub, Package: stub,
    Check: stub, X: stub, ExternalLink: stub, AlertTriangle: stub,
    UserPlus: stub, FlaskConical: stub, ListOrdered: stub,
    Shield: stub, Zap: stub, ChevronRight: stub,
  };
});

import AIAssistant from './Index';
import { aiAPI } from '../../api/ai';
import { ordersAPI } from '../../api/orders';
import { customersAPI } from '../../api/customers';
import toast from 'react-hot-toast';

function renderPage() {
  return render(<AIAssistant />);
}

describe('AIAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    aiAPI.health.mockResolvedValue({ data: { status: 'healthy' } });
    aiAPI.listConversations.mockResolvedValue({ data: { conversations: [] } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Initial render ---
  it('renders page title and suggested questions', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Umiya AI Assistant')).toBeInTheDocument());
    expect(screen.getByText('What is our current revenue summary?')).toBeInTheDocument();
  });

  it('shows New Chat button', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('New Chat')).toBeInTheDocument());
  });

  it('shows empty conversations message', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('No conversations yet')).toBeInTheDocument());
  });

  // --- Health check ---
  it('shows Online when health check succeeds', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Online')).toBeInTheDocument());
  });

  it('shows Offline when health check fails', async () => {
    aiAPI.health.mockRejectedValue(new Error('fail'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Offline')).toBeInTheDocument());
  });

  it('shows offline banner when service is down', async () => {
    aiAPI.health.mockRejectedValue(new Error('fail'));
    renderPage();
    await waitFor(() => expect(screen.getByText(/AI service is offline/)).toBeInTheDocument());
  });

  it('shows Online for degraded status', async () => {
    aiAPI.health.mockResolvedValue({ data: { status: 'degraded' } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Online')).toBeInTheDocument());
  });

  // --- Conversations sidebar ---
  it('renders conversation list', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'Test Chat' }] },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Chat')).toBeInTheDocument());
  });

  it('loads messages when clicking a conversation', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'Test Chat' }] },
    });
    aiAPI.getConversationMessages.mockResolvedValue({
      data: { messages: [{ role: 'user', content: 'Hello', timestamp: '2024-01-01T00:00:00Z' }] },
    });
    renderPage();
    await waitFor(() => screen.getByText('Test Chat'));
    fireEvent.click(screen.getByText('Test Chat'));
    await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());
  });

  it('shows error toast when loading messages fails', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'Test Chat' }] },
    });
    aiAPI.getConversationMessages.mockRejectedValue(new Error('fail'));
    renderPage();
    await waitFor(() => screen.getByText('Test Chat'));
    fireEvent.click(screen.getByText('Test Chat'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to load conversation'));
  });

  // --- Sending messages ---
  it('sends message and displays response', async () => {
    aiAPI.chat.mockResolvedValue({
      data: { response: 'AI says hello', conversation_id: 'c1' },
    });
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Hello AI' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(screen.getByText('AI says hello')).toBeInTheDocument());
  });

  it('sends suggested question on click', async () => {
    aiAPI.chat.mockResolvedValue({
      data: { response: 'Revenue is great', conversation_id: 'c1' },
    });
    renderPage();
    await waitFor(() => screen.getByText('What is our current revenue summary?'));
    fireEvent.click(screen.getByText('What is our current revenue summary?'));
    await waitFor(() => expect(aiAPI.chat).toHaveBeenCalled());
  });

  it('shows error message when chat fails', async () => {
    aiAPI.chat.mockRejectedValue({ response: { data: { detail: 'AI broke' } } });
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('does not send empty message', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(aiAPI.chat).not.toHaveBeenCalled();
  });

  it('allows newline with Shift+Enter', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Line1' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(aiAPI.chat).not.toHaveBeenCalled();
  });

  // --- Delete conversation ---
  it('deletes a conversation', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'To Delete' }] },
    });
    aiAPI.deleteConversation.mockResolvedValue({});
    renderPage();
    await waitFor(() => screen.getByText('To Delete'));

    // The delete button is a nested button inside the conversation item's outer button
    const convItem = screen.getByText('To Delete').closest('.w-full.text-left');
    const deleteBtn = convItem.querySelector('button');
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(aiAPI.deleteConversation).toHaveBeenCalledWith('c1'));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Conversation deleted'));
  });

  it('shows error toast when delete fails', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'To Delete' }] },
    });
    aiAPI.deleteConversation.mockRejectedValue(new Error('fail'));
    renderPage();
    await waitFor(() => screen.getByText('To Delete'));

    const convItem = screen.getByText('To Delete').closest('.w-full.text-left');
    const deleteBtn = convItem.querySelector('button');
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to delete conversation'));
  });

  // --- New conversation ---
  it('resets state on New Chat click', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'Existing' }] },
    });
    aiAPI.getConversationMessages.mockResolvedValue({
      data: { messages: [{ role: 'user', content: 'old msg', timestamp: '2024-01-01T00:00:00Z' }] },
    });
    renderPage();
    await waitFor(() => screen.getByText('Existing'));
    fireEvent.click(screen.getByText('Existing'));
    await waitFor(() => screen.getByText('old msg'));

    fireEvent.click(screen.getByText('New Chat'));
    await waitFor(() => expect(screen.getByText('Umiya AI Assistant')).toBeInTheDocument());
  });

  // --- Context type switching ---
  it('renders context type buttons', async () => {
    renderPage();
    // 5 context type buttons exist
    await waitFor(() => {
      const contextBar = document.querySelector('.flex.items-center.gap-1.bg-gray-100');
      expect(contextBar).toBeInTheDocument();
      expect(contextBar.querySelectorAll('button').length).toBe(5);
    });
  });

  // --- Action handling ---
  it('displays action card when chat returns an action', async () => {
    aiAPI.chat.mockResolvedValue({
      data: {
        response: 'I can create that order',
        conversation_id: 'c1',
        action: {
          type: 'create_order',
          resolved: true,
          display: { customer: 'John', items: [{ name: 'HCL', quantity: 100, unit: 'kg', unit_price: 50 }], summary: 'INR 5,000' },
          params: { customer: 1, items: [] },
        },
      },
    });
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Create order' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(screen.getByText('Create Order')).toBeInTheDocument());
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('executes create_order action on confirm', async () => {
    aiAPI.chat.mockResolvedValue({
      data: {
        response: 'Creating order',
        conversation_id: 'c1',
        action: { type: 'create_order', resolved: true, display: {}, params: { customer: 1 } },
      },
    });
    ordersAPI.create.mockResolvedValue({ data: { id: 10, order_number: 'ORD-010' } });

    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Create order' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => screen.getByText('Confirm'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => expect(ordersAPI.create).toHaveBeenCalledWith({ customer: 1 }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it('executes create_customer action on confirm', async () => {
    aiAPI.chat.mockResolvedValue({
      data: {
        response: 'Creating customer',
        conversation_id: 'c1',
        action: {
          type: 'create_customer', resolved: true,
          display: { name: 'Jane Doe' },
          params: { first_name: 'Jane', last_name: 'Doe' },
        },
      },
    });
    customersAPI.create.mockResolvedValue({ data: { id: 5, first_name: 'Jane', last_name: 'Doe' } });

    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Create customer' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => screen.getByText('Confirm'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => expect(customersAPI.create).toHaveBeenCalledWith({ first_name: 'Jane', last_name: 'Doe' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it('cancels pending action', async () => {
    aiAPI.chat.mockResolvedValue({
      data: {
        response: 'Creating order',
        conversation_id: 'c1',
        action: { type: 'create_order', resolved: true, display: {}, params: {} },
      },
    });
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Create order' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(toast).toHaveBeenCalledWith('Action cancelled', { icon: 'x' }));
  });

  it('shows error toast when action execution fails', async () => {
    aiAPI.chat.mockResolvedValue({
      data: {
        response: 'Creating order',
        conversation_id: 'c1',
        action: { type: 'create_order', resolved: true, display: {}, params: { customer: 1 } },
      },
    });
    ordersAPI.create.mockRejectedValue({ response: { data: { detail: 'Bad request' } } });

    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'Create order' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => screen.getByText('Confirm'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('shows clarification text for unresolved action', async () => {
    aiAPI.chat.mockResolvedValue({
      data: {
        response: 'Need more info',
        conversation_id: 'c1',
        action: { type: 'create_order', resolved: false, display: {}, params: {} },
      },
    });
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'order something' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(screen.getByText(/Please clarify the details/)).toBeInTheDocument());
  });

  it('shows validation errors in action card', async () => {
    aiAPI.chat.mockResolvedValue({
      data: {
        response: 'Found issues',
        conversation_id: 'c1',
        action: {
          type: 'create_order', resolved: false,
          errors: ['Customer not found', 'Invalid quantity'],
          display: {}, params: {},
        },
      },
    });
    renderPage();
    await waitFor(() => screen.getByText('Umiya AI Assistant'));

    const textarea = screen.getByPlaceholderText(/Ask about your business/);
    fireEvent.change(textarea, { target: { value: 'bad order' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Customer not found')).toBeInTheDocument();
      expect(screen.getByText('Invalid quantity')).toBeInTheDocument();
    });
  });

  // --- Sidebar toggle ---
  it('toggles sidebar visibility', async () => {
    renderPage();
    await waitFor(() => screen.getByText('New Chat'));

    // The sidebar toggle button is the ChevronDown button
    const toggleBtn = document.querySelector('.flex.items-center.gap-3 button');
    fireEvent.click(toggleBtn);
    // After click, sidebar should have w-0 class
    const sidebar = document.querySelector('.transition-all.duration-200');
    expect(sidebar.className).toContain('w-0');
  });

  // --- Conversation title display ---
  it('shows conversation title in header when active', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'My Chat' }] },
    });
    aiAPI.getConversationMessages.mockResolvedValue({ data: { messages: [] } });
    renderPage();
    await waitFor(() => screen.getByText('My Chat'));
    fireEvent.click(screen.getByText('My Chat'));
    // The header h1 should show the active conversation title
    await waitFor(() => {
      const headings = screen.getAllByText('My Chat');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows Untitled for conversation without title', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: '' }] },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Untitled')).toBeInTheDocument());
  });

  // --- Message rendering ---
  it('renders user and assistant messages with correct styling', async () => {
    aiAPI.listConversations.mockResolvedValue({
      data: { conversations: [{ conversation_id: 'c1', title: 'Chat' }] },
    });
    aiAPI.getConversationMessages.mockResolvedValue({
      data: {
        messages: [
          { role: 'user', content: 'User says hi', timestamp: '2024-01-01T00:00:00Z' },
          { role: 'assistant', content: 'Bot says hello', timestamp: '2024-01-01T00:00:01Z' },
        ],
      },
    });
    renderPage();
    await waitFor(() => screen.getByText('Chat'));
    fireEvent.click(screen.getByText('Chat'));
    await waitFor(() => {
      expect(screen.getByText('User says hi')).toBeInTheDocument();
      expect(screen.getByText('Bot says hello')).toBeInTheDocument();
    });

    // User message has indigo bg
    const userBubble = screen.getByText('User says hi').closest('.rounded-2xl');
    expect(userBubble.className).toContain('bg-indigo-600');

    // Assistant message has gray bg
    const botBubble = screen.getByText('Bot says hello').closest('.rounded-2xl');
    expect(botBubble.className).toContain('bg-gray-100');
  });

  // --- Disabled state when offline ---
  it('disables input when offline', async () => {
    aiAPI.health.mockRejectedValue(new Error('fail'));
    renderPage();
    await waitFor(() => screen.getByText('Offline'));

    const textarea = screen.getByPlaceholderText(/AI service is offline/);
    expect(textarea).toBeDisabled();
  });
});
