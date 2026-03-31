// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('../api/ai', () => ({
  aiAPI: { quickInsights: vi.fn() },
}));

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

vi.mock('lucide-react', () => {
  const stub = (props) => <span data-testid={props['data-testid'] || 'icon'} />;
  return {
    Sparkles: stub, RefreshCw: stub, AlertTriangle: stub,
    TrendingUp: stub, ShoppingCart: stub, Users: stub, Package: stub, Info: stub,
  };
});

import AIInsightsWidget from './AIInsightsWidget';
import { aiAPI } from '../api/ai';

const INSIGHTS = [
  { title: 'Revenue Up', summary: 'Revenue increased 10%', category: 'sales', priority: 'info' },
  { title: 'Low Stock Alert', summary: 'HCL is low', category: 'inventory', priority: 'critical' },
  { title: 'New Customers', summary: '5 new this week', category: 'customers', priority: 'warning' },
];

describe('AIInsightsWidget', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading skeleton initially', () => {
    aiAPI.quickInsights.mockReturnValue(new Promise(() => {}));
    render(<AIInsightsWidget />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders insights on success', async () => {
    aiAPI.quickInsights.mockResolvedValue({ data: { insights: INSIGHTS } });
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText('Revenue Up')).toBeInTheDocument());
    expect(screen.getByText('Low Stock Alert')).toBeInTheDocument();
    expect(screen.getByText('New Customers')).toBeInTheDocument();
  });

  it('shows error state and retry button on failure', async () => {
    aiAPI.quickInsights.mockRejectedValue(new Error('fail'));
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText(/AI service unavailable/)).toBeInTheDocument());
  });

  it('retries fetch on refresh button click in error state', async () => {
    aiAPI.quickInsights.mockRejectedValueOnce(new Error('fail'));
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText(/AI service unavailable/)).toBeInTheDocument());

    aiAPI.quickInsights.mockResolvedValue({ data: { insights: INSIGHTS } });
    const buttons = document.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(screen.getByText('Revenue Up')).toBeInTheDocument());
  });

  it('shows empty message when no insights', async () => {
    aiAPI.quickInsights.mockResolvedValue({ data: { insights: [] } });
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText('No insights available')).toBeInTheDocument());
  });

  it('renders heading text', async () => {
    aiAPI.quickInsights.mockResolvedValue({ data: { insights: [] } });
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText('AI Insights')).toBeInTheDocument());
  });

  it('handles missing insights key gracefully', async () => {
    aiAPI.quickInsights.mockResolvedValue({ data: {} });
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText('No insights available')).toBeInTheDocument());
  });

  it('applies critical priority styling', async () => {
    aiAPI.quickInsights.mockResolvedValue({ data: { insights: [INSIGHTS[1]] } });
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText('Low Stock Alert')).toBeInTheDocument());
    const card = screen.getByText('Low Stock Alert').closest('.rounded-lg');
    expect(card.className).toContain('border-red-200');
  });

  it('applies warning priority styling', async () => {
    aiAPI.quickInsights.mockResolvedValue({ data: { insights: [INSIGHTS[2]] } });
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText('New Customers')).toBeInTheDocument());
    const card = screen.getByText('New Customers').closest('.rounded-lg');
    expect(card.className).toContain('border-yellow-200');
  });

  it('falls back to default style for unknown priority', async () => {
    const unknownInsight = { title: 'Test', summary: 'x', category: 'unknown', priority: 'unknown' };
    aiAPI.quickInsights.mockResolvedValue({ data: { insights: [unknownInsight] } });
    render(<AIInsightsWidget />);
    await waitFor(() => expect(screen.getByText('Test')).toBeInTheDocument());
  });
});
