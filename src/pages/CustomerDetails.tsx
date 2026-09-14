import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  User,
  Play,
  Plus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  getCustomer,
} from '../services/customerService';

import {
  getSessionBill,
  startSession,
  closeSession,
} from '../services/sessionService';

import {
  addGame,
} from '../services/gameService';

import {
  getProducts,
} from '../services/productService';

import {
  addSessionItem,
} from '../services/sessionItemService';

import type { Customer } from '../types/customer';
import type { SessionBill } from '../types/session';
import type { Product } from '../types/product';

import GameList from '../components/billing/GameList';
import CanteenList from '../components/billing/CanteenList';
import BillSummary from '../components/billing/BillSummary';
import PaymentForm from '../components/billing/PaymentForm';

import '../style/common.css';
import '../style/CustomerDetails.css';

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

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customerId = Number(id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bill, setBill] = useState<SessionBill | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // True until the initial customer/bill load finishes — guards
  // against "Customer not found" flashing before data arrives.
  const [loading, setLoading] = useState(true);

  const [starting, setStarting] = useState(false);

  const [gameRate, setGameRate] = useState('100');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Loading flags so the specific button shows a spinner while its
  // request is in flight, instead of the whole page looking frozen.
  const [addingGame, setAddingGame] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  // Small toast shown briefly after a successful add, so the user
  // gets clear confirmation instead of just watching the list update.
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // Full initial load: customer + products fetched in PARALLEL
  // (they don't depend on each other), then bill only if there's
  // an active session.
  const loadInitial = useCallback(async () => {
    try {
      const [customerData, productData] = await Promise.all([
        getCustomer(customerId),
        getProducts(),
      ]);

      setCustomer(customerData);
      setProducts(productData);

      const activeSession = customerData.sessions?.find(
        (session) => session.status === 'active'
      );

      if (activeSession) {
        const billData = await getSessionBill(activeSession.id);
        setBill(billData);
      } else {
        setBill(null);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Lightweight refresh after adding a game/item/payment — only
  // refetches the bill for the CURRENT session. No customer or
  // products re-fetch, so this is a single fast API call.
  const refreshBill = useCallback(async () => {
    if (!bill) return;

    try {
      const billData = await getSessionBill(bill.session.id);
      setBill(billData);
    } catch (error) {
      console.error(error);
    }
  }, [bill]);

  // Refresh used after starting/closing a session, since whether
  // there IS an active session changes. Still skips re-fetching
  // products (those don't change here).
  const refreshCustomerAndBill = useCallback(async () => {
    try {
      const customerData = await getCustomer(customerId);
      setCustomer(customerData);

      const activeSession = customerData.sessions?.find(
        (session) => session.status === 'active'
      );

      if (activeSession) {
        const billData = await getSessionBill(activeSession.id);
        setBill(billData);
      } else {
        setBill(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, [customerId]);

  const handleStartSession = async () => {
    try {
      setStarting(true);
      await startSession(customerId);
      await refreshCustomerAndBill();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to start session'));
    } finally {
      setStarting(false);
    }
  };

  const handleAddGame = async () => {
    if (!bill) return;

    const rate = Number(gameRate);

    if (!rate || rate <= 0) {
      alert('Enter a valid game rate');
      return;
    }

    try {
      setAddingGame(true);

      await addGame({
        customer_session_id: bill.session.id,
        game_type: 'Snooker',
        rate,
      });

      await refreshBill();

      showToast('Game added successfully');

    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to add game'));
    } finally {
      setAddingGame(false);
    }
  };

  const handleAddProduct = async () => {
    if (!bill) return;

    const productId = Number(selectedProduct);
    const qty = Number(quantity);

    if (!productId) {
      alert('Select a product');
      return;
    }

    if (!qty || qty <= 0) {
      alert('Enter valid quantity');
      return;
    }

    try {
      setAddingItem(true);

      await addSessionItem({
        customer_session_id: bill.session.id,
        product_id: productId,
        quantity: qty,
      });

      setSelectedProduct('');
      setQuantity('1');

      await refreshBill();

      showToast('Item added successfully');

    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to add product'));
    } finally {
      setAddingItem(false);
    }
  };

  const handleCloseSession = async () => {
    if (!bill) return;

    if (
      bill.remaining > 0 &&
      !confirm(
        `There is Rs. ${bill.remaining} remaining. Close session anyway?`
      )
    ) {
      return;
    }

    if (!confirm('Are you sure you want to close this session?')) {
      return;
    }

    try {
      await closeSession(bill.session.id);
      alert('Session closed successfully');
      await refreshCustomerAndBill();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to close session'));
    }
  };

  // Called after a payment is submitted in PaymentForm (once the
  // print dialog has finished — see PaymentForm's afterprint logic).
  //
  // Business rule: receiving a payment always closes the session —
  // whether it was paid in full or only partially.
  //   - Fully paid  -> session closes, no due left.
  //   - Partial paid -> session still closes, but the leftover
  //     "remaining" amount is tracked as udhaar on a CLOSED session,
  //     so it automatically shows up on the Udhaar page (which lists
  //     closed sessions with a remaining balance via getDues()).
  const handlePaymentSuccess = async () => {
    if (!bill) return;

    try {
      await closeSession(bill.session.id);
      await refreshCustomerAndBill();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return null;
  }

  if (!customer) {
    return (
      <div className="empty-state">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="page">

      {/* Success toast */}
      {toast && (
        <div className="toast-success">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      <div className="details-header">
        <button
          className="back-button"
          onClick={() => navigate('/customers')}
        >
          <ArrowLeft size={18} />
          Customers
        </button>

        <div className="customer-profile">
          <div className="customer-avatar large">
            <User size={28} />
          </div>

          <div>
            <h1>{customer.name}</h1>
            {customer.phone && <p>{customer.phone}</p>}
          </div>
        </div>
      </div>

      {!bill ? (
        <div className="no-session">
          <div className="no-session-icon">
            <Play size={30} />
          </div>

          <h2>No Active Session</h2>

          <p>
            Start a new session for <strong>{customer.name}</strong>.
          </p>

          <button
            className="btn btn-primary"
            onClick={handleStartSession}
            disabled={starting}
          >
            {starting ? (
              <>
                <Loader2 size={18} className="spin" />
                Starting...
              </>
            ) : (
              <>
                <Play size={18} />
                Start Session
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="billing-layout">

          <div className="billing-main">

            <div className="action-card">
              <div className="section-title">
                <div>
                  <h3>Add Game</h3>
                  <span>Add a completed game</span>
                </div>
              </div>

              <div className="action-row">
                <div className="field">
                  <label>Game Type</label>
                  <input value="Snooker" disabled />
                </div>

                <div className="field">
                  <label>Rate</label>
                  <input
                    type="number"
                    min="0"
                    value={gameRate}
                    onChange={(e) => setGameRate(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary add-button"
                  onClick={handleAddGame}
                  disabled={addingGame}
                >
                  {addingGame ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Game
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="action-card">
              <div className="section-title">
                <div>
                  <h3>Add Canteen Item</h3>
                  <span>Add food or drink to customer bill</span>
                </div>
              </div>

              <div className="action-row">
                <div className="field product-field">
                  <label>Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — Rs. {Number(product.price).toFixed(0)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field quantity-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary add-button"
                  onClick={handleAddProduct}
                  disabled={addingItem}
                >
                  {addingItem ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Item
                    </>
                  )}
                </button>
              </div>
            </div>

            <GameList
              games={bill.session.games || []}
              onChanged={refreshBill}
            />

            <CanteenList
              items={bill.session.items || []}
              onChanged={refreshBill}
            />

          </div>

          <div className="billing-sidebar">
            <BillSummary
              gamesTotal={bill.games_total}
              canteenTotal={bill.canteen_total}
              total={bill.total}
              paid={bill.paid}
              remaining={bill.remaining}
            />

            <PaymentForm
              sessionId={bill.session.id}
              remaining={bill.remaining}
              onSuccess={handlePaymentSuccess}
              customerName={customer.name}
              games={bill.session.games || []}
              items={bill.session.items || []}
              gamesTotal={bill.games_total}
              canteenTotal={bill.canteen_total}
              total={bill.total}
              paid={bill.paid}
            />

            <button
              className="close-session-button"
              onClick={handleCloseSession}
            >
              Close Customer Session
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default CustomerDetails;