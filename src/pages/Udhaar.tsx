import { useCallback, useEffect, useState } from 'react';
import {
  Wallet,
  User,
  Clock,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { getDues } from '../services/sessionService';

import type { CustomerSession } from '../types/session';

import PaymentForm from '../components/billing/PaymentForm';

import '../style/common.css';
import '../style/Udhaar.css';

function Udhaar() {
  const [sessions, setSessions] =
    useState<CustomerSession[]>([]);

  const [totalDue, setTotalDue] = useState(0);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const [openSessionId, setOpenSessionId] =
    useState<number | null>(null);

  const loadDues = useCallback(async () => {
    try {
      const data = await getDues();

      setSessions(data.sessions);
      setTotalDue(data.total_due);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDues();
  }, [loadDues]);

  const filteredSessions = sessions.filter((session) => {
    const name = session.customer?.name?.toLowerCase() || '';
    const phone = session.customer?.phone?.toLowerCase() || '';
    const term = search.toLowerCase();

    return name.includes(term) || phone.includes(term);
  });

  const toggleSession = (id: number) => {
    setOpenSessionId((current) =>
      current === id ? null : id
    );
  };

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Udhaar</h1>

          <p>
            Customers with pending dues from closed sessions
          </p>
        </div>
      </div>

      <div className="dues-summary-card">
        <Wallet size={24} />

        <div>
          <span>Total Outstanding</span>

          <strong>
            Rs. {Number(totalDue).toFixed(0)}
          </strong>
        </div>
      </div>

      <div className="search-box">
        <Search size={20} />

        <input
          type="text"
          placeholder="Search customer by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? null : filteredSessions.length === 0 ? (
        <div className="empty-state">
          <Wallet size={40} />

          <h3>No pending udhaar</h3>

          <p>
            All closed sessions are fully paid.
          </p>
        </div>
      ) : (
        <div className="dues-list">

          {filteredSessions.map((session) => (
            <div
              className="dues-item"
              key={session.id}
            >

              <div
                className="dues-item-header"
                onClick={() =>
                  toggleSession(session.id)
                }
              >

                <div className="customer-avatar">
                  <User size={22} />
                </div>

                <div className="dues-item-info">
                  <h3>
                    {session.customer?.name ||
                      'Unknown customer'}
                  </h3>

                  {session.customer?.phone && (
                    <p>
                      <Phone size={14} />
                      {session.customer.phone}
                    </p>
                  )}

                  <p>
                    <Clock size={14} />

                    Closed{' '}

                    {session.closed_at
                      ? new Date(
                          session.closed_at
                        ).toLocaleDateString()
                      : '—'}
                  </p>
                </div>

                <div className="dues-item-amount">
                  <span>Remaining</span>

                  <strong>
                    Rs.{' '}
                    {Number(
                      session.remaining_amount
                    ).toFixed(0)}
                  </strong>
                </div>

                {openSessionId === session.id ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}

              </div>

              {openSessionId === session.id && (
  <div className="dues-item-body">
    <PaymentForm
      sessionId={session.id}
      remaining={Number(session.remaining_amount)}
      onSuccess={() => {
        setOpenSessionId(null);
        loadDues();
      }}
      customerName={session.customer?.name ?? 'Unknown customer'}
      games={session.games ?? []}
      items={session.items ?? []}
      gamesTotal={
        session.games?.reduce((sum, g) => sum + Number(g.rate), 0) ?? 0
      }
      canteenTotal={
        session.items?.reduce((sum, i) => sum + Number(i.total), 0) ?? 0
      }
      total={Number(session.total_amount)}
      paid={Number(session.paid_amount)}
    />
  </div>
)}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Udhaar;