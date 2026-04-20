import client from './client';

export const invoicesAPI = {
  list: (params) => client.get('/invoices/', { params }),
  get: (id) => client.get(`/invoices/${id}/`),
  create: (data) => client.post('/invoices/', data),
  update: (id, data) => client.patch(`/invoices/${id}/`, data),
  delete: (id) => client.delete(`/invoices/${id}/`),
  finalise: (id) => client.post(`/invoices/${id}/finalise/`),
  nextNumber: () => client.get('/invoices/next-number/'),

  // Company profiles
  profiles: {
    list: () => client.get('/invoices/company-profiles/'),
    create: (data) => client.post('/invoices/company-profiles/', data),
    update: (id, data) => client.patch(`/invoices/company-profiles/${id}/`, data),
    delete: (id) => client.delete(`/invoices/company-profiles/${id}/`),
  },
};
