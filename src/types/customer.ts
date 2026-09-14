import type { CustomerSession } from './session';

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  sessions?: CustomerSession[];
}