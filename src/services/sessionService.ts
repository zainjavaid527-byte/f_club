import axios from '../api/axios';
import type {
  CustomerSession,
  SessionBill,
} from '../types/session';

export const startSession = async (customerId: number) => {
  const response = await axios.post<{ session: CustomerSession }>(
    '/sessions',
    {
      customer_id: customerId,
    }
  );

  return response.data.session;
};

export const getSessionBill = async (sessionId: number) => {
  const response = await axios.get<SessionBill>(
    `/sessions/${sessionId}`
  );

  return response.data;
};

export const closeSession = async (sessionId: number) => {
  const response = await axios.post<{
    message: string;
    session: CustomerSession;
  }>(`/sessions/${sessionId}/close`);

  return response.data;
};

import type { DuesResponse } from '../types/session';

export const getDues = async () => {
  const response = await axios.get<DuesResponse>('/sessions/dues');

  return response.data;
};