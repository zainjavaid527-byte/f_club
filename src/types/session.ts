import type { Customer } from './customer';
import type { Game } from './game';
import type { SessionItem } from './sessionItem';
import type { Payment } from './payment';

export interface CustomerSession {
  id: number;
  customer_id: number;
  started_at: string | null;
  closed_at: string | null;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'active' | 'closed';

  customer?: Customer;
  games?: Game[];
  items?: SessionItem[];
  payments?: Payment[];
}

export interface SessionBill {
  session: CustomerSession;
  games_total: number;
  canteen_total: number;
  total: number;
  paid: number;
  remaining: number;
}

export interface DuesResponse {
  total_due: number;
  sessions: CustomerSession[];
}