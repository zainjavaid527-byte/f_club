import axios from '../api/axios';
import type { Customer } from '../types/customer';

export const getCustomers = async (search = '') => {
  const response = await axios.get<Customer[]>('/customers', {
    params: {
      search,
    },
  });

  return response.data;
};

export const getCustomer = async (id: number) => {
  const response = await axios.get<Customer>(`/customers/${id}`);

  return response.data;
};

export const createCustomer = async (data: {
  name: string;
  phone?: string;
}) => {
  const response = await axios.post<{ customer: Customer }>(
    '/customers',
    data
  );

  return response.data.customer;
};

export const updateCustomer = async (
  id: number,
  data: {
    name: string;
    phone?: string;
  }
) => {
  const response = await axios.put<{ customer: Customer }>(
    `/customers/${id}`,
    data
  );

  return response.data.customer;
};

export const deleteCustomer = async (id: number) => {
  await axios.delete(`/customers/${id}`);
};