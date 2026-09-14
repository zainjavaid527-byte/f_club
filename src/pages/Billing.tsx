import { useCallback, useEffect, useState } from 'react';
import {
  Play,
  AlertCircle,
  User,
  Phone,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { getCustomers } from '../services/customerService';
import { getDues } from '../services/sessionService';

import type { Customer } from '../types/customer';

import '../style/common.css';
import '../style/Billing.css';

// Shape of each entry returned by GET /sessions/dues — matches
// CustomerSessionController::dues(), which eager-loads `customer`.
interface DueSession {
  id: number;
  remaining_amount: number | string;
  closed_at: string;
  customer: {
    id: number;
    name: string;
    phone: string | null;
  } | null;
}

interface DuesResponse {
  total_due: number | string;
  sessions: DueSession[];
}

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

function Billing() {
  const navigate = useNavigate();

  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [dues, setDues] = useState<DuesResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');

      // Fetched in parallel — they don't depend on each other.
      const [customers, duesData] = await Promise.all([
        getCustomers(''),
        getDues(),
      ]);

      const withActiveSession = customers.filter(
        (c) => (c as any).sessions && (c as any).sessions.length > 0
      );

      setActiveCustomers(withActiveSession);
      setDues(duesData as unknown as DuesResponse);

    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load billing data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p>Active sessions and pending udhaar in one place</p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Active Sessions */}

      <section className="billing-section">
        <div className="section-title">
          <div>
            <h3>Active Sessions</h3>
            <span>{activeCustomers.length} customer(s) currently playing</span>
          </div>
        </div>

        {loading ? null : activeCustomers.length === 0 ? (
          <div className="empty-state small">
            <Play size={24} />
            <p>No active sessions right now.</p>
          </div>
        ) : (
          <div className="customer-grid">
            {activeCustomers.map((customer) => (
              <div
                className="customer-card clickable"
                key={customer.id}
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <div className="customer-avatar">
                  <User size={24} />
                </div>

                <div className="customer-info">
                  <h3>
                    {customer.name}
                    <span className="badge badge-active">Active</span>
                  </h3>

                  {customer.phone && (
                    <p>
                      <Phone size={15} />
                      {customer.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Udhaar / Dues */}

      <section className="billing-section">
        <div className="section-title">
          <div>
            <h3>Udhaar / Dues</h3>
            <span>
              Total pending: Rs. {Number(dues?.total_due ?? 0).toFixed(0)}
            </span>
          </div>
        </div>

        {loading ? null : !dues || dues.sessions.length === 0 ? (
          <div className="empty-state small">
            <AlertCircle size={24} />
            <p>No pending udhaar. All clear!</p>
          </div>
        ) : (
          <div className="dues-list">
            {dues.sessions.map((session) => (
              <div
                className="dues-row"
                key={session.id}
                onClick={() => {
                  if (session.customer) {
                    navigate(`/customers/${session.customer.id}`);
                  }
                }}
              >
                <div className="dues-customer">
                  <strong>{session.customer?.name ?? 'Unknown customer'}</strong>
                  {session.customer?.phone && (
                    <span>{session.customer.phone}</span>
                  )}
                </div>

                <div className="dues-amount">
                  Rs. {Number(session.remaining_amount).toFixed(0)}
                </div>

                <div className="dues-date">
                  {new Date(session.closed_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Billing;