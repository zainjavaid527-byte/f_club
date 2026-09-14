import axios from '../api/axios';
import type { SessionItem } from '../types/sessionItem';

export const addSessionItem = async (data: {
  customer_session_id: number;
  product_id: number;
  quantity: number;
}) => {
  const response = await axios.post<{ item: SessionItem }>(
    '/session-items',
    data
  );

  return response.data.item;
};

export const deleteSessionItem = async (id: number) => {
  await axios.delete(`/session-items/${id}`);
};