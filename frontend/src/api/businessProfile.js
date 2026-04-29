import client from './client';

export const businessProfileAPI = {
  get: () => client.get('/business-profile/'),
  update: (data) => client.put('/business-profile/', data, {
    headers: { 'Content-Type': 'application/json' },
  }),
};
