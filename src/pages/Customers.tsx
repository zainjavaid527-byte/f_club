import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  UserPlus,
  User,
  Phone,
  Play,
  Loader2,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import type { Customer } from '../types/customer';

import {
  getCustomers,
  deleteCustomer,
} from '../services/customerService';

import {
  startSession,
} from '../services/sessionService';

import CustomerForm from '../components/customers/CustomerForm';

import '../style/common.css';
import '../style/Customers.css';

// If your Customer type doesn't already include `sessions`,
// this extends it locally so TypeScript knows about the
// eager-loaded active session data from the backend.
type CustomerWithSessions = Customer & {
  sessions?: { id: number; status: string }[];
};

// Small helper so we never need `any` in catch blocks.
function getErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err
  ) {
    const response = (err as { response?: { data?: { message?: string } } })
      .response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerWithSessions[]>([]);

  const [search, setSearch] = useState('');

  // True until the FIRST customers response ever arrives (guards the
  // initial page-load flash). False after that, even during later
  // searches, so typing in the search box doesn't blank the grid —
  // only the very first load needs this "don't judge yet" state.
  const [loading, setLoading] = useState(true);

  const [startingSession, setStartingSession] =
    useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      setError('');

      const data = await getCustomers(search);

      setCustomers(data);

    } catch (err: unknown) {
      setError(
        getErrorMessage(err, 'Failed to load customers')
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadCustomers]);

  const handleStartSession = async (
    customerId: number
  ) => {
    try {
      setStartingSession(customerId);

      await startSession(customerId);

      navigate(`/customers/${customerId}`);

    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to start session'));
    } finally {
      setStartingSession(null);
    }
  };

  const handleViewSession = (customerId: number) => {
    navigate(`/customers/${customerId}`);
  };

  const handleAddClick = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (customerId: number) => {
    const confirmed = window.confirm(
      'Kya aap is customer ko delete karna chahte hain?'
    );

    if (!confirmed) return;

    try {
      setDeletingId(customerId);

      await deleteCustomer(customerId);

      await loadCustomers();

    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete customer'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  return (
    <div className="page">

      {/* Header */}

      <div className="page-header">

        <div>
          <h1>Customers</h1>
          <p>
            Search customers and start their club session
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAddClick}
        >
          <UserPlus size={18} />
          Add Customer
        </button>

      </div>

      {/* Search */}

      <div className="search-box">

        <Search size={20} />

        <input
          type="text"
          placeholder="Search customer by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* Error */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {/* Customers */}

      {loading ? null : customers.length === 0 ? (

        <div className="empty-state">

          <User size={40} />

          <h3>No customers found</h3>

          <p>
            Try another search or add a new customer.
          </p>

        </div>

      ) : (

        <div className="customer-grid">

          {customers.map((customer) => {
            const hasActiveSession =
              Boolean(customer.sessions && customer.sessions.length > 0);

            return (
              <div
                className="customer-card"
                key={customer.id}
              >

                <div className="customer-avatar">
                  <User size={24} />
                </div>

                <div className="customer-info">

                  <h3>
                    {customer.name}
                    {hasActiveSession && (
                      <span className="badge badge-active">
                        Active
                      </span>
                    )}
                  </h3>

                  {customer.phone && (
                    <p>
                      <Phone size={15} />
                      {customer.phone}
                    </p>
                  )}

                </div>

                <div className="customer-actions">

                  <button
                    className="btn btn-icon"
                    title="Edit customer"
                    onClick={() => handleEditClick(customer)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="btn btn-icon btn-danger"
                    title="Delete customer"
                    onClick={() => handleDelete(customer.id)}
                    disabled={deletingId === customer.id}
                  >
                    {deletingId === customer.id ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>

                  {hasActiveSession ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleViewSession(customer.id)}
                    >
                      <Eye size={17} />
                      View Session
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={() =>
                        handleStartSession(customer.id)
                      }
                      disabled={
                        startingSession === customer.id
                      }
                    >

                      {startingSession === customer.id ? (
                        <>
                          <Loader2
                            size={17}
                            className="spin"
                          />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play size={17} />
                          Start Session
                        </>
                      )}

                    </button>
                  )}

                </div>

              </div>
            );
          })}

        </div>

      )}

      {/* Add / Edit Customer Modal */}

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={handleCloseForm}
          onSuccess={loadCustomers}
        />
      )}

    </div>
  );
}

export default Customers;