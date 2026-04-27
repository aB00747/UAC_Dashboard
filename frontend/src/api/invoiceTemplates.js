import client from './client';

export const templatesAPI = {
  list:       (params) => client.get('/invoices/invoice-templates/', { params }),
  get:        (id)     => client.get(`/invoices/invoice-templates/${id}/`),
  create:     (data)   => client.post('/invoices/invoice-templates/', data),
  update:     (id, data) => client.patch(`/invoices/invoice-templates/${id}/`, data),
  delete:     (id)     => client.delete(`/invoices/invoice-templates/${id}/`),
  duplicate:  (id)     => client.post(`/invoices/invoice-templates/${id}/duplicate/`),
  setDefault: (id)     => client.post(`/invoices/invoice-templates/${id}/set-default/`),
};
