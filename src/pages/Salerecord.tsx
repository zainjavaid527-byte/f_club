import { useCallback, useEffect, useState } from 'react';
import { Search, Receipt, Banknote, CreditCard, Smartphone } from 'lucide-react';

import { getAllPayments } from '../services/paymentService';
import type { Payment } from '../types/payment';

import '../style/common.css';
import '../style/SaleRecord.css';

type PaymentRecord = Payment & {
  customer?: {
    id: number;
    name: string;
    phone?: string;
  };
};

const METHOD_META: Record<string, { label: string; icon: typeof Banknote }> = {
  cash: { label: 'Cash', icon: Banknote },
  card: { label: 'Card', icon: CreditCard },
  jazzcash: { label: 'JazzCash', icon: Smartphone },
  easypaisa: { label: 'EasyPaisa', icon: Smartphone },
};

function methodMeta(value: string) {
  return METHOD_META[value] ?? { label: value, icon: Banknote };
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } })
      .response;
    if (response?.data?.message) return response.data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SaleRecord() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPayments = useCallback(async () => {
    try {
      setError('');

      const data = await getAllPayments({
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      setPayments(data as PaymentRecord[]);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load sale record'));
    } finally {
      setLoading(false);
    }
  }, [search, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadPayments]);

  const totalAmount = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Sale Record</h1>
          <p>All payments received across customer sessions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="record-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="date-filter">
          <label>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="date-filter">
          <label>To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Count (top, no total here anymore) */}
      {!loading && payments.length > 0 && (
        <div className="record-summary">
          <span>{payments.length} payment{payments.length === 1 ? '' : 's'}</span>
        </div>
      )}

      {/* Table */}
      {loading ? null : payments.length === 0 ? (
        <div className="empty-state">
          <Receipt size={40} />
          <h3>No payments found</h3>
          <p>Try adjusting your search or date range.</p>
        </div>
      ) : (
        <>
          <div className="record-table-wrap">
            <table className="record-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Mobile No</th>
                  <th>Method</th>
                  <th className="align-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const { label, icon: Icon } = methodMeta(payment.payment_method);

                  return (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.created_at)}</td>
                      <td>{payment.customer?.name ?? '—'}</td>
                      <td>{payment.customer?.phone ?? '—'}</td>
                      <td>
                        <span className="method-tag">
                          <Icon size={14} />
                          {label}
                        </span>
                      </td>
                      <td className="align-right record-amount">
                        Rs. {Number(payment.amount).toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total — ab neeche, table ke baad */}
          <div className="record-total-footer">
            <span>Sale Total</span>
            <span className="record-total-footer-amount">
              Rs. {totalAmount.toFixed(0)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default SaleRecord;