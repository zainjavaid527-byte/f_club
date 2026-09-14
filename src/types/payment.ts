export interface Payment {
  id: number;
  customer_session_id: number;
  amount: number;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}