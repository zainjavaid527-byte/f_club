import { Trash2, Utensils } from 'lucide-react';
import type { SessionItem } from '../../types/sessionItem';
import { deleteSessionItem } from '../../services/sessionItemService';

interface CanteenListProps {
  items: SessionItem[];
  onChanged: () => void;
}

function CanteenList({
  items,
  onChanged,
}: CanteenListProps) {
  const handleDelete = async (id: number) => {
    if (!confirm('Remove this item?')) return;

    try {
      await deleteSessionItem(id);
      onChanged();
    } catch {
      alert('Failed to remove item');
    }
  };

  return (
    <div className="bill-section">
      <div className="section-title">
        <div>
          <h3>Canteen Items</h3>
          <span>{items.length} items</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="section-empty">
          No canteen items added yet.
        </div>
      ) : (
        <div className="bill-list">
          {items.map((item) => (
            <div className="bill-row" key={item.id}>
              <div className="bill-item-info">
                <div className="item-icon">
                  <Utensils size={18} />
                </div>

                <div>
                  <strong>
                    {item.product?.name || 'Product'}
                  </strong>

                  <small>
                    {item.quantity} × Rs.{' '}
                    {Number(item.price).toFixed(0)}
                  </small>
                </div>
              </div>

              <div className="bill-row-right">
                <strong>
                  Rs. {Number(item.total).toFixed(0)}
                </strong>

                <button
                  className="delete-button"
                  onClick={() =>
                    handleDelete(item.id)
                  }
                  title="Remove item"
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

export default CanteenList;