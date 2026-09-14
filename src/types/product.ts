export interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number;
  quantity?: number;
  created_at?: string;
  updated_at?: string;
}