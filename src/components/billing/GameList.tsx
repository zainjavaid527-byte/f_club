import { Gamepad2, Trash2 } from 'lucide-react';
import type { Game } from '../../types/game';
import { deleteGame } from '../../services/gameService';

interface GameListProps {
  games: Game[];
  onChanged: () => void;
}

function GameList({ games, onChanged }: GameListProps) {
  const handleDelete = async (id: number) => {
    if (!confirm('Remove this game?')) return;

    try {
      await deleteGame(id);
      onChanged();
    } catch {
      alert('Failed to remove game');
    }
  };

  return (
    <div className="bill-section">
      <div className="section-title">
        <div>
          <h3>Games</h3>
          <span>{games.length} games</span>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="section-empty">
          No games added yet.
        </div>
      ) : (
        <div className="bill-list">
          {games.map((game, index) => (
            <div className="bill-row" key={game.id}>
              <div className="bill-item-info">
                <div className="item-icon">
                  <Gamepad2 size={18} />
                </div>

                <div>
                  <strong>
                    {game.game_type} Game #{index + 1}
                  </strong>

                  <small>
                    {game.played_at
                      ? new Date(game.played_at).toLocaleString()
                      : '—'}
                  </small>
                </div>
              </div>

              <div className="bill-row-right">
                <strong>Rs. {Number(game.rate).toFixed(0)}</strong>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(game.id)}
                  title="Remove game"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GameList;