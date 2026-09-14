import axios from '../api/axios';

export interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  type: 'bill' | 'payment' | 'udhaar';
  amount: number;
  paid?: number;
  remaining?: number;
}

export interface CustomerLedger {
  customer: {
    id: number;
    name: string;
    phone?: string;
  };
  total_bill: number;
  total_paid: number;
  remaining: number;
  ledger: LedgerEntry[];
}

export const getCustomerLedger = async (
  customerId: number
): Promise<CustomerLedger> => {
  const response = await axios.get(
    `/customers/${customerId}/ledger`
  );

  return response.data.data ?? response.data;
};