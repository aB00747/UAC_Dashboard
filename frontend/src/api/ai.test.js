import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { aiAPI } from './ai';
import client from './client';

beforeEach(() => vi.clearAllMocks());

describe('aiAPI', () => {
  it('health', () => { aiAPI.health(); expect(client.get).toHaveBeenCalledWith('/ai/health/'); });
  it('chat', () => { aiAPI.chat({ message: 'hi' }); expect(client.post).toHaveBeenCalledWith('/ai/chat/', { message: 'hi' }); });
  it('listConversations', () => { aiAPI.listConversations(); expect(client.get).toHaveBeenCalledWith('/ai/conversations/'); });
  it('getConversationMessages', () => { aiAPI.getConversationMessages('c1'); expect(client.get).toHaveBeenCalledWith('/ai/conversations/c1/messages/'); });
  it('deleteConversation', () => { aiAPI.deleteConversation('c1'); expect(client.delete).toHaveBeenCalledWith('/ai/conversations/c1/'); });
  it('generateInsight', () => { aiAPI.generateInsight({ insight_type: 'sales_trend' }); expect(client.post).toHaveBeenCalledWith('/ai/insights/generate/', { insight_type: 'sales_trend' }); });
  it('quickInsights', () => { aiAPI.quickInsights(); expect(client.get).toHaveBeenCalledWith('/ai/insights/quick/'); });
  it('processDocument', () => { aiAPI.processDocument({ file_path: 'a.pdf' }); expect(client.post).toHaveBeenCalledWith('/ai/documents/process/', { file_path: 'a.pdf' }); });
});
