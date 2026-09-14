import type { Product } from './product';

export interface SessionItem {
  id: number;
  customer_session_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;

  product?: Product;

  created_at: string;
  updated_at: string;
}