import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import { makePayment } from '../../services/paymentService';

import type { SessionItem } from '../../types/sessionItem';
import '../../style/PaymentForm.css';

interface BillGame {
  id: number;
  game_type: string;
  rate: number | string;
}

interface PaymentFormProps {
  sessionId: number;
  remaining: number;
  onSuccess: () => void;
  customerName: string;
  games: BillGame[];
  items: SessionItem[];
  gamesTotal: number;
  canteenTotal: number;
  total: number;
  paid: number;
}

const PAYMENT_METHODS: { value: string; label: string; icon: typeof Banknote }[] = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'jazzcash', label: 'JazzCash', icon: Smartphone },
  { value: 'easypaisa', label: 'EasyPaisa', icon: Smartphone },
];

function paymentMethodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

function PaymentForm({
  sessionId,
  remaining,
  onSuccess,
  customerName,
  games,
  items,
  gamesTotal,
  canteenTotal,
  total,
  paid,
}: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  // Snapshot of the last successful payment, used to render the
  // printable receipt. Kept separate from `remaining`/`paid` props
  // so the receipt still shows the correct numbers even after the
  // parent re-fetches and remaining drops to 0.
  const [receipt, setReceipt] = useState<{
    amount: number;
    method: string;
    paidAt: string;
    newRemaining: number;
  } | null>(null);

  // Guards against onSuccess (which may close the session and
  // unmount this form) firing before the print dialog has actually
  // finished — and against firing it twice (afterprint + fallback).
  const onSuccessFiredRef = useRef(false);

  const runOnSuccessOnce = () => {
    if (onSuccessFiredRef.current) return;
    onSuccessFiredRef.current = true;
    onSuccess();
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      alert('Enter a valid payment amount');
      return;
    }

    if (paymentAmount > remaining) {
      alert(`Maximum payment is Rs. ${remaining}`);
      return;
    }

    try {
      setLoading(true);

      await makePayment({
        customer_session_id: sessionId,
        amount: paymentAmount,
        payment_method: method,
      });

      setReceipt({
        amount: paymentAmount,
        method,
        paidAt: new Date().toLocaleString(),
        newRemaining: remaining - paymentAmount,
      });

      setAmount('');

      onSuccessFiredRef.current = false;

      // Wait for the print dialog to fully close before letting the
      // parent refresh/close the session — closing the session
      // switches the parent view to "No Active Session" and would
      // unmount this receipt mid-print otherwise.
      const handleAfterPrint = () => {
        window.removeEventListener('afterprint', handleAfterPrint);
        runOnSuccessOnce();
      };

      window.addEventListener('afterprint', handleAfterPrint);

      // Fallback in case the browser doesn't fire 'afterprint'
      // (some mobile browsers / print-cancel edge cases) — still
      // eventually syncs the bill/session state.
      const fallbackTimer = setTimeout(() => {
        window.removeEventListener('afterprint', handleAfterPrint);
        runOnSuccessOnce();
      }, 4000);

      // Wait a tick so the receipt markup has rendered into the
      // portal with the new state before the print dialog opens.
      setTimeout(() => {
        window.print();
        clearTimeout(fallbackTimer);

        // Safety net: some browsers/webviews never fire 'afterprint'
        // reliably, which used to leave the receipt sitting in the
        // DOM (via the body portal) indefinitely — that stray node
        // is what was blocking clicks/typing on inputs elsewhere on
        // the page. Clear it a moment after print regardless.
        setTimeout(() => setReceipt(null), 1000);
      }, 100);

    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
        'Payment failed'
      );
    } finally {
      setLoading(false);
    }
  };

  // Printable receipt markup — rendered via portal directly into
  // document.body (see bottom of component), so it lives completely
  // outside the app's DOM tree. That means the print CSS only ever
  // has to hide the app root; it never needs to touch/collapse the
  // receipt's own ancestors, which was causing the blank-page bug.
  const receiptMarkup = receipt && (
    <div className="receipt-print">
      <div className="receipt-header">
        <h2>STONE CUE CLUB </h2>
        <p>{receipt.paidAt}</p>
      </div>

      <div className="receipt-customer">
        <strong>{customerName}</strong>
      </div>

      <hr />

      {games.length > 0 && (
        <div className="receipt-section">
          <p className="receipt-section-title">Games</p>
          {games.map((game) => (
            <div className="receipt-row" key={`game-${game.id}`}>
              <span>{game.game_type}</span>
              <span>Rs. {Number(game.rate).toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="receipt-section">
          <p className="receipt-section-title">Canteen</p>
          {items.map((item) => (
            <div className="receipt-row" key={`item-${item.id}`}>
              <span>
                {item.product?.name ?? 'Item'} x{item.quantity}
              </span>
              <span>Rs. {Number(item.total).toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}

      <hr />

      <div className="receipt-row">
        <span>Games Total</span>
        <span>Rs. {Number(gamesTotal).toFixed(0)}</span>
      </div>

      <div className="receipt-row">
        <span>Canteen Total</span>
        <span>Rs. {Number(canteenTotal).toFixed(0)}</span>
      </div>

      <div className="receipt-row receipt-bold">
        <span>Bill Total</span> 
        <span>Rs. {Number(total).toFixed(0)}</span>
      </div>

      <div className="receipt-row">
        <span>Paid So Far</span>
        <span>Rs. {Number(paid).toFixed(0)}</span>
      </div>

      <hr />

      <div className="receipt-row receipt-bold">
        <span>This Payment</span>
        <span>Rs. {receipt.amount.toFixed(0)}</span>
      </div>

      <div className="receipt-row">
        <span>Payment Type</span>
        <span>{paymentMethodLabel(receipt.method)}</span>
      </div>

      <div className="receipt-row receipt-bold">
        <span>Remaining</span>
        <span>Rs. {Math.max(0, receipt.newRemaining).toFixed(0)}</span>
      </div>

      <p className="receipt-footer">Thank you!</p>

      <div className="receipt-credit">
        <p>Software by Zain Javaid</p>
        <p>0307-6696813</p>
      </div>
    </div>
  );

  return (
    <div className="payment-card">

      <div className="section-title">
        <div>
          <h3>Receive Payment</h3>
          <span>Remaining: Rs. {remaining}</span>
        </div>
      </div>

      {remaining > 0 ? (
        <form onSubmit={handleSubmit}>

          <div className="payment-input">
            <label>Amount</label>

            <input
              type="number"
              min="1"
              max={remaining > 0 ? remaining : undefined}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="payment-method">
            <label>Payment Method</label>

            <div className="method-options">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={
                    method === value ? 'method active' : 'method'
                  }
                  onClick={() => setMethod(value)}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary payment-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving Payment...' : 'Receive Payment'}
          </button>

        </form>
      ) : (
        <div className="fully-paid-box">
          <Banknote size={28} />

          <div>
            <strong>Bill Fully Paid</strong>
            <p>No remaining amount.</p>
          </div>
        </div>
      )}

      {/* Rendered as a direct child of <body>, outside the app tree */}
      {receiptMarkup && createPortal(receiptMarkup, document.body)}

    </div>
  );
}

export default PaymentForm;