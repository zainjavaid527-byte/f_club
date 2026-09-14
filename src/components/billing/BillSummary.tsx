import {
  Calculator,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface BillSummaryProps {
  gamesTotal: number;
  canteenTotal: number;
  total: number;
  paid: number;
  remaining: number;
}

function BillSummary({
  gamesTotal,
  canteenTotal,
  total,
  paid,
  remaining,
}: BillSummaryProps) {
  return (
    <div className="bill-summary">

      <div className="summary-header">
        <div>
          <Calculator size={20} />
          <h3>Current Bill</h3>
        </div>
      </div>

      <div className="summary-row">
        <span>Games</span>
        <strong>
          Rs. {Number(gamesTotal).toFixed(0)}
        </strong>
      </div>

      <div className="summary-row">
        <span>Canteen</span>
        <strong>
          Rs. {Number(canteenTotal).toFixed(0)}
        </strong>
      </div>

      <div className="summary-divider" />

      <div className="summary-row total">
        <span>Total Bill</span>
        <strong>
          Rs. {Number(total).toFixed(0)}
        </strong>
      </div>

      <div className="summary-row paid">
        <span>Paid</span>
        <strong>
          Rs. {Number(paid).toFixed(0)}
        </strong>
      </div>

      <div
        className={`summary-row remaining ${
          remaining > 0 ? 'has-due' : 'fully-paid'
        }`}
      >
        <span>
          {remaining > 0 ? (
            <>
              <AlertCircle size={17} />
              Remaining / Udhaar
            </>
          ) : (
            <>
              <CheckCircle size={17} />
              Remaining
            </>
          )}
        </span>

        <strong>
          Rs. {Number(remaining).toFixed(0)}
        </strong>
      </div>

    </div>
  );
}

export default BillSummary;