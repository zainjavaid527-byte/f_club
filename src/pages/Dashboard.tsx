import { useCallback, useEffect, useState } from 'react';
import {
  Loader2,
  Users,
  Play,
  AlertCircle,
  ArrowRight,
  Banknote,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { getCustomers } from '../services/customerService';
import { getDues } from '../services/sessionService';
import { getPaymentsSummary } from '../services/paymentService';

import type { Customer } from '../types/customer';

import '../style/common.css';
import '../style/Dashboard.css';

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

function Dashboard() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dues, setDues] = useState<DuesResponse | null>(null);
  const [totalSale, setTotalSale] = useState(0);

  // Independent loading flags — each section renders as soon as its
  // own data is ready, instead of waiting for the slowest request.
  const [customersLoading, setCustomersLoading] = useState(true);
  const [duesLoading, setDuesLoading] = useState(true);
  const [saleLoading, setSaleLoading] = useState(true);

  const [customersError, setCustomersError] = useState('');
  const [duesError, setDuesError] = useState('');
  const [saleError, setSaleError] = useState('');

  const loadData = useCallback(() => {
    setCustomersLoading(true);
    setDuesLoading(true);
    setSaleLoading(true);
    setCustomersError('');
    setDuesError('');
    setSaleError('');

    // Fired in parallel — independent of each other. Each one updates
    // its own state/loading flag as soon as it resolves, so a slow
    // endpoint no longer blocks the fast one from showing up.
    getCustomers('')
      .then(setCustomers)
      .catch((err: unknown) =>
        setCustomersError(getErrorMessage(err, 'Failed to load customers'))
      )
      .finally(() => setCustomersLoading(false));

    getDues()
      .then((data) => setDues(data as unknown as DuesResponse))
      .catch((err: unknown) =>
        setDuesError(getErrorMessage(err, 'Failed to load dues'))
      )
      .finally(() => setDuesLoading(false));

    getPaymentsSummary()
      .then((data) => setTotalSale(Number(data.total_sale ?? 0)))
      .catch((err: unknown) =>
        setSaleError(getErrorMessage(err, 'Failed to load sale total'))
      )
      .finally(() => setSaleLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = customers.filter(
    (c) => (c as any).sessions && (c as any).sessions.length > 0
  ).length;

  const duesCount = dues?.sessions.length ?? 0;
  const totalDue = Number(dues?.total_due ?? 0);

  const error = customersError || duesError || saleError;

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Quick overview of your club</p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Stat Cards */}

      <div className="stats-grid">

        <div
          className="stat-card"
          onClick={() => navigate('/customers')}
        >
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div className="stat-info">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">
              {customersLoading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                customers.length
              )}
            </span>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => navigate('/billing')}
        >
          <div className="stat-icon stat-icon-success">
            <Play size={22} />
          </div>

          <div className="stat-info">
            <span className="stat-label">Active Sessions</span>
            <span className="stat-value">
              {customersLoading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                activeCount
              )}
            </span>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => navigate('/billing')}
        >
          <div className="stat-icon stat-icon-danger">
            <AlertCircle size={22} />
          </div>

          <div className="stat-info">
            <span className="stat-label">Pending Udhaar</span>
            <span className="stat-value">
              {duesLoading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                `Rs. ${totalDue.toFixed(0)}`
              )}
            </span>
            {!duesLoading && (
              <span className="stat-sub">{duesCount} customer(s)</span>
            )}
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => navigate('/sale-record')}
        >
          <div className="stat-icon stat-icon-success">
            <Banknote size={22} />
          </div>

          <div className="stat-info">
            <span className="stat-label">Total Sale</span>
            <span className="stat-value">
              {saleLoading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                `Rs. ${totalSale.toFixed(0)}`
              )}
            </span>
          </div>
        </div>

      </div>

      {/* Quick lists */}

      <div className="dashboard-columns">

        <section className="billing-section">
          <div className="section-title">
            <div>
              <h3>Currently Playing</h3>
              <span>
                {customersLoading ? 'Loading…' : `${activeCount} active right now`}
              </span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/billing')}
            >
              View All
              <ArrowRight size={15} />
            </button>
          </div>

          {customersLoading ? (
            <div className="empty-state small">
              <Loader2 size={24} className="spin" />
              <p>Loading active sessions...</p>
            </div>
          ) : activeCount === 0 ? (
            <div className="empty-state small">
              <Play size={24} />
              <p>No active sessions right now.</p>
            </div>
          ) : (
            <div className="dues-list">
              {customers
                .filter((c) => (c as any).sessions && (c as any).sessions.length > 0)
                .slice(0, 5)
                .map((customer) => (
                  <div
                    className="dues-row"
                    key={customer.id}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <div className="dues-customer">
                      <strong>{customer.name}</strong>
                      {customer.phone && <span>{customer.phone}</span>}
                    </div>

                    <span className="badge badge-active">Active</span>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section className="billing-section">
          <div className="section-title">
            <div>
              <h3>Recent Udhaar</h3>
              <span>Top pending dues</span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/billing')}
            >
              View All
              <ArrowRight size={15} />
            </button>
          </div>

          {duesLoading ? (
            <div className="empty-state small">
              <Loader2 size={24} className="spin" />
              <p>Loading udhaar...</p>
            </div>
          ) : duesCount === 0 ? (
            <div className="empty-state small">
              <AlertCircle size={24} />
              <p>No pending udhaar. All clear!</p>
            </div>
          ) : (
            <div className="dues-list">
              {dues!.sessions.slice(0, 5).map((session) => (
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
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}

export default Dashboard;