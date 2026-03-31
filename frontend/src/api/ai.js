import client from './client';

export const aiAPI = {
  health: () => client.get('/ai/health/'),
  chat: (data) => client.post('/ai/chat/', data),
  listConversations: () => client.get('/ai/conversations/'),
  getConversationMessages: (conversationId) => client.get(`/ai/conversations/${conversationId}/messages/`),
  deleteConversation: (conversationId) => client.delete(`/ai/conversations/${conversationId}/`),
  generateInsight: (data) => client.post('/ai/insights/generate/', data),
  quickInsights: () => client.get('/ai/insights/quick/'),
  processDocument: (data) => client.post('/ai/documents/process/', data),
};
