import axios from '../api/axios';
import type { Payment } from '../types/payment';

export const makePayment = async (data: {
  customer_session_id: number;
  amount: number;
  payment_method: string;
}) => {
  const response = await axios.post<{
    message: string;
    payment: Payment;
    total: number;
    paid: number;
    remaining: number;
  }>('/payments', data);

  return response.data;
};

// Payments for a single session (e.g. shown on that session's bill).
export const getPayments = async (sessionId: number) => {
  const response = await axios.get<Payment[]>(
    `/payments/session/${sessionId}`
  );

  return response.data;
};

// All payments across all sessions, with optional filters — used by the
// Sale Record page. Backend should support these as query params on
// GET /payments (adjust the endpoint/params below if yours differs).
export const getAllPayments = async (filters?: {
  search?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const response = await axios.get<Payment[]>('/payments', {
    params: filters,
  });

  return response.data;
};

// Lightweight total-sale summary — used on the Dashboard.
export const getPaymentsSummary = async (filters?: {
  date_from?: string;
  date_to?: string;
}) => {
  const response = await axios.get<{ total_sale: number }>(
    '/payments/summary',
    { params: filters }
  );

  return response.data;
};