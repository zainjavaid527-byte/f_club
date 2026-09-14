export interface Game {
  id: number;
  customer_session_id: number;
  game_type: string;
  rate: number;
  played_at: string | null;
  created_at: string;
  updated_at: string;
}