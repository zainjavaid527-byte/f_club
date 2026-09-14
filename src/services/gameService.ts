import axios from '../api/axios';
import type { Game } from '../types/game';

export const addGame = async (data: {
  customer_session_id: number;
  game_type: string;
  rate: number;
}) => {
  const response = await axios.post<{ game: Game }>(
    '/games',
    data
  );

  return response.data.game;
};

export const deleteGame = async (id: number) => {
  await axios.delete(`/games/${id}`);
};