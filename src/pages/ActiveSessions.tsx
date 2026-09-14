import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  User,
  Clock,
  ArrowRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import { getCustomers } from '../services/customerService';

import type { Customer } from '../types/customer';
import type { CustomerSession } from '../types/session';

import '../style/common.css';
import '../style/ActiveSessions.css';

interface ActiveSessionData {
  customer: Customer;
  session: CustomerSession;
}

function ActiveSessions() {
  const [sessions, setSessions] =
    useState<ActiveSessionData[]>([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const loadActiveSessions = useCallback(async () => {
    try {
      const customers = await getCustomers(search);

      const activeSessions: ActiveSessionData[] = [];

      for (const customer of customers) {
        const activeSession = customer.sessions?.find(
          (session) => session.status === 'active'
        );

        if (activeSession) {
          activeSessions.push({
            customer,
            session: activeSession,
          });
        }
      }

      setSessions(activeSessions);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadActiveSessions();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadActiveSessions]);

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Active Sessions</h1>

          <p>
            Customers currently using the club
          </p>
        </div>
      </div>

      <div className="search-box">
        <Search size={20} />

        <input
          type="text"
          placeholder="Search active customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? null : sessions.length === 0 ? (
        <div className="empty-state">
          <User size={40} />

          <h3>No active sessions</h3>

          <p>
            Start a session from the Customers page.
          </p>
        </div>
      ) : (
        <div className="session-grid">

          {sessions.map(({ customer, session }) => (
            <div
              className="session-card"
              key={session.id}
            >

              <div className="session-card-top">

                <div className="customer-avatar">
                  <User size={24} />
                </div>

                <div>
                  <h3>{customer.name}</h3>

                  <p>
                    <Clock size={14} />

                    Started{' '}

                    {session.started_at
                      ? new Date(
                          session.started_at
                        ).toLocaleTimeString()
                      : '—'}
                  </p>
                </div>

              </div>

              <div className="session-amount">

                <span>Current Bill</span>

                <strong>
                  Rs.{' '}
                  {Number(
                    session.total_amount ?? 0
                  ).toFixed(0)}
                </strong>

              </div>

              <Link
                className="open-session"
                to={`/customers/${customer.id}`}
              >
                Open Session

                <ArrowRight size={17} />
              </Link>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default ActiveSessions;