import client from './client';

export const auditLogsAPI = {
  list: (params) => client.get('/audit-logs/', { params }),
};
