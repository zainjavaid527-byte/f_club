import { useState } from 'react';
import { X, UserPlus, Pencil } from 'lucide-react';
import { createCustomer, updateCustomer } from '../../services/customerService';
import type { Customer } from '../../types/customer';

interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CustomerForm({
  customer,
  onClose,
  onSuccess,
}: CustomerFormProps) {
  const isEditing = Boolean(customer);

  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
      };

      if (isEditing && customer) {
        await updateCustomer(customer.id, payload);
      } else {
        await createCustomer(payload);
      }

      onSuccess();
      onClose();

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        (isEditing
          ? 'Failed to update customer'
          : 'Failed to create customer')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <div>
            <h2>{isEditing ? 'Edit Customer' : 'Add Customer'}</h2>
            <p>
              {isEditing
                ? 'Update customer details'
                : 'Create a new club customer'}
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Customer Name</label>

            <input
              type="text"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="text"
              placeholder="03XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-actions">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {isEditing ? <Pencil size={18} /> : <UserPlus size={18} />}

              {loading
                ? (isEditing ? 'Updating...' : 'Creating...')
                : (isEditing ? 'Update Customer' : 'Create Customer')}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default CustomerForm;